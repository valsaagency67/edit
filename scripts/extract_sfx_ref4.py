#!/usr/bin/env python3
"""Efectos de sonido del video de referencia que mandó el cliente para el video «cinematográfico» de Pepo 3
(media/ref/referencia-4.mp4, «mis sonidos favoritos de CapCut», no versionado). El autor los muestra uno por uno
mientras habla, así que primero se separa la voz de los efectos con UVR-MDX-NET-Inst_HQ_3 (sherpa-onnx,
whisper-models/sep/) y después se corta cada efecto donde él lo demuestra:

  ref2-riser       riser metálico «para generar impacto al comienzo de tus videos» (15,8–17,7 s)
  ref2-click       «Enter / Click / Select» para enumerar: primero, segundo, tercero (19,65–20,25 s)
  ref2-impact      «Trailer impact» para las partes importantes o polémicas (22,95–25,0 s)
  ref2-impact2     el mismo impacto, segunda demostración (25,85–27,6 s)
  ref2-shutter     el obturador «de calidad» para transiciones (37,6–38,4 s)
  ref2-transicion  «转场 10», para movimientos (41,85–43,1 s)

Salida: public/sfx/ref2-*.wav (48 kHz estéreo, pico -3 dBFS; no versionados).
Uso: python3 scripts/extract_sfx_ref4.py
"""
import os
import subprocess

import numpy as np
import sherpa_onnx as so

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
CUTS = {"riser": (15.8, 17.7), "click": (19.65, 20.25), "impact": (22.95, 25.0), "impact2": (25.85, 27.6),
        "shutter": (37.6, 38.4), "transicion": (41.85, 43.1)}


def efectos():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{ROOT}/media/ref/referencia-4.mp4", "-f", "f32le",
                          "-ac", "2", "-ar", "44100", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).T.copy()
    cfg = so.OfflineSourceSeparationConfig(model=so.OfflineSourceSeparationModelConfig(
        uvr=so.OfflineSourceSeparationUvrModelConfig(model=f"{ROOT}/whisper-models/sep/UVR-MDX-NET-Inst_HQ_3.onnx"),
        num_threads=os.cpu_count() or 4))
    inst = np.array(so.OfflineSourceSeparation(cfg).process(sample_rate=44100, samples=x).stems[0].data)
    res = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", "44100", "-ac", "2", "-i", "-",
                          "-f", "f64le", "-ar", str(SR), "-"], input=inst.T.astype(np.float32).tobytes(),
                         capture_output=True, check=True).stdout
    return np.frombuffer(res, np.float64).reshape(-1, 2)


if __name__ == "__main__":
    x = efectos()
    os.makedirs(f"{ROOT}/public/sfx", exist_ok=True)
    for name, (a, b) in CUTS.items():
        seg = x[int(a * SR):int(b * SR)].copy()
        f, t = int(0.006 * SR), int(0.12 * SR)
        seg[:f] *= np.linspace(0, 1, f)[:, None]
        seg[-t:] *= np.linspace(1, 0, t)[:, None]
        seg *= 10 ** (-3 / 20) / np.abs(seg).max()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        f"{ROOT}/public/sfx/ref2-{name}.wav"], input=seg.tobytes(), check=True)
        print("listo:", name)
