#!/usr/bin/env python3
"""Música de suspenso con muestras REALES de orquesta (violín, chelo, contrabajo, piano).

Versión 4. Las versiones 1-3 eran síntesis pura y el cliente las rechazó por sonar
artificiales. Muestras: tonejs-instruments (Nicholaus Brosowsky), licencia CC-BY 3.0
(ver CREDITOS.md), descargadas con `npm pack tonejs-instrument-<inst>-mp3` en
media/samples/<inst>/<Nota>.mp3 (p. ej. As3.mp3 = La#3).

Lee las secciones de src/campaign/vigilante.json y escribe public/music/suspenso.wav
(48 kHz estéreo, -31 LUFS: ~15 dB bajo la voz, que está en -16 LUFS).

Re menor, 96 bpm. Progresión Rem - Sib - Solm - La (i - VI - iv - V).
  vigilante     -> ostinato de chelo + violín agudo sostenido + contrabajo
  1696..1706    -> ostinato de chelo suave + "pings" de piano agudo + contrabajo largo
  Dilian, 1710  -> clímax: ostinato más fuerte con octava, violines sostenidos, contrabajo
  1713          -> suspenso: solo violín agudo sostenido y piano espaciado
  cierre        -> resuelve en Re mayor (chelo, violín y piano)
Uso: python3 scripts/make_music.py
"""
import json
import os
import subprocess
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
END_CARD_S = 3.5
BPM = 96
BEAT = 60 / BPM
EIGHTH = BEAT / 2
rng = np.random.default_rng(11)

NOTE = {"C": 0, "Cs": 1, "D": 2, "Ds": 3, "E": 4, "F": 5, "Fs": 6, "G": 7, "Gs": 8, "A": 9, "As": 10, "B": 11}
_cache = {}


def midi(name):
    """'D3' -> 50, 'As1' -> 34."""
    return 12 * (int(name[-1]) + 1) + NOTE[name[:-1]]


def load(inst, name):
    key = (inst, name)
    if key not in _cache:
        path = f"{ROOT}/media/samples/{inst}/{name}.mp3"
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                             capture_output=True, check=True).stdout
        _cache[key] = np.frombuffer(raw, np.float32).astype(np.float64)
    return _cache[key]


def available(inst):
    return [f[:-4] for f in os.listdir(f"{ROOT}/media/samples/{inst}") if f.endswith(".mp3") and " " not in f]


def note(inst, target, dur, gain=1.0, attack=0.01, release=0.25):
    """Toma la muestra más cercana y la afina por remuestreo."""
    t = midi(target)
    src = min(available(inst), key=lambda n: abs(midi(n) - t))
    x = load(inst, src)
    shift = t - midi(src)
    if shift:
        ratio = 2 ** (shift / 12)
        x = resample_poly(x, 1000, int(round(1000 * ratio)))  # más agudo = menos muestras
    n = min(len(x), int(dur * SR))
    x = x[:n].copy()
    a, r = min(n, int(attack * SR)), min(n, int(release * SR))
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if r:
        x[-r:] *= np.linspace(1, 0, r)
    return x * gain


def place(buf, x, t):
    s = int(t * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += x[: e - s]


# Progresión por compás (4 tiempos): raíz del contrabajo, ostinato en corcheas, notas agudas.
PROG = [
    {"bass": "D2", "ost": ["D3", "D3", "A3", "D3", "D3", "Ds3", "D3", "C3"], "high": ["A5", "F5"]},
    {"bass": "As1", "ost": ["As2", "As2", "F3", "As2", "As2", "D3", "As2", "A2"], "high": ["As5", "F5"]},
    {"bass": "G1", "ost": ["G2", "G2", "D3", "G2", "G2", "As2", "G2", "A2"], "high": ["G5", "D5"]},
    {"bass": "A2", "ost": ["A2", "A2", "E3", "A2", "A2", "Cs3", "A2", "As2"], "high": ["E5", "Cs5"]},
]


def up_octave(n):
    return n[:-1] + str(int(n[-1]) + 1)


def section(kind, a, b, buf):
    """Escribe en buf (mono) los compases que caen en [a, b) con la progresión global."""
    bar = 4 * BEAT
    t = (a // bar) * bar
    while t < b:
        ch = PROG[int(t // bar) % len(PROG)]
        s = max(t, a)
        bar_end = min(t + bar, b)
        if kind in ("vigilante", "bed", "climax"):
            g = {"vigilante": 0.55, "bed": 0.38, "climax": 0.6}[kind]
            for i, nn in enumerate(ch["ost"]):
                tt = t + i * EIGHTH
                if a <= tt < b:
                    accent = 1.0 if i % 4 == 0 else 0.75
                    place(buf, note("cello", nn, EIGHTH * 0.9, g * accent, 0.005, 0.08), tt)
                    if kind == "climax":
                        place(buf, note("cello", up_octave(nn), EIGHTH * 0.9, g * 0.45 * accent, 0.005, 0.08), tt)
            gb = {"vigilante": 0.5, "bed": 0.35, "climax": 0.55}[kind]
            place(buf, note("contrabass", ch["bass"], bar_end - s + 0.6, gb, 0.4, 0.8), s)
        if kind in ("vigilante", "climax", "suspense"):
            gv = {"vigilante": 0.28, "climax": 0.22, "suspense": 0.3}[kind]
            highs = ["A5", "As5"] if kind == "vigilante" else ch["high"]
            for j, hn in enumerate(highs):
                place(buf, note("violin", hn, bar_end - s + 0.6, gv * (1 if j == 0 else 0.6), 0.6, 0.9), s)
        if kind in ("bed", "suspense"):
            pt = s if kind == "suspense" else t + 2 * BEAT
            if a <= pt < b:
                place(buf, note("piano", ch["high"][0][:-1] + "6", 2.5, 0.22 if kind == "bed" else 0.28, 0.003, 1.0), pt)
        t += bar


def resolve(a, b, buf):
    for nn, g in (("D3", 0.4), ("Fs3", 0.3), ("A3", 0.3)):
        place(buf, note("cello", nn, b - a + 0.5, g, 0.3, 1.5), a)
    place(buf, note("violin", "D5", b - a + 0.5, 0.25, 0.5, 1.5), a)
    for i, nn in enumerate(("D5", "Fs5", "A5", "D6")):
        place(buf, note("piano", nn, 2.5, 0.25, 0.003, 1.0), a + i * EIGHTH)


def reverb(x, secs=2.2, wet=0.28):
    """Reverb de sala: convolución con ruido de decaimiento exponencial, estéreo descorrelado."""
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = []
    for _ in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / (secs / 6.9))
        ir = sosfilt(butter(1, 5000, "low", fs=SR, output="sos"), ir)
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append((1 - wet) * x + wet * fftconvolve(x, ir)[: len(x)])
    return np.stack(out, 1)


KINDS = {"IMG_1697": "vigilante", "IMG_1696": "bed", "IMG_1702": "bed", "IMG_1704": "bed", "IMG_1706": "bed",
         "NUEVO_DILIAN": "climax", "IMG_1710": "climax", "IMG_1713": "suspense"}


def main():
    d = json.load(open(f"{ROOT}/src/campaign/vigilante.json"))
    fps = d["fps"]
    end = d["clipsEnd"] / fps
    total = end + END_CARD_S
    buf = np.zeros(int((total + 3) * SR))
    for c in d["clips"]:
        section(KINDS[c["file"]], c["from"] / fps, c["to"] / fps, buf)
    resolve(end, total, buf)
    buf = sosfilt(butter(2, 70, "high", fs=SR, output="sos"), buf)
    st = reverb(buf)[: int(total * SR)]
    fade = int(1.5 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    st /= np.max(np.abs(st)) * 1.05
    os.makedirs(f"{ROOT}/public/music", exist_ok=True)
    tmp = f"{ROOT}/public/music/_raw.wav"
    with wave.open(tmp, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    out = f"{ROOT}/public/music/suspenso.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-31:TP=-6:LRA=11", "-ar", str(SR), out], check=True)
    os.remove(tmp)
    print("listo", out, f"{total:.1f} s")


if __name__ == "__main__":
    main()
