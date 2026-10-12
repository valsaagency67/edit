#!/usr/bin/env python3
"""Compone la música de fondo (tensión/amenaza) sintetizada, sin licencias de terceros,
siguiendo las secciones del video: lee src/campaign/vigilante.json y escribe
public/music/tension.wav (48 kHz estéreo, normalizada a -30 LUFS para ir bajo la voz).

Secciones (por clip, ver estilo.md):
  vigilante  -> zumbido Re + Mib (segunda menor), latido 66 bpm
  1696, 1702 -> Re menor, bajo pulsante en corcheas 84 bpm
  1704, 1706 -> Sib y Sol menor, pulso más marcado
  1710       -> La (dominante), semicorcheas, clímax
  1713       -> caída: Re grave sostenido + brillo agudo, latido lento
  cierre     -> resuelve en Re mayor
Uso: python3 scripts/make_music.py
"""
import json
import os
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
END_CARD_S = 3.5
rng = np.random.default_rng(3)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, f):
    return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)


def saw(f, n, detune=0.0):
    """Diente de sierra suave (aditiva, 12 armónicos) con leve desafinación."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, 13):
        out += np.sin(2 * np.pi * f * (1 + detune) * k * t + k) / k
    return out


def env_fade(n, fin, fout):
    e = np.ones(n)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if b:
        e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    return e


def drone(root, n, chord=(0, 7), bright=500.0):
    x = sum(saw(hz(root + iv), n, d) for iv in chord for d in (-0.003, 0.003))
    t = np.arange(n) / SR
    return lp(x, bright) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * t))


def pad(notes, n, level=0.25):
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(m) * t) + 0.5 * np.sin(2 * np.pi * hz(m) * 1.002 * t) for m in notes)
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * 0.08 * t - np.pi / 2)
    return x * swell * level / len(notes)


def thump(n, bpm, double=False, f0=55.0, level=1.0):
    """Latido/bombo grave: seno con caída de tono."""
    x = np.zeros(n)
    beat = int(SR * 60 / bpm)
    hit_len = int(0.35 * SR)
    th = np.arange(hit_len) / SR
    hit = np.sin(2 * np.pi * (f0 * th + 40 * (1 - np.exp(-th / 0.03)) * 0.03)) * np.exp(-th / 0.12)
    offsets = [0, int(0.22 * SR)] if double else [0]
    for start in range(0, n, beat):
        for k, off in enumerate(offsets):
            s = start + off
            if s >= n:
                continue
            e = min(n, s + hit_len)
            x[s:e] += hit[: e - s] * (1.0 if k == 0 else 0.6)
    return x * level


def ostinato(root, n, bpm, sub=2, level=0.5):
    """Bajo pulsante: notas cortas en corcheas (sub=2) o semicorcheas (sub=4)."""
    x = np.zeros(n)
    step = int(SR * 60 / bpm / sub)
    note_len = int(step * 0.7)
    tn = np.arange(note_len) / SR
    pattern = [0, 0, 12, 0, 0, 7, 0, 3]
    for i, s in enumerate(range(0, n, step)):
        f = hz(root + pattern[i % len(pattern)])
        e = min(n, s + note_len)
        tone = (np.sin(2 * np.pi * f * tn) + 0.4 * np.sin(4 * np.pi * f * tn)) * np.exp(-tn / 0.09)
        x[s:e] += tone[: e - s]
    return lp(x, 900) * level


def shimmer(n, notes, level=0.12):
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(m) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.7 + i * 0.13) * t)) for i, m in enumerate(notes))
    return hp(x, 1500) * level / len(notes)


def noise_bed(n, level=0.05):
    return lp(hp(rng.standard_normal(n), 200), 1200) * level


def section(kind, n):
    D2, Eb2, G1, A1, Bb1, D3 = 38, 39, 31, 33, 34, 50
    if kind == "vigilante":
        return (drone(D2, n, (0, 1, 12), 700) * 0.55 + pad([74, 75], n, 0.3)
                + thump(n, 66, double=True, level=0.9) + noise_bed(n, 0.06))
    if kind == "dminor":
        return (drone(D2, n, (0, 7), 450) * 0.4 + ostinato(D2, n, 84, 2, 0.45)
                + pad([62, 65, 69], n, 0.22) + thump(n, 84, level=0.5))
    if kind == "bb":
        return (drone(Bb1, n, (0, 7), 500) * 0.45 + ostinato(Bb1 + 12, n, 84, 2, 0.5)
                + pad([58, 62, 65], n, 0.24) + thump(n, 84, double=True, level=0.6))
    if kind == "gminor":
        return (drone(G1, n, (0, 7, 12), 520) * 0.45 + ostinato(G1 + 12, n, 84, 2, 0.55)
                + pad([55, 58, 62, 63], n, 0.26) + thump(n, 84, double=True, level=0.65))
    if kind == "climax":
        return (drone(A1, n, (0, 7, 13), 800) * 0.5 + ostinato(A1 + 12, n, 84, 4, 0.55)
                + pad([69, 73, 76, 70], n, 0.3) + thump(n, 84, double=True, level=0.8) + noise_bed(n, 0.08))
    if kind == "drop":
        return drone(D2 - 12, n, (0,), 300) * 0.6 + shimmer(n, [86, 87, 93]) + thump(n, 50, level=0.45)
    if kind == "resolve":
        return drone(D2, n, (0, 7, 16), 600) * 0.4 + pad([62, 66, 69, 74], n, 0.35) + shimmer(n, [86, 90, 93], 0.08)
    raise ValueError(kind)


KINDS = {"IMG_1697": "vigilante", "IMG_1696": "dminor", "IMG_1702": "dminor", "IMG_1704": "bb",
         "IMG_1706": "gminor", "IMG_1710": "climax", "IMG_1713": "drop"}


def main():
    d = json.load(open(f"{ROOT}/src/campaign/vigilante.json"))
    fps = d["fps"]
    bounds = [(KINDS[c["file"]], c["from"] / fps, c["to"] / fps) for c in d["clips"]]
    end = d["clipsEnd"] / fps
    bounds.append(("resolve", end, end + END_CARD_S))
    total = int((end + END_CARD_S) * SR)
    left, right = np.zeros(total), np.zeros(total)
    xf = 0.35  # fundido cruzado entre secciones (s)
    for i, (kind, a, b) in enumerate(bounds):
        s0 = max(0, int((a - xf / 2) * SR))
        s1 = min(total, int((b + xf / 2) * SR))
        n = s1 - s0
        x = section(kind, n)
        last = i == len(bounds) - 1
        x *= env_fade(n, 0.6 if i == 0 else xf, 1.2 if last else xf)
        # Estéreo: leve desplazamiento del pad/ruido.
        left[s0:s1] += x
        right[s0:s1] += np.roll(x, int(0.011 * SR))
    st = np.stack([left, right], 1)
    st /= np.max(np.abs(st)) * 1.05
    os.makedirs(f"{ROOT}/public/music", exist_ok=True)
    tmp = f"{ROOT}/public/music/_raw.wav"
    with wave.open(tmp, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    out = f"{ROOT}/public/music/tension.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-30:TP=-6:LRA=11", "-ar", str(SR), out], check=True)
    os.remove(tmp)
    print("listo", out, f"{(end + END_CARD_S):.1f} s", [k for k, _, _ in bounds])


if __name__ == "__main__":
    main()
