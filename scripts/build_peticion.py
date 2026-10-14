#!/usr/bin/env python3
"""Arma el video completo de la petición (todas las tomas de la lista de la cabina).

Lee scripts/peticion.config.json y produce:
- public/policia/peticion-base.mp4    tomas unidas en COLOR (render_edl.py), sin cortes de pausas.
                                      Solo se rehace si cambian las tomas (ver peticion-base.mp4.json).
- public/policia/peticion-voz.wav     voz mejorada con la cadena de enhance_voice.py, cada toma a
                                      -16 LUFS, en la misma línea de tiempo que la base.
- public/policia/peticion-foley.wav   foley sintético alineado con tarjetas, subtítulos y cortes.
- public/policia/peticion-drama.wav   música de muestras reales (CC-BY 3.0) en tres secciones.
- src/campaign/peticion.json          tramos que se conservan, subtítulos, tarjetas y duración.

Cortes de pausas ("que hable de seguido", como en el video de campaña): dentro de cada toma se
quita todo tramo de al menos `minSilence` s donde (1) el audio está por debajo de un umbral que se
adapta al ruido de esa toma y (2) la transcripción no tiene ninguna palabra. Exigir las dos cosas
evita comerse sílabas suaves. También se recorta el silencio antes de la primera palabra y después
de la última. Los tramos se ajustan a cuadros (30 fps) para que imagen y voz cuadren.

Uso: python3 scripts/build_peticion.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import make_foley as mf  # noqa: E402
import make_music as mm  # noqa: E402
from enhance_voice import CHAIN as VOICE_CHAIN  # noqa: E402

SR = 48000
FPS = 30
CFG = json.load(open(f"{ROOT}/scripts/peticion.config.json", encoding="utf-8"))
SEGS = CFG["segments"]
TAIL = CFG.get("tail", 0.0)
PAUSE = CFG["pause"]
# Velocidad de la voz e imagen (atempo en Remotion: el tono no cambia).
SPEED = CFG.get("speed", 1.0)
FIX = CFG.get("corrections", {})
OUT = f"{ROOT}/public/policia"


def norm(w):
    w = re.sub(r"[^\wáéíóúñü]", "", w.lower())
    return w.translate(str.maketrans("áéíóú", "aeiou"))


def seg_dur(s):
    """Duración de la toma en la base: redondeada a cuadros, igual que render_edl.py."""
    return round((s["out"] - s["in"]) * FPS) / FPS


def layout():
    """Inicio de cada toma en la base (sin cortes de pausas) y duración de la base."""
    starts, t = [], 0.0
    for s in SEGS:
        starts.append(round(t, 3))
        t += seg_dur(s)
    return starts, round(t, 3)


def seg_words(s):
    words = []
    for w in json.load(open(f"{ROOT}/public/subs/{s['clip']}.json", encoding="utf-8")):
        lo = s.get("wordsIn", s.get("keepIn", s["in"])) - 0.02
        hi = s.get("wordsOut", s.get("keepOut", s["out"]) - 0.1)
        if lo <= w["startMs"] / 1000 < hi:
            w = dict(w)
            w["text"] = FIX.get(w["text"].strip(), w["text"].strip())
            words.append(w)
    return words


# ---------- base: video en color y voz ----------

def render_base():
    dst = f"{OUT}/peticion-base.mp4"
    stamp = dst + ".json"
    key = [{"clip": s["clip"], "in": s["in"], "out": s["out"]} for s in SEGS]
    if os.path.exists(dst) and os.path.exists(stamp) and json.load(open(stamp)) == key:
        print("base sin cambios:", dst)
        return dst
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    tmp = tempfile.mkdtemp(dir=f"{ROOT}/out")
    lst = os.path.join(tmp, "lista.json")
    json.dump({"timeline": key}, open(lst, "w", encoding="utf-8"))
    subprocess.run([sys.executable, "-I", f"{ROOT}/scripts/render_edl.py", lst, dst], check=True)
    os.remove(lst)
    os.rmdir(tmp)
    json.dump(key, open(stamp, "w"))
    return dst


def voice(total):
    """Cada clip completo pasa por la cadena de enhance_voice.py (loudnorm sobre la toma entera, más
    estable que sobre tramos cortos); luego se cortan las tomas con fundidos de 10 ms."""
    clips = sorted({s["clip"] for s in SEGS})
    tmp = tempfile.mkdtemp(dir=f"{ROOT}/out")
    wavs = {}
    for c in clips:
        wavs[c] = os.path.join(tmp, f"{c}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{ROOT}/media/raw/{c}.MOV", "-vn",
                        "-af", VOICE_CHAIN, "-ar", "48000", "-ac", "1", wavs[c]], check=True)
    counts = {c: sum(1 for s in SEGS if s["clip"] == c) for c in clips}
    pre = [f"[{clips.index(c)}:a]asplit={counts[c]}" + "".join(f"[s{clips.index(c)}_{j}]" for j in range(counts[c]))
           for c in clips]
    used = {c: 0 for c in clips}
    parts = []
    for i, s in enumerate(SEGS):
        idx = clips.index(s["clip"])
        d = seg_dur(s)
        parts.append(f"[s{idx}_{used[s['clip']]}]atrim=start={s['in']}:end={s['in'] + d:.4f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.01,afade=t=out:st={d - 0.01:.3f}:d=0.01[a{i}]")
        used[s["clip"]] += 1
    parts.append("".join(f"[a{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=0:a=1,"
                 f"apad=whole_dur={total + 1:.3f}[out]")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for c in clips:
        cmd += ["-i", wavs[c]]
    dst = f"{OUT}/peticion-voz.wav"
    cmd += ["-filter_complex", ";".join(pre + parts), "-map", "[out]", "-ar", "48000", "-ac", "1", dst]
    subprocess.run(cmd, check=True)
    for w in wavs.values():
        os.remove(w)
    os.rmdir(tmp)
    return dst


# ---------- cortes de pausas ----------

def envelope(path, hop=0.01):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32)
    n = int(hop * 16000)
    k = len(x) // n
    return 20 * np.log10(np.sqrt(np.mean(x[: k * n].reshape(k, n) ** 2, 1)) + 1e-9), hop


def keep_ranges(starts):
    """Tramos de la base que se conservan, en cuadros: [{seg, base, dur}] (base y dur en cuadros)."""
    db, hop = envelope(f"{OUT}/peticion-voz.wav")
    ranges = []
    for i, s in enumerate(SEGS):
        # keepOut: usar solo hasta ese punto de la toma sin volver a renderizar la base.
        seg_len = s.get("keepOut", s["out"]) - s["in"]
        b0 = starts[i]
        words = seg_words(s)
        lo = int(b0 / hop)
        hi = int((b0 + seg_len) / hop)
        env = db[lo:hi]
        floor, speech = np.percentile(env, 10), np.percentile(env, 90)
        thr = floor + PAUSE["threshold"] * (speech - floor)
        quiet = env < thr
        # Los tiempos por palabra de la transcripción vienen pegados y corridos hasta 0.2 s (la pausa
        # queda dentro de una palabra), así que la pausa se decide solo por el audio: el umbral está
        # al 30 % entre el ruido de fondo y la voz de esa toma, y se deja margen a los dos lados.
        cuts = []
        k = 0
        while k < len(quiet):
            if quiet[k]:
                j = k
                while j < len(quiet) and quiet[j]:
                    j += 1
                a, b = k * hop, j * hop
                if b - a >= PAUSE["minSilence"]:
                    ca, cb = a + PAUSE["padAfter"], b - PAUSE["padBefore"]
                    if cb - ca >= PAUSE["minCut"]:
                        cuts.append((ca, cb))
                k = j
            else:
                k += 1
        if os.environ.get("PAUSAS"):
            for a, b in cuts:
                prev = [w["text"] for w in words if w["startMs"] / 1000 - s["in"] <= a][-1:]
                nxt = [w["text"] for w in words if w["startMs"] / 1000 - s["in"] >= b][:1]
                print(f"   corte {a:5.2f}-{b:5.2f} ({b - a:.2f} s) entre {prev} y {nxt}")
        # Silencio antes de la primera palabra y después de la última: por el AUDIO (primer y último
        # instante sobre el umbral), no por la transcripción, cuyos tiempos vienen corridos y
        # podían comerse el final de la última palabra.
        n_eff = min(len(env), int(seg_len / hop))
        loud = np.nonzero(env[:n_eff] >= thr)[0]
        first = max(0.0, loud[0] * hop - PAUSE["padBefore"]) if len(loud) else 0.0
        # keepIn: empezar la toma más tarde sin volver a renderizar la base.
        first = max(first, s.get("keepIn", s["in"]) - s["in"])
        last = min(seg_len, (loud[-1] + 1) * hop + PAUSE["padAfter"]) if len(loud) else seg_len
        keep, t = [], first
        for a, b in cuts:
            if b <= first or a >= last:
                continue
            if a > t:
                keep.append((t, a))
            t = max(t, b)
        if last > t:
            keep.append((t, last))
        # Un tramo de menos de 0.3 s se vería como un parpadeo: se une con el vecino (se deja la
        # pausa entre los dos) en vez de quitarlo, porque puede llevar una palabra corta.
        merged = True
        while merged and len(keep) > 1:
            merged = False
            for k, (a, b) in enumerate(keep):
                if b - a < 0.3:
                    j = k - 1 if k == len(keep) - 1 or (k > 0 and a - keep[k - 1][1] < keep[k + 1][0] - b) else k + 1
                    lo, hi = min(k, j), max(k, j)
                    keep[lo:hi + 1] = [(keep[lo][0], keep[hi][1])]
                    merged = True
                    break
        for a, b in keep:
            fa, fb = round((b0 + a) * FPS), round((b0 + b) * FPS)
            if fb - fa >= 3:
                ranges.append({"seg": i, "base": fa, "dur": fb - fa, "gray": bool(s.get("gray"))})
        removed = seg_len - sum(b - a for a, b in keep)
        print(f"{s['clip']} {s['in']:>5}: {len(keep)} tramos, se quitan {removed:.2f} s de pausas")
    t = 0
    for r in ranges:
        r["out"] = t
        r["speed"] = SEGS[r["seg"]].get("speed", SPEED)
        r["outDur"] = max(1, round(r["dur"] / r["speed"]))
        t += r["outDur"]
    return ranges, t


def mapper(ranges, starts):
    """Convierte un tiempo de la toma ORIGINAL (seg, segundos desde 'in') a segundos de salida.
    Un instante que cae en una pausa quitada va al inicio del tramo siguiente."""
    def to_out(seg, rel):
        fb = (starts[seg] + rel) * FPS
        mine = [r for r in ranges if r["seg"] == seg]
        for r in mine:
            if fb < r["base"]:
                return r["out"] / FPS
            if fb <= r["base"] + r["dur"]:
                return (r["out"] + (fb - r["base"]) / r["speed"]) / FPS
        return (mine[-1]["out"] + mine[-1]["outDur"]) / FPS
    return to_out


# ---------- subtítulos y tarjetas (en segundos de salida) ----------

def captions(to_out, ranges):
    out = []
    for i, s in enumerate(SEGS):
        words = seg_words(s)
        mine = [r for r in ranges if r["seg"] == i]
        seg_end = (mine[-1]["out"] + mine[-1]["outDur"]) / FPS
        k = 0
        for phrase in s["phrases"]:
            toks = phrase.split()
            group = words[k:k + len(toks)]
            got = [norm(w["text"]) for w in group]
            want = [norm(t.lstrip("*")) for t in toks]
            if got != want:
                sys.exit(f"{s['clip']} {s['in']}: la frase «{phrase}» no coincide con {got}")
            k += len(toks)
            frm = to_out(i, max(group[0]["startMs"] / 1000 - s["in"], 0))
            end = to_out(i, group[-1]["endMs"] / 1000 - s["in"]) + 0.15
            pieces = [{"t": t.lstrip("*") + " ", "y": t.startswith("*")} for t in toks]
            pieces[-1]["t"] = pieces[-1]["t"].rstrip()
            out.append({"from": frm, "end": min(end, seg_end), "segEnd": seg_end, "pieces": pieces})
        if k != len(words):
            sys.exit(f"{s['clip']} {s['in']}: sobran palabras sin frase: {[w['text'] for w in words[k:]]}")
    # Cada frase dura hasta la siguiente si la pausa es corta (< 0.6 s); nunca pasa del final de
    # su toma ni se empalma con la siguiente.
    for a, b in zip(out, out[1:] + [None]):
        to = a["end"]
        if b is not None and b["from"] - a["end"] < 0.6:
            to = b["from"] - 0.02
        to = min(to, a["segEnd"])
        if b is not None:
            to = min(to, b["from"] - 0.02)
        a["to"] = max(to, a["from"] + 0.4)
    return [{"from": round(c["from"], 3), "to": round(c["to"], 3), "pieces": c["pieces"]} for c in out]


def cards(to_out, length):
    out = []
    for c in CFG["cards"]:
        frm = to_out(c["seg"], c["at"])
        to = length if c.get("toEnd") else to_out(c["seg"], c["at"] + c["dur"])
        out.append({"from": round(frm, 3), "to": round(min(to, length), 3), "icon": c["icon"],
                    "kicker": c.get("kicker", ""), "text": c["text"], "color": c["color"], "fx": c["fx"]})
    return out


# ---------- audio de apoyo ----------

def write_wav(path, x, peak_db=-3):
    """x: mono (n,) o estéreo (n, 2)."""
    stereo = np.stack([x, x], 1) if x.ndim == 1 else x
    stereo = stereo / max(1e-9, np.max(np.abs(stereo))) * 10 ** (peak_db / 20)
    pcm = (stereo * 32767).astype("<i2")
    tmp = path + ".tmp.wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ar", "48000", "-ac", "2", path], check=True)
    os.remove(tmp)


def foley(length, caps, cds, clip_cuts):
    buf = np.zeros(int((length + 0.5) * SR))
    for c in caps:
        mf.place(buf, mf.click(0.3), c["from"])
    for t in clip_cuts:
        mf.place(buf, mf.whoosh(0.35, 600, 6000, 0.22, rise=True), t - 0.3)
        mf.place(buf, mf.thud(42, 0.8, 0.5), t)
    for c in cds:
        t, fx = c["from"], c["fx"]
        if fx == "thud":
            mf.place(buf, mf.thud(55, 0.6, 0.8), t)
        elif fx == "whoosh":
            mf.place(buf, mf.whoosh(0.45, 400, 5000, 0.26, rise=True), t - 0.35)
        elif fx == "shutter":
            for d in (0.0, 0.09, 0.22):
                mf.place(buf, mf.shutter(0.5), t + d)
        elif fx == "final":
            mf.place(buf, mf.riser(0.8, 0.3), t - 0.8)
            mf.place(buf, mf.thud(40, 1.4, 1.0), t)
            mf.place(buf, mf.heart(0.5), t + 0.9)
    return buf


def musica(length, a_end, c_start, final):
    """Música propia de esta pieza, distinta de la del video de campaña (aquella es Re menor con
    ostinato de chelo; esta es Fa menor llevada por PIANO, sin chelo): un pulso grave de piano tipo
    latido, acordes espaciados mientras explica los datos y un violín que sube hasta el golpe de
    «¿Qué es el POT?». Muestras reales de tonejs-instruments (CC-BY 3.0)."""
    buf = np.zeros(int((length + 0.5) * mm.SR))
    p = lambda inst, n, d, g, a=0.005, r=0.4: mm.note(inst, n, d, g, a, r)  # noqa: E731

    def every(step, t0, t1, fn):
        t = t0
        while t < t1 - 1e-6:
            fn(t)
            t += step

    def latido(t, g):
        mm.place(buf, p("piano", "F1", 0.5, g), t)
        mm.place(buf, p("piano", "F2", 0.5, g * 0.8), t)
        mm.place(buf, p("piano", "F1", 0.45, g * 0.6), t + 0.22)

    # A. Censura (toma en gris): latido grave cada 1.2 s, notas altas que rozan (Do6 / Do#6)
    #    y un violín agudo que entra despacio.
    every(1.2, 0, a_end, lambda t: latido(t, 0.75))
    for k, t in enumerate(np.arange(0.6, a_end, 2.4)):
        mm.place(buf, p("piano", ["C6", "Cs6"][k % 2], 2.0, 0.13, 0.005, 1.2), t)
    mm.place(buf, p("violin", "F5", a_end - 1.0, 0.22, 2.0, 1.0), 1.0)
    mm.place(buf, p("contrabass", "F1", a_end, 0.45, 0.4, 1.0), 0.0)

    # B. Datos: acordes de piano espaciados (Fam - Reb - Lab - Mib) y un latido suave cada 2.4 s.
    chords = [("F3", "Gs3", "C4"), ("Cs3", "F3", "Gs3"), ("Gs2", "C3", "Ds3"), ("Ds3", "G3", "As3")]
    for k, t in enumerate(np.arange(a_end, c_start, 2.4)):
        for n in chords[k % 4]:
            mm.place(buf, p("piano", n, 2.3, 0.16, 0.01, 1.2), t)
        mm.place(buf, p("piano", "F1", 0.5, 0.35), t)

    # C. Cierre: el latido se acelera (cada 0.6 s), violín que sube Fa -> Lab -> Do hasta el golpe.
    every(0.6, c_start, final, lambda t: latido(t, 0.7))
    span = final - c_start
    for k, n in enumerate(("F5", "Gs5", "C6")):
        mm.place(buf, p("violin", n, span / 3 + 0.3, 0.22 + 0.04 * k, 0.6, 0.4), c_start + k * span / 3)
    for n, inst, g in (("F1", "piano", 1.0), ("C2", "piano", 0.8), ("F2", "piano", 0.8), ("Gs2", "piano", 0.6),
                       ("F1", "contrabass", 0.7), ("F5", "violin", 0.25)):
        mm.place(buf, p(inst, n, length - final + 0.3, g, 0.005, 1.6), final)
    return mm.reverb(buf, secs=2.2, wet=0.25)


def main():
    starts, base_total = layout()
    render_base()
    voice(base_total)
    ranges, frames = keep_ranges(starts)
    video = frames / FPS
    length = video + TAIL
    to_out = mapper(ranges, starts)

    caps = captions(to_out, ranges)
    cds = cards(to_out, length)
    # Evidencia del derecho de petición (recortes del correo): mismos tiempos de toma original.
    evs = [{"from": round(to_out(e["seg"], e["at"]), 3), "to": round(to_out(e["seg"], e["at"] + e["dur"]), 3),
            "img": e["img"], "title": e["title"], "quote": e.get("quote", ""), "fx": e["fx"]}
           for e in CFG.get("evidence", [])]
    seg_start = {i: min(r["out"] for r in ranges if r["seg"] == i) / FPS for i in range(len(SEGS))}
    clip_cuts = [seg_start[i] for i in range(1, len(SEGS)) if SEGS[i]["clip"] != SEGS[i - 1]["clip"]]
    gray_end = max((r["out"] + r["outDur"]) / FPS for r in ranges if r["gray"]) if any(r["gray"] for r in ranges) \
        else seg_start[1]

    write_wav(f"{OUT}/peticion-foley.wav", foley(length, caps, cds + evs, clip_cuts))
    write_wav(f"{OUT}/peticion-drama.wav", musica(length, gray_end, seg_start[len(SEGS) - 1], cds[-1]["from"]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/peticion-drama.wav", "-af",
                    "loudnorm=I=-18:TP=-1.5:LRA=11", "-ar", "48000", f"{OUT}/peticion-drama.n.wav"], check=True)
    os.replace(f"{OUT}/peticion-drama.n.wav", f"{OUT}/peticion-drama.wav")

    data = {"fps": FPS, "speed": SPEED, "videoFrames": frames, "duration": round(length, 3),
            "cuts": [round(t, 3) for t in clip_cuts],
            "ranges": [{"seg": r["seg"], "base": r["base"], "dur": r["dur"], "out": r["out"], "outDur": r["outDur"],
                        "speed": r["speed"],
                        "gray": r["gray"]}
                       for r in ranges],
            "captions": caps, "cards": cds, "evidence": evs}
    json.dump(data, open(f"{ROOT}/src/campaign/peticion.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"base {base_total:.2f} s -> con cortes {video:.2f} s + cierre {TAIL} s; {len(ranges)} tramos")
    print("subtítulos", len(caps), "tarjetas", len(cds), "cambios de clip", clip_cuts)


if __name__ == "__main__":
    main()
