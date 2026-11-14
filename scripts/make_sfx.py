#!/usr/bin/env python3
"""Sintetiza los efectos de sonido del video (sin licencias de terceros) en public/sfx/.

- transition.wav: barrido de aire suave (ruido filtrado con envolvente seno) + campanita
  Do6/Sol6 con decaimiento exponencial. Reemplaza al whoosh, que el cliente rechazó.
- click.wav: "tic" único y corto (~10 ms) con brillo en 1.5–3 kHz, medido en la
  referencia de Duvalier (aparece con cada palabra de la tipografía cinética).
Uso: python3 scripts/make_sfx.py
"""
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")
rng = np.random.default_rng(7)


def lowpass(x, cutoff):
    # Filtro de un polo, aplicado dos veces (12 dB/oct).
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for i, v in enumerate(x):
            acc = (1 - a) * v + a * acc
            y[i] = acc
        x = y
    return x


def save(name, x, peak_db):
    x = x / np.max(np.abs(x)) * 10 ** (peak_db / 20)
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def transition():
    dur = 0.9
    t = np.arange(int(SR * dur)) / SR
    # Aire: ruido blanco -> paso bajo 2.5 kHz menos paso bajo 250 Hz (banda suave), envolvente seno de 0.42 s.
    n = rng.standard_normal(len(t))
    air = lowpass(n, 2500) - lowpass(n, 250)
    swell = np.where(t < 0.42, np.sin(np.pi * t / 0.42) ** 2, 0)
    air *= swell * 0.9
    # Campanita: Do6 + Sol6 (+ octava suave), entra en el pico del barrido.
    tb = np.clip(t - 0.2, 0, None)
    bell_env = np.where(t >= 0.2, (1 - np.exp(-tb / 0.004)) * np.exp(-tb / 0.28), 0)
    bell = (np.sin(2 * np.pi * 1046.5 * tb) + 0.6 * np.sin(2 * np.pi * 1568.0 * tb)
            + 0.15 * np.sin(2 * np.pi * 2093.0 * tb)) * bell_env * 0.22
    save("transition.wav", air / np.max(np.abs(air)) * 0.55 + bell, -8)


def click():
    dur = 0.06
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t / 0.0028)
    noise = rng.standard_normal(len(t))
    # Ruido en banda 1.5-3 kHz (diferencia de dos paso bajo) + cuerpo seno a 2.1 kHz.
    band = lowpass(noise, 3000) - lowpass(noise, 1500)
    body = np.sin(2 * np.pi * 2100 * t) * np.exp(-t / 0.004)
    x = (band / np.max(np.abs(band)) * 0.7 + 0.5 * body) * env
    save("click.wav", lowpass(x, 3500), -8)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    click()
    print("listo: click.wav")
