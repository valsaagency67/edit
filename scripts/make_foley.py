#!/usr/bin/env python3
"""Foley sintético para la pieza de la censura y la Policía (src/campaign/Policia.tsx).

Cada efecto va alineado con una acción de la pantalla (mismos tiempos que Policia.tsx):
- clic suave en cada subtítulo (como la tipografía cinética de la referencia de Duvalier),
- impacto grave cuando entra la tarjeta «Nos están censurando»,
- barrido ascendente y radio policial («bip-bip») al entrar «Llega la Policía Nacional»,
- latido («lub-dub») en «justamente porque… de inmediato»,
- tres disparos de obturador en «Porque estamos grabando»,
- subida tensa y golpe final en «No nos dejan grabar».

Todo se genera con ruido y senoides (no hay biblioteca de efectos con licencia en el repo).
Salida: public/policia/foley.wav (48 kHz estéreo, 13.5 s, pico -3 dBFS).

Uso: python3 scripts/make_foley.py
"""
import os
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 13.5
OUT = f"{ROOT}/public/policia/foley.wav"
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def place(buf, x, t):
    s = int(t * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += x[: e - s]


def band(x, lo, hi):
    sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def click(gain=0.35):
    """Clic de 8 ms con pico en 2.5 kHz."""
    n = int(0.008 * SR)
    x = band(rng.standard_normal(n), 1800, 4000) * np.exp(-np.arange(n) / (0.002 * SR))
    return x * gain


def thud(f0=55, dur=0.6, gain=0.9):
    """Impacto grave: senoide que baja de tono con caída exponencial y un transitorio de ruido."""
    t = t_axis(dur)
    f = f0 * (1 + 1.2 * np.exp(-t / 0.05))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur / 4))
    crack = band(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t / 0.01) * 0.4
    return (body + crack) * gain


def whoosh(dur=0.45, lo=400, hi=5000, gain=0.3, rise=True):
    """Barrido de ruido filtrado con envolvente en subida (o caída)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # Pasa-banda que sube de frecuencia: se aproxima con dos filtros mezclados por tramo.
    out = np.zeros(n)
    steps = 12
    edges = np.linspace(0, n, steps + 1).astype(int)
    for i in range(steps):
        frac = i / (steps - 1)
        f_lo = lo + (hi - lo) * (frac if rise else 1 - frac)
        seg = band(x[edges[i]: edges[i + 1]], max(60, f_lo * 0.8), min(SR / 2 - 100, f_lo * 1.2))
        out[edges[i]: edges[i + 1]] = seg
    env = np.sin(np.pi * t / dur) ** 2
    return out * env * gain


def radio_beep(f=1000, dur=0.12, gain=0.22):
    t = t_axis(dur)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * f * t)
    env = np.minimum(1, np.minimum(t / 0.005, (dur - t) / 0.005).clip(0))
    return band(x * env, 300, 3400) * gain


def shutter(gain=0.5):
    """Disparo de obturador: dos golpes de ruido metálico de 4 ms y 25 ms."""
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    x = band(rng.standard_normal(n), 2500, 7000) * np.exp(-t / 0.004)
    x2 = band(rng.standard_normal(n), 800, 3000) * np.exp(-t / 0.012) * 0.6
    return (x + x2) * gain


def heart(gain=0.8):
    """Latido doble lub-dub: dos golpes graves cortos separados 0.25 s."""
    lub = thud(f0=60, dur=0.18, gain=gain)
    dub = thud(f0=70, dur=0.14, gain=gain * 0.7)
    buf = np.zeros(int(0.3 * SR))
    place(buf, lub, 0.0)
    place(buf, dub, 0.25)
    return buf


def riser(dur=0.7, gain=0.25):
    """Subida tensa: sinusoide que sube una octava con ruido filtrado."""
    t = t_axis(dur)
    f = 180 * 2 ** (t / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + band(rng.standard_normal(len(t)), 500, 4000) * 0.2
    return x * (t / dur) ** 2 * gain


def main():
    buf = np.zeros(int(DUR * SR))

    # Clic en cada subtítulo (entradas de Policia.tsx).
    for t in (0.05, 1.33, 2.58, 5.22, 6.98, 9.38):
        place(buf, click(), t)

    # Tarjeta 1 «Nos están censurando» entra en 0.0 (gancho de los primeros 0.3 s).
    place(buf, thud(55, 0.6, 0.85), 0.0)

    # Tarjeta 2 «Llega la Policía Nacional» en 2.6: barrido + radio policial.
    place(buf, whoosh(0.45, 400, 5000, 0.28, rise=True), 2.25)
    place(buf, radio_beep(1000, 0.12, 0.22), 2.9)
    place(buf, radio_beep(1400, 0.12, 0.22), 3.08)

    # Tarjeta 3 «Porque estamos grabando» en 7.0: tres disparos de obturador.
    for t in (7.0, 7.09, 7.22):
        place(buf, shutter(0.5), t)

    # Latido en «de inmediato» y al final de la pieza.
    place(buf, heart(0.6), 9.4)
    place(buf, riser(0.7, 0.25), 10.8)
    place(buf, heart(0.55), 11.5)
    place(buf, thud(42, 1.2, 0.9), 11.5)

    buf = buf / max(1e-9, np.max(np.abs(buf))) * 10 ** (-3 / 20)
    stereo = np.stack([buf, buf], 1)
    pcm = (stereo * 32767).astype("<i2")
    tmp = os.path.join(os.path.dirname(OUT), "_foley_tmp.wav")
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ar", "48000", "-ac", "2", OUT], check=True)
    os.remove(tmp)
    print("listo", OUT)


if __name__ == "__main__":
    main()
