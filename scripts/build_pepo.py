#!/usr/bin/env python3
"""Video de Juan Felipe al estilo del video argentino de referencia (media/ref/referencia-3.mp4: «Recuperar la
cultura política no es nostalgia»), adaptado a Colombia: desinformación por saturación, con el Palacio de
Justicia como ejemplo. Carpeta de Drive «Pepo1».

- Escenas, voz y tomas: scripts/tomas.py (siete tomas 4K verticales de media/pepo1/IMG_*.MOV).
- Color: cálido y más vivo que el original, como la referencia (el cliente lo pidió «más llamativo»).
- public/pepo/musica.wav: pieza propia (piano en Fa mayor, 80 bpm, reflexiva; el chelo entra en «palacio»),
  muestras reales tonejs-instruments (CC-BY 3.0), ~17 dB bajo la voz.
- public/pepo/foley.wav: efectos del video de referencia del cliente, de vez en cuando: obturador en los
  cortes de `shutters`, en la primera foto de apoyo de cada escena y clic en el escrito final.
Salida de la línea de tiempo: src/campaign/pepo.json.

Uso: python3 scripts/build_pepo.py
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

CFG = json.load(open(f"{ROOT}/scripts/pepo.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/pepo"
TMP = f"{ROOT}/out/pepo/tmp"
# Cálido y vivo (como la referencia), sin llevar la piel al naranja.
GRADE = "eq=contrast=1.08:saturation=1.15,colorbalance=rs=0.05:bs=-0.05:rm=0.03:bm=-0.03:rh=0.02:bh=-0.02"


def musica(data):
    """Piano en Fa mayor (I-vi-IV-V: Fa - Rem - Sib - Do) en arpegios lentos; el chelo entra en «palacio»
    y sostiene hasta el final."""
    beat = 60 / 80
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("F2", ["F3", "A3", "C4", "F4"], "F3"), ("D2", ["D3", "F3", "A3", "D4"], "D3"),
            ("As1", ["As2", "D3", "F3", "As3"], "As2"), ("C2", ["C3", "E3", "G3", "C4"], "C3")]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, bar = 0.0, 0
    while t < total + 1.5:
        root, arp, cello = prog[bar % 4]
        grow = 0.75 + 0.4 * min(1, t / total)
        mm.place(buf, mm.note("piano", root, 4 * beat + 0.8, 0.26 * grow, release=1.0), t)
        for i, n in enumerate(arp):
            mm.place(buf, mm.note("piano", mm.up_octave(n), 1.5, 0.13 * grow, release=0.8), t + i * beat)
        if t >= starts["palacio"] - 0.1:
            mm.place(buf, mm.note("cello", cello, 4 * beat + 0.3, 0.2 * grow, attack=0.5, release=0.8), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.4, 0.3)
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
    """Solo efectos del video de referencia y de vez en cuando: obturador en los cortes de `shutters` y en
    la primera foto de apoyo de una escena; clic en el escrito final. Los subtítulos entran sin sonido."""
    buf = np.zeros(int((data["duration"] + 2) * SR))
    click, shutter = sample("click"), sample("shutter")
    for sc in data["scenes"]:
        if sc["key"] in CFG["shutters"]:
            mf.place(buf, shutter * 0.35, sc["start"] - 0.03)
        for c in sc["cards"]:
            mf.place(buf, click * 0.7, c["start"])
        if sc["photos"] and "img" in sc["photos"][0] and sc["key"] not in CFG["shutters"]:
            mf.place(buf, shutter * 0.35, sc["photos"][0]["start"] - 0.03)
    if "outro" in data:
        mf.place(buf, click * 0.7, data["outro"]["start"])
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = Proyecto(CFG, f"{ROOT}/media/pepo1", ".MOV", OUT, TMP, GRADE).build(f"{ROOT}/src/campaign/pepo.json")
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
