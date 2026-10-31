#!/usr/bin/env python3
"""Video de Juan Felipe sobre el fallo que ordena al Museo Nacional devolver las 63 piezas retiradas
(«una guerra contra la cultura»), con las reglas fijas del cliente (CLAUDE.md) y lo que pidió para este:
pocas tarjetas y pocos efectos de sonido.

- Escenas, voz y tomas: scripts/tomas.py (doce tomas selfie de media/jf3/IMG_*.MOV, 3:4 recortadas a 9:16).
- public/jf3/musica.wav: pieza propia, distinta de las otras (chelo, piano y contrabajo en Re menor,
  76 bpm, tensa; el violín entra en «el fallo» y sube hacia el cierre), muestras reales tonejs-instruments
  (CC-BY 3.0), ~17 dB bajo la voz.
- public/jf3/foley.wav: efectos del video de referencia del cliente, con moderación: obturador solo en los
  cortes de `shutters` (giros del discurso) y clic solo cuando aparece una tarjeta.
Salida de la línea de tiempo: src/campaign/museo.json.

Uso: python3 scripts/build_museo.py
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

CFG = json.load(open(f"{ROOT}/scripts/museo.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/jf3"
TMP = f"{ROOT}/out/jf3/tmp"
# Selfies de interior en BT.709 (P3): un poco de contraste y color.
GRADE = "eq=contrast=1.05:saturation=1.04"


def musica(data):
    """Pulso de contrabajo en corcheas, piano en notas sueltas y chelo sostenido; i-VI-III-VII
    (Rem - Sib - Fa - Do). El violín entra en «fallo» y todo crece hacia el cierre."""
    beat = 60 / 76
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("D2", ["D4", "F4", "A4", "F4"], "D3"), ("As1", ["D4", "F4", "As4", "F4"], "As2"),
            ("F2", ["C4", "F4", "A4", "F4"], "A2"), ("C2", ["C4", "E4", "G4", "E4"], "G2")]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, bar = 0.0, 0
    while t < total + 1.5:
        bass, arp, cello = prog[bar % 4]
        grow = 0.7 + 0.5 * min(1, t / total)
        for k in range(8):
            mm.place(buf, mm.note("contrabass", bass, beat * 0.45, 0.22 * grow, attack=0.01, release=0.2),
                     t + k * beat / 2)
        for k, n in enumerate(arp):
            mm.place(buf, mm.note("piano", n, beat * 1.4, 0.12 * grow, release=0.6), t + k * beat)
        mm.place(buf, mm.note("cello", cello, 4 * beat + 0.3, 0.2 * grow, attack=0.5, release=0.8), t)
        if t >= starts["fallo"] - 0.1:
            mm.place(buf, mm.note("violin", mm.up_octave(arp[2]), 4 * beat + 0.3, 0.13 * grow,
                                  attack=0.6, release=0.8), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.2, 0.25)
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
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = Proyecto(CFG, f"{ROOT}/media/jf3", ".MOV", OUT, TMP, GRADE).build(f"{ROOT}/src/campaign/museo.json")
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
