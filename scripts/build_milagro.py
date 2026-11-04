#!/usr/bin/env python3
"""Video de Juan Felipe sobre el Fondo Milagro (reconstrucción tras el terremoto del 10 de agosto), con las
reglas fijas del cliente (CLAUDE.md): pocas tarjetas y efectos de vez en cuando.

- Escenas, voz y tomas: scripts/tomas.py (nueve tomas selfie de media/jf4/IMG_*.MOV, 3:4 recortadas a 9:16).
- public/jf4/musica.wav: «Latinoamérica» de Calle 13 (la pidió el cliente; media/jf4/musica/, no versionada),
  sincronizada para que «el que no quiere a su patria no quiere a su madre» suene en el escrito final.
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
from tomas import SR, Proyecto, sample, write_wav  # noqa: E402

CFG = json.load(open(f"{ROOT}/scripts/milagro.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/jf4"
TMP = f"{ROOT}/out/jf4/tmp"
# Selfies de interior en BT.709 (P3): un poco de contraste y color.
GRADE = "eq=contrast=1.05:saturation=1.04"


def musica(data):
    """«Latinoamérica» de Calle 13 (la pidió el cliente; no es música propia): arranca donde haga falta para que
    «el que no quiere a su patria no quiere a su madre» suene sobre el escrito final, 0.15 s después de que él
    termina de hablar. Bajo la voz va ~17 dB abajo (-33 LUFS); en el escrito final sube 9 dB para que la
    frase se oiga clara, y se desvanece al terminar."""
    song = CFG["song"]
    speech_end = data["scenes"][-1]["end"]
    total = data["duration"]
    start = song["lyric"] - (speech_end + 0.15)
    tmp = f"{TMP}/cancion.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{total + 0.5:.3f}",
                    "-i", f"{ROOT}/{song['file']}", "-af", "loudnorm=I=-33:TP=-9:LRA=11", "-ar", str(SR),
                    "-ac", "2", tmp], check=True)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", tmp, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
    t = np.arange(len(x)) / SR
    up = speech_end - 0.1
    gain_db = np.interp(t, [0, up, up + 0.35], [0, 0, 9])
    fade_end = min(total, song["lyricEnd"] - start + 0.4)
    gain = 10 ** (gain_db / 20) * np.interp(t, [0, fade_end - 0.6, fade_end], [1, 1, 0])
    write_wav(f"{OUT}/musica.wav", x * gain[:, None], 2)


def foley(data):
    """Solo efectos del video de referencia y de vez en cuando (pedido del cliente): obturador en los
    cortes de `shutters` y clic cuando aparece una tarjeta. Los subtítulos entran sin sonido."""
    buf = np.zeros(int((data["duration"] + 2) * SR))
    click, shutter = sample("click"), sample("shutter")
    for sc in data["scenes"]:
        if sc["key"] in CFG["shutters"]:
            mf.place(buf, shutter * 0.35, sc["start"] - 0.03)
        for c in sc["cards"]:
            mf.place(buf, click * 0.7, c["start"])
        # Fotos: obturador suave solo en la primera de una escena que no empieza ya con obturador.
        if sc["photos"] and sc["key"] not in CFG["shutters"]:
            mf.place(buf, shutter * 0.4, sc["photos"][0]["start"] - 0.03)
    if "outro" in data:  # clic cuando entra el escrito final
        mf.place(buf, click * 0.7, data["outro"]["start"])
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


def distorsion(data):
    """Tramos con efecto «distort» (el «pero ¿y las casas para los damnificados?» del gancho): la voz pasa
    por un filtro de radio vieja (banda 350–2800 Hz, saturación y menos bits) con el mismo nivel RMS y
    fundidos de 30 ms para que el cambio no truene."""
    from tomas import read_wav
    voz = read_wav(f"{OUT}/voz.wav")
    for sc in data["scenes"]:
        for fx in sc.get("effects", []):
            if not fx.get("distort"):
                continue
            a, b = int(fx["start"] * SR), int(fx["end"] * SR)
            seg = voz[a:b]
            src, dst = f"{TMP}/distorsion-in.wav", f"{TMP}/distorsion-out.wav"
            write_wav(src, seg)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
                            "highpass=f=350,lowpass=f=2800,acrusher=bits=6:mix=0.45:mode=log:aa=1,"
                            "asoftclip=type=atan:param=2,highpass=f=300,lowpass=f=3000",
                            "-ar", str(SR), "-ac", "1", dst], check=True)
            out = read_wav(dst)[:len(seg)]
            out = out * np.sqrt(np.mean(seg ** 2)) / max(1e-9, np.sqrt(np.mean(out ** 2)))
            f = int(0.03 * SR)
            ramp = np.linspace(0, 1, f)
            mix = np.ones(len(seg))
            mix[:f], mix[-f:] = ramp, ramp[::-1]
            voz[a:b] = seg * (1 - mix) + out * mix
    write_wav(f"{OUT}/voz.wav", voz)


if __name__ == "__main__":
    d = Proyecto(CFG, f"{ROOT}/media/jf4", ".MOV", OUT, TMP, GRADE).build(f"{ROOT}/src/campaign/milagro.json")
    distorsion(d)
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
