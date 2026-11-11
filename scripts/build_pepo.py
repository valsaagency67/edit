#!/usr/bin/env python3
"""Video de Juan Felipe al estilo del video argentino de referencia (media/ref/referencia-3.mp4: «Recuperar la
cultura política no es nostalgia»), adaptado a Colombia: desinformación por saturación, con el Palacio de
Justicia como ejemplo. Carpeta de Drive «Pepo1».

- Escenas, voz y tomas: scripts/tomas.py (siete tomas 4K verticales de media/pepo1/IMG_*.MOV).
- Color: cálido y más vivo que el original, como la referencia (el cliente lo pidió «más llamativo»).
- Voz: cadena más clara que la de enhance_voice (VOZ): la grabación sale opaca, con casi nada sobre 2 kHz
  (el cliente dijo que no se escuchaba bien), así que se quita caja en 300/550 Hz y se realza la presencia
  en 1.3–3.6 kHz, con un excitador suave para devolver brillo.
- public/pepo/musica.wav: pieza propia sombría (Re menor, 60 bpm: contrabajo, chelo, piano grave y violín en
  «palacio»), muestras reales tonejs-instruments (CC-BY 3.0), ~19 dB bajo la voz y con ducking.
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
VOZ = ",".join([
    "highpass=f=90:poles=2",
    "afftdn=nr=10:nf=-42:tn=1",
    "equalizer=f=300:t=q:w=1.0:g=-3",
    "equalizer=f=550:t=q:w=1.0:g=-4",
    "equalizer=f=1300:t=q:w=1.0:g=5",
    "equalizer=f=2300:t=q:w=0.8:g=9",
    "equalizer=f=3600:t=q:w=1.0:g=5",
    "highshelf=f=6500:g=2",
    "aexciter=amount=1.5:drive=5:blend=0:freq=2800:ceil=12000",
    "deesser=i=0.5",
    "acompressor=threshold=-24dB:ratio=4:attack=5:release=100:makeup=3",
    "alimiter=limit=0.9:level=false",
    "loudnorm=I=-16:TP=-1.5:LRA=5",
])
GRADE = "eq=contrast=1.08:saturation=1.15,colorbalance=rs=0.05:bs=-0.05:rm=0.03:bm=-0.03:rh=0.02:bh=-0.02"


def musica(data):
    """Música sombría (el cliente la pidió así): Re menor a 60 bpm (i-VI-iv-V: Rem - Sib - Solm - La), compases
    de 4 s. Contrabajo en notas largas cada dos compases, chelo sostenido en quintas graves, una nota grave de
    piano al inicio de cada compás y un motivo agudo de piano, escaso, cada dos compases. En «palacio» entra un
    violín agudo sostenido que da tensión. Mucha reverberación. Debajo de la voz baja ~19 dB (-35 LUFS) y además
    se aparta 4 dB mientras él habla (ducking), para que la voz se entienda."""
    total = data["duration"]
    buf = np.zeros(int((total + 4) * SR))
    bar = 4.0
    prog = [("D2", ["D3", "A3"], "D2"), ("As1", ["As2", "F3"], "As2"), ("G1", ["G2", "D3"], "G2"),
            ("A2", ["A2", "E3"], "A2")]
    motif = [("A4", 0), ("D5", 1), ("F5", 2), ("E5", 3.5)]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, k = 0.0, 0
    while t < total + 2:
        bass, cello, low = prog[k % 4]
        grow = 0.8 + 0.35 * min(1, t / total)
        if k % 2 == 0:
            mm.place(buf, mm.note("contrabass", bass, 2 * bar + 0.5, 0.32 * grow, attack=0.6, release=2.0), t)
        for half in (0, bar / 2):
            for n in cello:
                mm.place(buf, mm.note("cello", n, bar / 2 + 0.9, 0.12 * grow, attack=0.45, release=1.0), t + half)
        mm.place(buf, mm.note("piano", low, bar + 1, 0.22 * grow, release=1.2), t)
        if k % 2 == 1:
            for n, beat in motif:
                mm.place(buf, mm.note("piano", n, 2.2, 0.075 * grow, release=1.0), t + beat)
        if starts["palacio"] - 0.1 <= t < starts["seria"]:
            mm.place(buf, mm.note("violin", "A5" if k % 2 == 0 else "As5", bar + 0.6, 0.05, attack=1.2, release=1.2), t)
        t += bar
        k += 1
    buf = mm.reverb(buf, 3.2, 0.38)
    end = int((total + 0.6) * SR)
    fade = int(2.0 * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    tmp = f"{TMP}/musica-raw.wav"
    write_wav(tmp, buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)
    norm = f"{TMP}/musica-norm.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-35:TP=-9:LRA=11",
                    "-ar", str(SR), norm], check=True)
    # Ducking: -4 dB mientras hay voz (envolvente de la voz suavizada, sube en 0.15 s y vuelve en 0.6 s).
    from tomas import read_wav
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", norm, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
    v = read_wav(f"{OUT}/voz.wav")
    hop = SR // 100
    nv = len(v) // hop
    env = np.sqrt((v[: nv * hop].reshape(nv, hop) ** 2).mean(1))
    talk = (20 * np.log10(env + 1e-9) > -40).astype(float)
    g = np.zeros_like(talk)
    for i in range(nv):
        prev = g[i - 1] if i else 0
        g[i] = prev + (talk[i] - prev) * (0.07 if talk[i] > prev else 0.017)
    gain = 10 ** (-4 * np.interp(np.arange(len(m)) / hop, np.arange(nv), g) / 20)
    write_wav(f"{OUT}/musica.wav", m * gain[:, None], 2)


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
    d = Proyecto(CFG, f"{ROOT}/media/pepo1", ".MOV", OUT, TMP, GRADE, voice=VOZ).build(f"{ROOT}/src/campaign/pepo.json")
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
