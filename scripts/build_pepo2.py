#!/usr/bin/env python3
"""Video del IVA a la canasta familiar en la «ley de rescate» de Abelardo de la Espriella (carpeta de Drive
«Pepo 2»). Mismo estilo «cinematográfico» de Pepo 3: reusa las funciones de scripts/build_pepo3.py cambiando su
configuración y carpetas (color tal como viene, palabras grandes detrás y delante, efectos de la referencia).

- Voz: DPDFNet + cadena de Pepo1, a 1.07x y sin pausas (monólogo, regla «que hable de seguido»).
- Música propia (media/pepo2/musica.wav, se arma aquí): tensa y moderna, Re menor a 92 bpm. Contrabajo en
  corcheas, chelo largo y una nota aguda de piano cada dos compases; muestras reales tonejs-instruments
  (CC-BY 3.0, media/samples/, `npm pack tonejs-instrument-<inst>-mp3`). Va continua, ~11 dB bajo la voz.
Salida de la línea de tiempo: src/campaign/pepo2.json.

Uso: python3 scripts/build_pepo2.py
"""
import json
import os
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import build_pepo3 as b3  # noqa: E402
import make_music as mm  # noqa: E402
from build_pepo import DENOISE, VOZ, zooms  # noqa: E402
from tomas import SR, Proyecto, write_wav  # noqa: E402

b3.CFG = json.load(open(f"{ROOT}/scripts/pepo2.config.json", encoding="utf-8"))
b3.OUT = f"{ROOT}/public/pepo2"
b3.TMP = f"{ROOT}/out/pepo2/tmp"
b3.MEDIA = f"{ROOT}/media/pepo2"


def componer(total):
    """Re menor a 92 bpm (i - VI - III - VII: Rem - Sib - Fa - Do), compases de 4 tiempos."""
    beat = 60 / 92
    bar = 4 * beat
    buf = np.zeros(int((total + 4) * SR))
    prog = [("D2", ["D3", "A3"], "A5"), ("As1", ["As2", "F3"], "F5"), ("F1", ["F2", "C3"], "A5"),
            ("C2", ["C3", "G3"], "G5")]
    t, k = 0.0, 0
    while t < total + 2:
        bass, cello, ping = prog[k % 4]
        grow = 0.75 + 0.4 * min(1, t / total)
        for e in range(8):  # contrabajo en corcheas, acento en el 1 y el 3
            mm.place(buf, mm.note("contrabass", bass, beat * 0.45, (0.3 if e % 4 == 0 else 0.18) * grow,
                                  release=0.08), t + e * beat / 2)
        for n in cello:
            mm.place(buf, mm.note("cello", n, bar + 0.6, 0.11 * grow, attack=0.4, release=0.9), t)
        if k % 2 == 1:
            mm.place(buf, mm.note("piano", ping, 2.4, 0.08 * grow, release=1.2), t + 2 * beat)
        t += bar
        k += 1
    buf = mm.reverb(buf, 2.6, 0.3)
    end = int((total + 0.6) * SR)
    fade = int(2.0 * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    os.makedirs(b3.MEDIA, exist_ok=True)
    write_wav(f"{b3.MEDIA}/musica.wav", buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)


if __name__ == "__main__":
    path = f"{ROOT}/src/campaign/pepo2.json"
    d = Proyecto(b3.CFG, f"{ROOT}/media/pepo2", ".MOV", b3.OUT, b3.TMP, b3.GRADE, voice=VOZ,
                 denoise=DENOISE).build(path)
    d["zooms"] = zooms(d)
    d["big"] = b3.bigs(d)
    b3.mattes(d)
    b3.heads(d)
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=1)
    componer(d["duration"])
    b3.musica(d)
    b3.foley(d)
    print("listo:", d["duration"], "s")
