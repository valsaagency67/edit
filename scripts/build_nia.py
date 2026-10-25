#!/usr/bin/env python3
"""Video de Nia («La filosofía se vive en la calle»): voz, video base, música y foley para
src/nia/Nia.tsx, a partir de scripts/nia.config.json.

- Escenas, voz y tomas: scripts/tomas.py (voz en off de media/nia/<id>.bin y tomas a cámara, pausas
  recortadas por el audio, voz acelerada, tiempos por palabra con Parakeet).
- Videos: escalados a 1080x1920, 30 fps, con la gradación de Nia.
Salidas: public/nia/{voz,musica,foley}.wav, public/nia/{v1,v2}.mp4, src/nia/nia.json.

Uso: python3 scripts/build_nia.py
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

CFG = json.load(open(f"{ROOT}/scripts/nia.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/nia"
TMP = f"{ROOT}/out/nia/tmp"
# Gradación (ver CLAUDE.md, sección Nia): colores vivos (el cliente vio pálida la pastel) pero sin
# empujar la piel al naranja: contraste un poco más alto, sombras con un toque lila, luces neutras.
GRADE = ("vibrance=intensity=0.16,eq=saturation=1.03:contrast=1.06,curves=b='0/0.015 0.5/0.5 1/1',"
         "colorbalance=bs=0.02:rm=-0.01:bm=0.005:rh=-0.01:bh=0.01")
PROYECTO = Proyecto(CFG, f"{ROOT}/media/nia", ".bin", OUT, TMP, GRADE)


def build():
    return PROYECTO.build(f"{ROOT}/src/nia/nia.json")


def musica(data):
    """Piano y chelo en Sol mayor, 84 bpm, I-V-vi-IV (Sol - Re - Mim - Do): arpegios suaves de piano,
    chelo sostenido que entra en «Sócrates» y crece hacia el final. Muestras reales (CC-BY 3.0)."""
    bpm = 84
    beat = 60 / bpm
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("G2", ["G3", "B3", "D4", "G4", "D4", "B3"]), ("D2", ["D3", "Fs3", "A3", "D4", "A3", "Fs3"]),
            ("E2", ["E3", "G3", "B3", "E4", "B3", "G3"]), ("C2", ["C3", "E3", "G3", "C4", "G3", "E3"])]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, bar = 0.0, 0
    while t < total + 1.5:
        root, arp = prog[bar % 4]
        grow = 0.75 + 0.5 * min(1, t / total)
        mm.place(buf, mm.note("piano", root, 4 * beat + 1, 0.30 * grow, release=1.0), t)
        for i, n in enumerate(arp):
            n = mm.up_octave(n) if t >= starts["hoy"] else n
            mm.place(buf, mm.note("piano", n, 1.6, 0.16 * grow, release=0.8), t + i * beat * 2 / 3)
        if t >= starts["socrates"] - 0.1:
            mm.place(buf, mm.note("cello", root.replace("2", "3"), 4 * beat + 0.4, 0.22 * grow,
                                  attack=0.5, release=0.9), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.4, 0.3)
    fade = int(2.0 * SR)
    end = int((total + 0.8) * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    tmp = f"{TMP}/musica-raw.wav"
    write_wav(tmp, buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)
    # ~17 dB bajo la voz (-16 LUFS).
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-33:TP=-9:LRA=11",
                    "-ar", str(SR), f"{OUT}/musica.wav"], check=True)


def foley(data):
    """Los efectos del video de referencia del cliente (sin el «faaahh»), sacados de ese mismo video:
    - clic para remarcar textos: cada subtítulo (suave) y cada texto grande que aparece (más fuerte);
    - «magic reveal» para revelar algo: la pintura de Sócrates, VERDADES y el ¿POR QUÉ? final;
    - whoosh en cada acercamiento/alejamiento y en los cambios de foto dentro de una escena;
    - obturador de cámara en los cambios de escena (con el destello cálido de la imagen)."""
    buf = np.zeros(int((data["duration"] + 3) * SR))
    click, shutter, whoosh, magic = sample("click"), sample("shutter"), sample("whoosh"), sample("magic")
    # Palabras en las que entra un texto grande (ver Kinetic en src/nia/Nia.tsx).
    big = {"gancho": ["filosofía", "no"], "porque": ["por"], "injusticia": ["tanto", "tan"],
           "socrates": ["sócrates", "haciendo", "daban"], "calle": ["empieza", "calle."], "ojo": ["ojo,", "atreverse"], "cierre": ["cuestionarlo."]}
    for i, sc in enumerate(data["scenes"]):
        if i:
            mf.place(buf, shutter * 0.7, sc["start"] - 0.03)
        for z in (sc.get("zooms") or {}).get("at", []):
            mf.place(buf, whoosh * 0.6, z["t"] - 0.1)  # el pico del whoosh cae en el acercamiento
        for c in sc["captions"]:
            mf.place(buf, click * 0.35, c["start"])
        for j, s in enumerate(sc["shots"]):
            if s.get("porque") or s.get("card") or s.get("painting"):
                mf.place(buf, magic * 0.45, s["start"])
            elif j:
                mf.place(buf, whoosh * 0.6, s["start"] - 0.1)
        for w in sc["words"]:
            if w["t"].lower() in big.get(sc["key"], []):
                mf.place(buf, click * 0.7, w["s"])
        if sc["key"] == "socrates":  # globo de Sócrates (Nia.tsx: Pintura)
            mf.place(buf, click * 0.7, next(w["s"] for w in sc["words"] if w["t"] == "Sócrates") + 0.3)
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = build()
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
