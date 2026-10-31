#!/usr/bin/env python3
"""Video de la marcha (IMG_3804): base vertical y foley para src/campaign/Marcha.tsx.

- public/marcha/base.mp4   1080x1920, 30 fps, recorte central del original (1440x1920 tras rotar),
                           audio original de la marcha normalizado a -16 LUFS.
- public/marcha/foley.wav  clic en cada línea, barrido al cambiar de frase, golpe en CAMBIO y LEY,
                           tic-tac mientras LIBERTAD cambia de tipografía y golpe final al fijarse.
Tiempos en src/campaign/marcha.json.

Uso: python3 scripts/build_marcha.py
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import make_foley as mf  # noqa: E402

SRC = f"{ROOT}/media/marcha/IMG_3804.MOV"
OUT = f"{ROOT}/public/marcha"
DATA = json.load(open(f"{ROOT}/src/campaign/marcha.json", encoding="utf-8"))


def base():
    dst = f"{OUT}/base.mp4"
    if os.path.exists(dst):
        print("base ya existe:", dst)
        return
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC,
                    "-vf", "scale=-2:1920:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p,setsar=1",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-c:a", "aac", "-b:a", "256k", "-ac", "2",
                    "-movflags", "+faststart", dst], check=True)


def foley():
    buf = np.zeros(int((DATA["duration"] + 0.5) * mf.SR))
    for i, p in enumerate(DATA["phrases"]):
        if i:
            mf.place(buf, mf.whoosh(0.4, 500, 6000, 0.24, rise=True), p["from"] - 0.3)
        for line in p["lines"]:
            mf.place(buf, mf.click(0.32), line["at"])
            if line["style"] in ("cambio", "ley"):
                mf.place(buf, mf.thud(52, 0.6, 0.75), line["at"])
            if line["style"] == "libertad":
                end = line["cycleUntil"]
                t, k = line["at"], 0
                half = line["at"] + (end - line["at"]) / 2
                while t < end - 0.02:
                    mf.place(buf, mf.click(0.18), t)
                    t += 3 / 30 if t < half else 6 / 30
                    k += 1
                mf.place(buf, mf.riser(0.7, 0.25), end - 0.7)
                mf.place(buf, mf.thud(40, 1.4, 1.0), end)
    buf = buf / max(1e-9, np.max(np.abs(buf))) * 10 ** (-3 / 20)
    pcm = (np.stack([buf, buf], 1) * 32767).astype("<i2")
    import wave
    tmp = f"{OUT}/_foley.wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(mf.SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ar", "48000", f"{OUT}/foley.wav"], check=True)
    os.remove(tmp)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    base()
    foley()
    print("listo", OUT)
