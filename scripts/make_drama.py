#!/usr/bin/env python3
"""Música dramática para el momento de la censura y la llegada de la Policía (clip IMG_1698).

Usa las mismas muestras REALES de orquesta que scripts/make_music.py (tonejs-instruments,
CC-BY 3.0, ver CREDITOS.md): contrabajo y chelo para los golpes graves, violín agudo
sostenido en el crescendo y un acorde final que se apaga.

Duración: 13.5 s, que cubre el clip gris de public/policia/clip.mp4 (11.5 s) más la tarjeta final.
Salida: public/policia/dramatico.wav (48 kHz estéreo, -18 LUFS).

Uso: python3 scripts/make_drama.py
"""
import os
import subprocess
import wave

import numpy as np

# Reutiliza el cargador de muestras y la reverberación del generador principal.
import make_music as mm

ROOT = mm.ROOT
SR = mm.SR
DUR = 13.5
OUT = f"{ROOT}/public/policia/dramatico.wav"


def main():
    buf = np.zeros((int(DUR * SR), 2))
    mono = np.zeros(int(DUR * SR))

    # 0 – 2.55 s: censura. Contrabajo sostenido y chelo en corcheas tensas.
    mm.place(mono, mm.note("contrabass", "D2", 2.6, gain=0.9, attack=0.05, release=0.4), 0.0)
    for k in range(0, 10):
        mm.place(mono, mm.note("cello", "Ds3", 0.22, gain=0.45, attack=0.005, release=0.15), k * 0.25)

    # 2.55 – 6.98 s: llega la Policía. Golpes graves y violín agudo que crece.
    mm.place(mono, mm.note("contrabass", "Gs2", 1.2, gain=1.0, attack=0.01, release=0.5), 2.55)
    violin = mm.note("violin", "A5", 4.4, gain=0.42, attack=1.6, release=0.8)
    mm.place(mono, violin, 2.6)
    for t in (3.7, 4.5, 5.3):
        mm.place(mono, mm.note("contrabass", "D2", 0.45, gain=0.8, attack=0.01, release=0.2), t)

    # 6.98 – 11.47 s: "justamente porque estamos aquí grabando". Golpes que se cierran.
    for t in (6.98, 8.1, 9.38, 10.4):
        mm.place(mono, mm.note("contrabass", "Gs2", 0.7, gain=0.95, attack=0.005, release=0.3), t)
    mm.place(mono, mm.note("violin", "E5", 2.5, gain=0.35, attack=0.8, release=1.0), 9.4)

    # 11.5 – 13.5 s: tarjeta final. Acorde de Re menor que se apaga.
    for name, inst in (("D2", "contrabass"), ("D3", "cello"), ("A3", "cello")):
        mm.place(mono, mm.note(inst, name, 2.4, gain=0.55, attack=0.02, release=1.4), 11.5)

    buf[:] = mm.reverb(mono, secs=1.8, wet=0.22)

    # Pico a -1 dBFS y luego sonoridad -18 LUFS con loudnorm.
    buf /= max(1e-9, np.max(np.abs(buf)))
    buf *= 10 ** (-1 / 20)
    pcm = (buf * 32767).astype("<i2")
    tmp = os.path.join(os.path.dirname(OUT), "_drama_tmp.wav")
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-18:TP=-1.5:LRA=11",
                    "-ar", "48000", "-ac", "2", OUT], check=True)
    os.remove(tmp)
    print("listo", OUT)


if __name__ == "__main__":
    main()
