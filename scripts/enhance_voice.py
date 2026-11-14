#!/usr/bin/env python3
"""Mejora la voz de cada master y la deja en public/voice/<video>.wav (misma línea de
tiempo que el master, para usarla con los mismos trimBefore/trimAfter en Remotion).

Cadena (ffmpeg): paso alto 80 Hz -> reducción de ruido (afftdn) -> -2.5 dB en 250 Hz
(barro) -> +3 dB en 3.2 kHz (presencia/inteligibilidad) -> de-esser -> compresor 3:1
-> loudnorm a -16 LUFS (todas las tomas al mismo nivel; la referencia de Duvalier
está en -17 LUFS mezclada).
Uso: python3 scripts/enhance_voice.py [video ...]   (por defecto, los de vigilante.json)
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAIN = ",".join([
    "highpass=f=80:poles=2",
    "afftdn=nr=10:nf=-42:tn=1",
    "equalizer=f=250:t=q:w=1.0:g=-2.5",
    "equalizer=f=3200:t=q:w=1.2:g=3",
    "deesser=i=0.4",
    "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2",
    "loudnorm=I=-16:TP=-1.5:LRA=7",
])


def main():
    if len(sys.argv) > 1:
        videos = sys.argv[1:]
    else:
        d = json.load(open(f"{ROOT}/src/campaign/vigilante.json"))
        videos = sorted({s["video"] for s in d["segments"]})
    os.makedirs(f"{ROOT}/public/voice", exist_ok=True)
    for v in videos:
        out = f"{ROOT}/public/voice/{v}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{ROOT}/public/master/{v}.mov", "-vn",
                        "-af", CHAIN, "-ar", "48000", "-ac", "1", out], check=True)
        print("voz mejorada:", out)


if __name__ == "__main__":
    main()
