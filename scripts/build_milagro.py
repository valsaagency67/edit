#!/usr/bin/env python3
"""Video de Juan Felipe sobre el Fondo Milagro (reconstrucción tras el terremoto del 10 de agosto), con las
reglas fijas del cliente (CLAUDE.md): pocas tarjetas y efectos de vez en cuando.

- Escenas, voz y tomas: scripts/tomas.py (nueve tomas selfie de media/jf4/IMG_*.MOV, 3:4 recortadas a 9:16).
- public/jf4/musica.wav: pieza propia, distinta de las otras (Mi menor, 92 bpm: contrabajo en negras, piano en
  octavas a contratiempo y violín tenso que entra en «pregunta»), muestras reales tonejs-instruments (CC-BY 3.0),
  ~17 dB bajo la voz.
- public/jf4/foley.wav: efectos del video de referencia del cliente, con moderación: obturador solo en los
  cortes de `shutters`, clic cuando aparece una tarjeta y cuando entra el escrito final.
Salida de la línea de tiempo: src/campaign/milagro.json.

Uso: python3 scripts/build_milagro.py
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import make_foley as mf  # noqa: E402
import make_music as mm  # noqa: E402
from tomas import SR, Proyecto, sample, write_wav  # noqa: E402

CFG = json.load(open(f"{ROOT}/scripts/milagro.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/jf4"
TMP = f"{ROOT}/out/jf4/tmp"
# Selfies de interior en BT.709 (P3): un poco de contraste y color.
GRADE = "eq=contrast=1.05:saturation=1.04"


def musica(data):
    """Contrabajo en negras, piano en octavas a contratiempo y violín sostenido desde «pregunta»; i-iv-VI-V
    (Mim - Lam - Do - Si), tensa, crece hacia el cierre."""
    beat = 60 / 92
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("E2", "E4", "B4"), ("A1", "A3", "E5"), ("C2", "C4", "G4"), ("B1", "B3", "Fs4")]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, bar = 0.0, 0
    while t < total + 1.5:
        bass, octv, high = prog[bar % 4]
        grow = 0.7 + 0.5 * min(1, t / total)
        for k in range(4):
            mm.place(buf, mm.note("contrabass", bass, beat * 0.8, 0.3 * grow, attack=0.01, release=0.3), t + k * beat)
            for n in (octv, mm.up_octave(octv)):
                mm.place(buf, mm.note("piano", n, beat * 0.45, 0.09 * grow, release=0.3), t + (k + 0.5) * beat)
        if t >= starts["pregunta"] - 0.1:
            mm.place(buf, mm.note("violin", high, 4 * beat + 0.3, 0.14 * grow, attack=0.5, release=0.8), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.0, 0.22)
    end = int((total + 0.6) * SR)
    fade = int(1.8 * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    tmp = f"{TMP}/musica-raw.wav"
    write_wav(tmp, buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)
    # ~17 dB bajo la voz (-16 LUFS).
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-33:TP=-9:LRA=11",
                    "-ar", str(SR), f"{OUT}/musica.wav"], check=True)


def foley(data):
    """Solo efectos del video de referencia y de vez en cuando (pedido del cliente): obturador en los
    cortes de `shutters` y clic cuando aparece una tarjeta. Los subtítulos entran sin sonido."""
    buf = np.zeros(int((data["duration"] + 2) * SR))
    click, shutter = sample("click"), sample("shutter")
    for sc in data["scenes"]:
        if sc["key"] in CFG["shutters"]:
            mf.place(buf, shutter * 0.6, sc["start"] - 0.03)
        for c in sc["cards"]:
            mf.place(buf, click * 0.7, c["start"])
        # Fotos: obturador suave solo en la primera de una escena que no empieza ya con obturador.
        if sc["photos"] and sc["key"] not in CFG["shutters"]:
            mf.place(buf, shutter * 0.4, sc["photos"][0]["start"] - 0.03)
    if "outro" in data:  # clic cuando entra el escrito final
        mf.place(buf, click * 0.7, data["outro"]["start"])
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = Proyecto(CFG, f"{ROOT}/media/jf4", ".MOV", OUT, TMP, GRADE).build(f"{ROOT}/src/campaign/milagro.json")
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
