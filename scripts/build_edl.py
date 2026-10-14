#!/usr/bin/env python3
"""Genera src/campaign/vigilante.json (cortes, subtítulos y tarjetas) siguiendo estilo.md.

Entrada: scripts/vigilante.config.json, public/subs/<clip>.json (palabras con tiempos)
y media/audio/<clip>.wav (detección de silencios).
- Corta todo silencio > 0.30 s (-35 dB), con 0.05 s de margen.
- Ningún plano > 2.2 s sin cambio de encuadre (se parte en el hueco entre palabras más
  cercano a la mitad).
- Subtítulos base (estilo Duvalier): frases de máx. 6 palabras / 30 caracteres, corte en
  puntuación o pausa > 0.35 s.
- Énfasis (tipografía cinética): cada línea aparece en una palabra concreta, con clic.
Uso: python3 scripts/build_edl.py
"""
import json
import os
import re
import subprocess
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 60
SIL_DB, SIL_MIN, PAD = -35, 0.30, 0.05
MAX_SHOT = 2.2


def silences(name, a, b):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-ss", str(a), "-t", str(b - a), "-i", f"{ROOT}/media/audio/{name}.wav",
         "-af", f"silencedetect=n={SIL_DB}dB:d={SIL_MIN}", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    starts = [float(x) + a for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) + a for x in re.findall(r"silence_end: ([\d.]+)", out)]
    if len(ends) < len(starts):
        ends.append(b)
    return list(zip(starts, ends))


def speech(name, a, b):
    runs, t = [], a
    for s, e in silences(name, a, b):
        if s > t:
            runs.append([max(a, t - PAD), min(b, s + PAD)])
        t = e
    if t < b:
        runs.append([max(a, t - PAD), b])
    return [r for r in runs if r[1] - r[0] > 0.12]


def split_long(run, words):
    """Parte un tramo largo en planos <= MAX_SHOT, cortando entre palabras."""
    a, b = run
    if b - a <= MAX_SHOT:
        return [run]
    n = int((b - a) // MAX_SHOT) + 1
    cuts = []
    for k in range(1, n):
        target = a + (b - a) * k / n
        starts = [w["s"] for w in words if a + 0.3 < w["s"] < b - 0.3]
        cuts.append(min(starts, key=lambda s: abs(s - target)) if starts else target)
    edges = [a] + sorted(set(cuts)) + [b]
    return [[edges[i], edges[i + 1]] for i in range(len(edges) - 1)]


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def main():
    cfg = json.load(open(f"{ROOT}/scripts/vigilante.config.json"))
    segs, words_tl, clips, texts, cards = [], [], [], [], []
    t = 0
    for ci, c in enumerate(cfg["clips"]):
        name = c["file"]
        words = [{"text": w["text"].strip(), "s": w["startMs"] / 1000, "e": w["endMs"] / 1000}
                 for w in json.load(open(f"{ROOT}/public/subs/{name}.json"))]
        clip_start = t
        shot = 0
        # "ranges": tramos sueltos dentro del clip (p. ej. inicio recortado a ~4 s).
        runs = [r for a_, b_ in c.get("ranges", [[c["in"], c["out"]]]) for r in speech(name, a_, b_)]
        # El detector a -35 dB se come ataques suaves: si una palabra empieza hasta 0.45 s antes
        # del tramo, el tramo arranca 0.05 s antes de esa palabra (sin pisar el tramo anterior).
        for ri, r in enumerate(runs):
            floor = max(runs[ri - 1][1] if ri else c["in"],
                        next((a_ for a_, b_ in c.get("ranges", []) if a_ <= r[0] < b_), c["in"]))
            early = [w["s"] for w in words if r[0] - 0.45 <= w["s"] < r[0] and w["s"] >= floor]
            if early:
                r[0] = max(floor, min(early) - 0.05)
        for run in runs:
            pieces = split_long(run, words)
            for pi, (a, b) in enumerate(pieces):
                fa, fb = round(a * FPS), round(b * FPS)
                if fb - fa < 6:
                    continue
                off = round(c.get("videoOffset", 0) * FPS)  # el master puede empezar en otro segundo
                segs.append({"file": name, "video": c.get("video", name), "trimBefore": fa - off, "trimAfter": fb - off, "from": t, "clipIndex": ci,
                             "zoom": 1.0,
                             "jump": shot > 0, "grayscale": bool(c.get("grayscale"))})
                # Palabras que empiezan dentro de este plano -> tiempo en la línea de tiempo.
                for w in words:
                    if a <= w["s"] < b:
                        st = t + round((w["s"] - a) * FPS)
                        en = t + round((min(w["e"], b) - a) * FPS)
                        words_tl.append({"text": w["text"], "start": st, "end": max(en, st + 6),
                                         "src": (name, w["s"])})
                t += fb - fa
                shot += 1
        clips.append({"file": name, "from": clip_start, "to": t})
        if c.get("credential"):
            texts.append({"text": c["credential"], "from": clip_start + round(0.3 * FPS), "dur": round(2.6 * FPS)})

    # Tarjetas: en la primera aparición de la palabra en ese clip.
    for card in cfg["cards"]:
        w = next((w for w in words_tl if w["src"][0] == card["file"] and norm(w["text"]).startswith(norm(card["word"]))), None)
        if w:
            cards.append({"text": card["text"], "icon": card["icon"], "from": w["start"], "dur": round(1.1 * FPS)})
        else:
            print("AVISO: no encontré", card["word"], "en", card["file"])

    # Énfasis: cada línea aparece en la n-ésima palabra "at" del clip (o "atS" s tras el inicio).
    clip_from = {c["file"]: c["from"] for c in clips}
    clip_to = {c["file"]: c["to"] for c in clips}
    emphasis = []
    for e in cfg.get("emphasis", []):
        lines = []
        for ln in e["lines"]:
            if "atS" in ln:
                f0 = clip_from[e["file"]] + round(ln["atS"] * FPS)
            else:
                cands = [w for w in words_tl if w["src"][0] == e["file"] and norm(w["text"]) == norm(ln["at"])]
                n = ln.get("n", 1)
                if len(cands) < n:
                    print("AVISO: no encontré", ln["at"], "en", e["file"])
                    continue
                f0 = cands[n - 1]["start"]
            lines.append({"text": ln["text"], "font": ln["font"], "color": ln.get("color", "white"), "from": f0})
        if not lines:
            continue
        a = min(l["from"] for l in lines)
        b = min(max(l["from"] for l in lines) + round(e.get("hold", 1.0) * FPS), clip_to[e["file"]])
        emphasis.append({"style": e["style"], "from": a, "to": b, "lines": lines})
    emphasis.sort(key=lambda e: e["from"])
    for i in range(len(emphasis) - 1):
        emphasis[i]["to"] = min(emphasis[i]["to"], emphasis[i + 1]["from"])
    for e in emphasis:
        for card in cards:  # no pisar las tarjetas gráficas
            if e["from"] < card["from"] < e["to"]:
                e["to"] = card["from"]

    # Subtítulos base.
    pages, cur = [], []
    for i, w in enumerate(words_tl):
        cur.append(w)
        nxt = words_tl[i + 1] if i + 1 < len(words_tl) else None
        chars = sum(len(x["text"]) + 1 for x in cur)
        brk = (nxt is None or nxt["src"][0] != w["src"][0] or len(cur) >= 6 or w["text"][-1:] in ".?!"
               or (w["text"][-1:] == "," and len(cur) >= 3) or nxt["start"] - w["end"] > 0.35 * FPS
               or chars + len(nxt["text"]) > 30)
        if brk:
            pages.append({"from": cur[0]["start"], "text": " ".join(x["text"] for x in cur),
                          "words": [{"text": x["text"], "start": x["start"], "end": x["end"]} for x in cur]})
            cur = []
    for i, p in enumerate(pages):
        p["to"] = pages[i + 1]["from"] if i + 1 < len(pages) else p["words"][-1]["end"]
        p["to"] = min(p["to"], p["words"][-1]["end"] + 30)

    out = {"fps": FPS, "hook": cfg["hook"], "segments": segs, "clips": clips, "texts": texts,
           "cards": cards, "pages": pages, "emphasis": emphasis,
           "clicks": [l["from"] for e in emphasis for l in e["lines"]], "clipsEnd": t}
    json.dump(out, open(f"{ROOT}/src/campaign/vigilante.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(segs)} planos, {len(pages)} bloques de subtítulos, {len(cards)} tarjetas, {len(emphasis)} énfasis, {t / FPS:.1f} s + cierre")


if __name__ == "__main__":
    main()
