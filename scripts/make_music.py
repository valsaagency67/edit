#!/usr/bin/env python3
"""Compone la música de fondo sintetizada, sin licencias de terceros, siguiendo las
secciones del video: lee src/campaign/vigilante.json y escribe public/music/tension.wav
(48 kHz estéreo, -30 LUFS antes de mezclar, sin graves por debajo de 120 Hz).

Versión 3, basada en el análisis del video de referencia (Duvalier): colchón cálido y
sostenido sin batería, tono mayor (Mi mayor), energía entre 120 y 800 Hz, dinámica
plana, ~95 bpm. Drama solo en momentos clave, con acordes menores y cuerdas que crecen.
  vigilante  -> Do# menor, cuerdas en trémolo suave que crecen (drama)
  1696..1706 -> Mi - Si - Do#m - La (I-V-vi-IV), pad cálido + piano suave, un acorde cada 4 tiempos
  1710       -> Do#m - La - Mi - Si con cuerdas que crecen (clímax)
  1713       -> suspenso: Do#m add9 sostenido, sin piano
  cierre     -> Mi mayor, piano + pad abierto
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
    a, b = min(n, int(fin * SR)), min(n, int(fout * SR))
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


def pluck(midi, n_len, level=1.0):
    """Nota tipo piano/marimba: fundamental + armónicos con caída exponencial."""
    t = np.arange(n_len) / SR
    f = hz(midi)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.45)
         + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.18)
         + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.08))
    attack = np.minimum(1, t / 0.012)  # ataque suave: sin "clic" grave al inicio
    return x * attack * level


def arpeggio(n, chords, bpm, sub=2, level=0.5):
    """Arpegio de 4 notas por acorde; cada acorde dura 2 compases de 4/4."""
    x = np.zeros(n)
    step = int(SR * 60 / bpm / sub)
    per_chord = 16 if sub == 2 else 32
    note_len = int(0.9 * SR)
    for i, s0 in enumerate(range(0, n, step)):
        chord = chords[(i // per_chord) % len(chords)]
        m = chord[[0, 1, 2, 1, 3, 2, 1, 2][i % 8]]
        e = min(n, s0 + note_len)
        x[s0:e] += pluck(m, e - s0, 0.8 if i % 4 == 0 else 0.55)
    return x * level


def strings(notes, n, level=0.3, trem=0.0, swell=(0.8, 0.8), bright=3500):
    """Cuerdas: sierras desafinadas filtradas, trémolo opcional y envolvente de crecida."""
    t = np.arange(n) / SR
    x = sum(saw(hz(m), n, d) for m in notes for d in (-0.004, 0.0, 0.004)) / (3 * len(notes))
    x = lp(x, bright)
    if trem:
        x *= 0.65 + 0.35 * np.sin(2 * np.pi * trem * t)
    return x * env_fade(n, *swell) * level


def pizz(n, notes, bpm, level=0.4):
    x = np.zeros(n)
    step = int(SR * 60 / bpm)
    ln = int(0.25 * SR)
    for i, s0 in enumerate(range(0, n, step)):
        e = min(n, s0 + ln)
        tt = np.arange(e - s0) / SR
        x[s0:e] += np.sin(2 * np.pi * hz(notes[i % len(notes)]) * tt) * np.exp(-tt / 0.06)
    return x * level


def warm_pad(chords, n, beat_s, beats_per_chord=4, level=0.4):
    """Pad cálido: sierras desafinadas filtradas a 1.4 kHz, ataque y relajación lentos por acorde."""
    x = np.zeros(n)
    seg = int(beat_s * beats_per_chord * SR)
    fade = int(0.6 * SR)
    for i, s0 in enumerate(range(0, n, seg)):
        e = min(n, s0 + seg + fade)
        ln = e - s0
        chord = chords[i % len(chords)]
        v = sum(saw(hz(m), ln, d) for m in chord for d in (-0.003, 0.003)) / (2 * len(chord))
        x[s0:e] += lp(v, 1400) * env_fade(ln, 0.5, 0.6)
    return x * level


def soft_piano(chords, n, beat_s, beats_per_chord=4, level=0.3):
    """Piano suave: acorde al inicio de cada cambio + una nota del acorde a mitad de compás."""
    x = np.zeros(n)
    seg = int(beat_s * beats_per_chord * SR)
    note_len = int(2.2 * SR)
    for i, s0 in enumerate(range(0, n, seg)):
        chord = chords[i % len(chords)]
        for k, (off, notes) in enumerate([(0, chord[1:]), (seg // 2, [chord[-1] + 12])]):
            a = s0 + off
            if a >= n:
                continue
            e = min(n, a + note_len)
            tt = np.arange(e - a) / SR
            for m in notes:
                f = hz(m)
                tone = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / 0.9)
                x[a:e] += tone * np.minimum(1, tt / 0.02) * (1.0 if k == 0 else 0.6)
    return x * level / 3


# Mi mayor: I-V-vi-IV; bajo en octava 3 y acorde en octava 4 (centroide ~600 Hz como la referencia).
E_, B_, Csm, A_ = (52, 64, 68, 71), (47, 63, 66, 71), (49, 64, 68, 73), (45, 61, 64, 69)
BEAT = 60 / 95


def section(kind, n):
    if kind == "vigilante":
        return (warm_pad([Csm], n, BEAT, 16, 0.35)
                + strings([61, 64, 68, 69], n, 0.3, trem=8, swell=(min(2.5, n / SR * 0.7), 0.3), bright=2500))
    if kind == "bed":
        return warm_pad([E_, B_, Csm, A_], n, BEAT, 4, 0.42) + soft_piano([E_, B_, Csm, A_], n, BEAT, 4, 0.3)
    if kind == "climax":
        prog = [Csm, A_, E_, B_]
        return (warm_pad(prog, n, BEAT, 4, 0.45) + soft_piano(prog, n, BEAT, 4, 0.32)
                + strings([64, 68, 71, 73], n, 0.22, trem=6, swell=(n / SR * 0.8, 0.4), bright=2500))
    if kind == "suspense":
        return warm_pad([(49, 61, 68, 75, 76)], n, BEAT, 32, 0.38) + strings([73, 75, 76], n, 0.12, swell=(1.0, 0.8), bright=2200)
    if kind == "resolve":
        return warm_pad([E_, (52, 64, 68, 71, 75)], n, BEAT, 4, 0.4) + soft_piano([E_, E_], n, BEAT, 4, 0.35)
    raise ValueError(kind)


KINDS = {"IMG_1697": "vigilante", "IMG_1696": "bed", "IMG_1702": "bed", "IMG_1704": "bed",
         "IMG_1706": "bed", "IMG_1710": "climax", "IMG_1713": "suspense"}


def main():
    d = json.load(open(f"{ROOT}/src/campaign/vigilante.json"))
    fps = d["fps"]
    bounds = [(KINDS[c["file"]], c["from"] / fps, c["to"] / fps) for c in d["clips"]]
    end = d["clipsEnd"] / fps
    bounds.append(("resolve", end, end + END_CARD_S))
    merged = []
    for k, a, b in bounds:
        if merged and merged[-1][0] == k:
            merged[-1] = (k, merged[-1][1], b)
        else:
            merged.append((k, a, b))
    bounds = merged
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
    for _ in range(2):  # 24 dB/oct: sin graves que retumben
        left, right = hp(left, 120), hp(right, 120)
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
