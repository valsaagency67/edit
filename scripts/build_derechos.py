#!/usr/bin/env python3
"""Video de Juan Felipe «¿Dónde acudir cuando te vulneran tus derechos?» (carpeta de Drive «Juan
felipe ll»), con las reglas fijas del cliente (CLAUDE.md): voz de seguido a 1.07x (gancho más rápido),
subtítulos Montserrat con resaltado amarillo, tarjetas rojas y azules a la altura del pecho, destello en
los cortes, música propia baja y foley alineado.

- Escenas, voz y tomas: scripts/tomas.py (cinco tomas a cámara de media/jf2/IMG_*.MOV).
- public/jf2/musica.wav: pieza propia, distinta de las otras (piano, violín y contrabajo en La mayor,
  96 bpm, esperanzadora), muestras reales tonejs-instruments (CC-BY 3.0), ~17 dB bajo la voz.
- public/jf2/foley.wav: clic por subtítulo, golpe en cada tarjeta, barrido en cada corte de toma.
Salida de la línea de tiempo: src/campaign/derechos.json.

Uso: python3 scripts/build_derechos.py
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
from tomas import SR, Proyecto, write_wav  # noqa: E402

CFG = json.load(open(f"{ROOT}/scripts/derechos.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/jf2"
TMP = f"{ROOT}/out/jf2/tmp"
# Las tomas vienen en BT.709 (no HLG): solo un poco de contraste y color.
GRADE = "eq=contrast=1.04:saturation=1.05"


def musica(data):
    """Piano en acordes a contratiempo, violín sostenido desde la segunda toma y contrabajo; progresión
    I-vi-IV-V (La - Fa#m - Re - Mi), sube un poco hacia el llamado final."""
    beat = 60 / 96
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("A1", ["A3", "Cs4", "E4"], "E5"), ("Fs1", ["Fs3", "A3", "Cs4"], "Cs5"),
            ("D2", ["D3", "Fs3", "A3"], "D5"), ("E2", ["E3", "Gs3", "B3"], "B4")]
    violin_from = data["scenes"][1]["start"]
    t, bar = 0.0, 0
    while t < total + 1.5:
        bass, chord, high = prog[bar % 4]
        grow = 0.7 + 0.5 * min(1, t / total)
        mm.place(buf, mm.note("contrabass", bass, 4 * beat, 0.35 * grow, attack=0.05, release=0.6), t)
        for k in range(4):
            for n in chord:
                mm.place(buf, mm.note("piano", n, beat * 0.9, 0.12 * grow, release=0.4), t + (k + 0.5) * beat)
        if t >= violin_from - 0.1:
            mm.place(buf, mm.note("violin", high, 4 * beat + 0.3, 0.16 * grow, attack=0.6, release=0.8), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.0, 0.25)
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
    buf = np.zeros(int((data["duration"] + 2) * SR))
    for i, sc in enumerate(data["scenes"]):
        if i:
            mf.place(buf, mf.whoosh(0.35, 700, 6500, 0.16, rise=True), sc["start"] - 0.25)
        for c in sc["captions"]:
            mf.place(buf, mf.click(0.3), c["start"])
        for c in sc["cards"]:
            mf.place(buf, mf.thud(58, 0.5, 0.55), c["start"])
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = Proyecto(CFG, f"{ROOT}/media/jf2", ".MOV", OUT, TMP, GRADE).build(f"{ROOT}/src/campaign/derechos.json")
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
