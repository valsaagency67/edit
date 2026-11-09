"""Reduce el ruido de fondo de la voz con RNNoise (red neuronal para voz).
Uso: python3 denoise.py entrada_48k_mono.wav salida.wav [mezcla_original=0.15]"""
import sys, wave, ctypes
import numpy as np
from pyrnnoise import rnnoise as rn

inp, out = sys.argv[1], sys.argv[2]
dry = float(sys.argv[3]) if len(sys.argv) > 3 else 0.15
w = wave.open(inp); assert w.getframerate() == 48000 and w.getnchannels() == 1
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
N = rn.FRAME_SIZE

def run(sig):
    st = rn.lib.rnnoise_create(None)
    pad = np.concatenate([sig, np.zeros((-len(sig)) % N, np.float32)])
    y = np.zeros_like(pad); buf_in = (ctypes.c_float * N)(); buf_out = (ctypes.c_float * N)()
    for i in range(0, len(pad), N):
        ctypes.memmove(buf_in, pad[i:i + N].ctypes.data, N * 4)
        rn.lib.rnnoise_process_frame(st, buf_out, buf_in)
        y[i:i + N] = np.frombuffer(buf_out, np.float32, N)
    rn.lib.rnnoise_destroy(st)
    return y[:len(sig)]

y = run(x)
d = 480  # RNNoise retrasa 10 ms: se compensa antes de mezclar con el original
y = np.concatenate([y[d:], np.zeros(d, np.float32)])
mix = (1 - dry) * y + dry * x
mix = np.clip(mix, -32768, 32767).astype(np.int16)
o = wave.open(out, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(48000); o.writeframes(mix.tobytes())
