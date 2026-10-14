#!/usr/bin/env python3
"""Arma el video completo de la petición (todas las tomas de la lista de la cabina).

Lee scripts/peticion.config.json y produce:
- public/policia/peticion.mp4        tomas unidas (render_edl.py) en escala de grises.
                                     Solo se rehace si cambian las tomas (ver peticion.mp4.json).
- public/policia/peticion-voz.wav    voz mejorada con la cadena de enhance_voice.py, cada toma
                                     a -16 LUFS (las tomas venían de -21 a -26 LUFS).
- public/policia/peticion-foley.wav  foley sintético alineado con tarjetas, subtítulos y cortes.
- public/policia/peticion-drama.wav  música de muestras reales (CC-BY 3.0) en tres secciones:
                                     censura (tensión alta), datos (fondo bajo), cierre (sube).
- src/campaign/peticion.json         subtítulos, tarjetas, cortes y duración para Peticion.tsx.

Subtítulos: las frases de "phrases" se alinean palabra por palabra con public/subs/<clip>.json.
Cada frase queda en pantalla hasta que empieza la siguiente (sin parpadeos en pausas cortas).

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
OUT = f"{ROOT}/public/policia"


def norm(w):
    w = re.sub(r"[^\wáéíóúñü]", "", w.lower())
    return w.translate(str.maketrans("áéíóú", "aeiou"))


def layout():
    """Inicio de cada toma en la línea de tiempo de salida y duración del video (sin la cola)."""
    starts, t = [], 0.0
    for s in SEGS:
        starts.append(round(t, 3))
        t += s["out"] - s["in"]
    return starts, round(t, 3)


def cuts(starts):
    """Cambios de clip (no los saltos dentro del mismo clip): ahí va el destello y el golpe."""
    return [starts[i] for i in range(1, len(SEGS)) if SEGS[i]["clip"] != SEGS[i - 1]["clip"]]


def captions(starts):
    out = []
    for i, s in enumerate(SEGS):
        words = [w for w in json.load(open(f"{ROOT}/public/subs/{s['clip']}.json", encoding="utf-8"))
                 if s["in"] - 0.02 <= w["startMs"] / 1000 < s["out"] - 0.1]
        k = 0
        seg_end = starts[i] + s["out"] - s["in"]
        for phrase in s["phrases"]:
            toks = phrase.split()
            group = words[k:k + len(toks)]
            got = [norm(w["text"]) for w in group]
            want = [norm(t.lstrip("*")) for t in toks]
            if got != want:
                sys.exit(f"{s['clip']} {s['in']}: la frase «{phrase}» no coincide con {got}")
            k += len(toks)
            frm = starts[i] + max(group[0]["startMs"] / 1000, s["in"]) - s["in"]
            end = starts[i] + group[-1]["endMs"] / 1000 - s["in"] + 0.15
            pieces = [{"t": t.lstrip("*") + " ", "y": t.startswith("*")} for t in toks]
            pieces[-1]["t"] = pieces[-1]["t"].rstrip()
            out.append({"from": round(frm, 3), "end": round(min(end, seg_end), 3), "segEnd": seg_end,
                        "pieces": pieces})
        if k != len(words):
            sys.exit(f"{s['clip']} {s['in']}: sobran palabras sin frase: {[w['text'] for w in words[k:]]}")
    # Cada frase dura hasta la siguiente si la pausa es corta (< 0.6 s), si no hasta su última
    # palabra; nunca pasa del final de su toma ni se empalma con la siguiente.
    for a, b in zip(out, out[1:] + [None]):
        to = a["end"]
        if b is not None and b["from"] - a["end"] < 0.6:
            to = b["from"] - 0.02
        to = min(to, a["segEnd"])
        if b is not None:
            to = min(to, b["from"] - 0.02)
        a["to"] = round(max(to, a["from"] + 0.4), 3)
    return [{"from": c["from"], "to": c["to"], "pieces": c["pieces"]} for c in out]


def cards(starts, total):
    out = []
    for c in CFG["cards"]:
        frm = starts[c["seg"]] + c["at"]
        to = min(frm + c["dur"], total)
        out.append({"from": round(frm, 3), "to": round(to, 3), "icon": c["icon"], "kicker": c.get("kicker", ""),
                    "text": c["text"], "color": c["color"], "fx": c["fx"]})
    return out


def render_video():
    """Une las tomas en color (render_edl.py) y las pasa a gris como la pieza de la censura.
    Se salta si peticion.mp4 ya tiene exactamente estas tomas."""
    dst = f"{OUT}/peticion.mp4"
    stamp = dst + ".json"
    key = [{"clip": s["clip"], "in": s["in"], "out": s["out"]} for s in SEGS]
    if os.path.exists(dst) and os.path.exists(stamp) and json.load(open(stamp)) == key:
        print("video sin cambios:", dst)
        return dst
    os.makedirs(f"{ROOT}/out", exist_ok=True)
    tmp = tempfile.mkdtemp(dir=f"{ROOT}/out")
    lst = os.path.join(tmp, "lista.json")
    json.dump({"timeline": key}, open(lst, "w", encoding="utf-8"))
    color = os.path.join(tmp, "color.mp4")
    subprocess.run([sys.executable, "-I", f"{ROOT}/scripts/render_edl.py", lst, color], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", color, "-vf", "hue=s=0,eq=contrast=1.12:brightness=-0.02",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", dst], check=True)
    os.remove(color)
    os.remove(lst)
    os.rmdir(tmp)
    json.dump(key, open(stamp, "w"))
    return dst


def voice(total):
    """Cada clip completo pasa por la cadena de enhance_voice.py (loudnorm sobre la toma entera, que
    es más estable que sobre tramos de 2 s); luego se cortan las tomas con fundidos de 10 ms."""
    clips = sorted({s["clip"] for s in SEGS})
    tmp = tempfile.mkdtemp(dir=f"{ROOT}/out")
    wavs = {}
    for c in clips:
        wavs[c] = os.path.join(tmp, f"{c}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{ROOT}/media/raw/{c}.MOV", "-vn",
                        "-af", VOICE_CHAIN, "-ar", "48000", "-ac", "1", wavs[c]], check=True)
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for c in clips:
        cmd += ["-i", wavs[c]]
    parts = []
    for i, s in enumerate(SEGS):
        d = s["out"] - s["in"]
        parts.append(f"[{clips.index(s['clip'])}:a]atrim=start={s['in']}:end={s['out']},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.01,afade=t=out:st={d - 0.01:.3f}:d=0.01[a{i}]")
    parts.append("".join(f"[a{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=0:a=1,"
                 f"apad=whole_dur={total + TAIL:.3f}[out]")
    dst = f"{OUT}/peticion-voz.wav"
    # El asplit de cada entrada hace falta cuando un clip aparece en varias tomas.
    counts = {c: sum(1 for s in SEGS if s["clip"] == c) for c in clips}
    pre, used = [], {c: 0 for c in clips}
    for c in clips:
        n = counts[c]
        idx = clips.index(c)
        pre.append(f"[{idx}:a]asplit={n}" + "".join(f"[s{idx}_{j}]" for j in range(n)))
    for i, s in enumerate(SEGS):
        idx = clips.index(s["clip"])
        parts[i] = parts[i].replace(f"[{idx}:a]", f"[s{idx}_{used[s['clip']]}]", 1)
        used[s["clip"]] += 1
    cmd += ["-filter_complex", ";".join(pre + parts), "-map", "[out]", "-ar", "48000", "-ac", "1", dst]
    subprocess.run(cmd, check=True)
    for w in wavs.values():
        os.remove(w)
    os.rmdir(tmp)
    return dst


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


def foley(length, caps, cds, starts):
    buf = np.zeros(int((length + 0.5) * SR))
    for c in caps:
        mf.place(buf, mf.click(0.3), c["from"])
    for t in cuts(starts):
        mf.place(buf, mf.whoosh(0.35, 600, 6000, 0.22, rise=True), t - 0.3)
        mf.place(buf, mf.thud(42, 0.8, 0.5), t)
    fx_at = [(c["from"], c["fx"]) for c in cds]
    for e in CFG.get("events", []):
        fx_at.append((starts[e["seg"]] + e["at"], e["fx"]))
    for t, fx in fx_at:
        if fx == "thud":
            mf.place(buf, mf.thud(55, 0.6, 0.8), t)
        elif fx == "whoosh":
            mf.place(buf, mf.whoosh(0.45, 400, 5000, 0.26, rise=True), t - 0.35)
        elif fx == "radio":
            mf.place(buf, mf.whoosh(0.45, 400, 5000, 0.26, rise=True), t - 0.35)
            mf.place(buf, mf.radio_beep(1000, 0.12, 0.22), t + 0.3)
            mf.place(buf, mf.radio_beep(1400, 0.12, 0.22), t + 0.48)
        elif fx == "shutter":
            for d in (0.0, 0.09, 0.22):
                mf.place(buf, mf.shutter(0.5), t + d)
        elif fx == "heart":
            mf.place(buf, mf.heart(0.6), t)
        elif fx == "final":
            mf.place(buf, mf.riser(0.8, 0.3), t - 0.8)
            mf.place(buf, mf.thud(40, 1.4, 1.0), t)
            mf.place(buf, mf.heart(0.5), t + 0.9)
    return buf


def drama(length, starts, total, cds):
    """Música en tres secciones (Re menor). Intensidad alta en la censura, fondo bajo mientras se
    explican los datos (para no competir con la voz) y subida hasta el golpe de «¿Qué es el FOT?»."""
    buf = np.zeros(int((length + 0.5) * mm.SR))
    a_end = starts[2]              # fin de la censura (cambio a IMG_1724)
    c_start = starts[5]            # inicio de IMG_1740 (segunda petición, FOT)
    final = cds[-1]["from"]        # golpe final en la tarjeta «¿Qué es el FOT?»

    def every(step, t0, t1, fn):
        t = t0
        while t < t1 - 1e-6:
            fn(t)
            t += step

    # A. Censura: chelo en corcheas, contrabajo sostenido y violín agudo que se abre.
    every(0.25, 0, a_end, lambda t: mm.place(buf, mm.note("cello", "Ds3", 0.22, 0.42, 0.005, 0.15), t))
    every(2.0, 0, a_end, lambda t: mm.place(buf, mm.note("contrabass", "D2", 1.9, 0.85, 0.03, 0.5), t))
    mm.place(buf, mm.note("violin", "A5", a_end - 2.6, 0.38, 1.6, 0.8), 2.6)

    # B. Datos: chelo en negras suave, contrabajo cada 4 s y notas de piano agudo espaciadas.
    every(0.5, a_end, c_start, lambda t: mm.place(buf, mm.note("cello", "D3", 0.45, 0.2, 0.01, 0.2), t))
    every(4.0, a_end, c_start, lambda t: mm.place(buf, mm.note("contrabass", "D2", 3.6, 0.55, 0.05, 1.0), t))
    for k, t in enumerate(np.arange(a_end + 1.0, c_start, 2.0)):
        mm.place(buf, mm.note("piano", ["A5", "F5", "D5", "E5"][k % 4], 1.6, 0.16, 0.005, 0.8), t)

    # C. Cierre: vuelve la corchea, contrabajo cada 1 s y violín que sube hasta el golpe final.
    every(0.25, c_start, final, lambda t: mm.place(buf, mm.note("cello", "Ds3", 0.22, 0.38, 0.005, 0.15), t))
    every(1.0, c_start, final, lambda t: mm.place(buf, mm.note("contrabass", "D2", 0.9, 0.75, 0.02, 0.3), t))
    mm.place(buf, mm.note("violin", "A5", final - c_start, 0.32, 3.0, 0.4), c_start)
    for name, inst, g in (("D2", "contrabass", 0.9), ("D3", "cello", 0.6), ("A3", "cello", 0.5), ("D5", "violin", 0.3)):
        mm.place(buf, mm.note(inst, name, length - final + 0.3, g, 0.01, 1.6), final)
    return mm.reverb(buf, secs=1.8, wet=0.2)


def main():
    starts, total = layout()
    length = total + TAIL
    caps = captions(starts)
    cds = cards(starts, length)

    dst = render_video()
    voice(total)
    write_wav(f"{OUT}/peticion-foley.wav", foley(length, caps, cds, starts))
    write_wav(f"{OUT}/peticion-drama.wav", drama(length, starts, total, cds))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/peticion-drama.wav", "-af",
                    "loudnorm=I=-18:TP=-1.5:LRA=11", "-ar", "48000", f"{OUT}/peticion-drama.n.wav"], check=True)
    os.replace(f"{OUT}/peticion-drama.n.wav", f"{OUT}/peticion-drama.wav")

    data = {"fps": FPS, "videoDuration": total, "duration": round(length, 3), "cuts": cuts(starts),
            "captions": caps, "cards": cds}
    json.dump(data, open(f"{ROOT}/src/campaign/peticion.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("video", dst, "duración", total, "s + cierre", TAIL, "s")
    print("subtítulos", len(caps), "tarjetas", len(cds), "cortes", cuts(starts))


if __name__ == "__main__":
    main()
