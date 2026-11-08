"""Musica original (sin derechos) para el video de Apolo: ukelele rasgueado,
bajo, palmas, bombo, shaker y campanitas en Do mayor, estilo alegre/familiar.

Uso: python3 make_music.py DURACION_TOTAL SEGUNDO_DEL_LOGO salida.wav
El acorde final ("ta-da") cae exactamente en SEGUNDO_DEL_LOGO.
"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter, fftconvolve

SR = 48000
BPM = 118
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

total, hit, out_path = float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]
n_bars = int(np.ceil(hit / BAR))
t0 = hit - n_bars * BAR            # la musica "empieza" antes de 0 para que el compas cuadre
N = int((total - t0 + 0.5) * SR)
L = np.zeros(N); R = np.zeros(N)

def at(t):
    return int(round((t - t0) * SR))

def add(sig, t, gain=1.0, pan=0.0):
    i = at(t)
    if i >= N: return
    if i < 0:
        sig = sig[-i:]; i = 0
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * l * 1.414
    R[i:i + len(sig)] += sig * gain * r * 1.414

def midi(n):
    return 440 * 2 ** ((n - 69) / 12)

# ---------- instrumentos ----------
def pluck(freq, dur=1.6, bright=0.6, decay=0.996):
    """Karplus-Strong (cuerda pulsada, tipo ukelele)."""
    P = SR / freq; Pi = int(P)
    n = int(dur * SR)
    burst = rng.uniform(-1, 1, Pi + 1)
    b, a = butter(1, min(0.99, bright * 0.9), btype="low")
    burst = lfilter(b, a, burst)
    x = np.zeros(n); x[: len(burst)] = burst
    # y[n] = x[n] + decay * (y[n-Pi] + y[n-Pi-1]) / 2  (lazo con paso bajo)
    Pi = max(2, int(round(P - 0.5)))
    a_coef = np.zeros(Pi + 2); a_coef[0] = 1
    a_coef[Pi] = -decay * 0.5; a_coef[Pi + 1] = -decay * 0.5
    y = lfilter([1.0], a_coef, x)
    env = np.minimum(1, np.linspace(0, 1, n) * 400)
    return y * env * 0.5

def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 90 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 1.0

def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    b, a = butter(2, [900 / (SR / 2), 3500 / (SR / 2)], btype="band")
    noise = lfilter(b, a, noise)
    env = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR); env[i:] += np.exp(-(t[: n - i]) * (180 if k < 2 else 22))
    return noise * env * 1.6

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    b, a = butter(2, 7000 / (SR / 2), btype="high")
    return lfilter(b, a, noise) * np.exp(-t * (18 if open_ else 70)) * 0.5

def shaker():
    n = int(0.07 * SR); t = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    b, a = butter(2, 5000 / (SR / 2), btype="high")
    env = np.sin(np.pi * np.minimum(t / 0.07, 1)) ** 2
    return lfilter(b, a, noise) * env * 0.25

def bass(freq, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    env = np.minimum(1, t * 300) * np.exp(-t * 3.5)
    return np.tanh(1.5 * s * env) * 0.55

def bell(freq, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 4)
         + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 9)
         + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 16))
    return s * np.minimum(1, t * 2000) * 0.35

# ---------- armonia: C - G - Am - F (I-V-vi-IV) ----------
CHORDS = [
    ("C", [60, 64, 67, 72], 36),
    ("G", [59, 62, 67, 71], 43),
    ("Am", [60, 64, 69, 72], 45),
    ("F", [60, 65, 69, 72], 41),
]
# rasgueo "isleño": D . D U . U D U  (en corcheas)
STRUM = [(0, "D"), (2, "D"), (3, "U"), (5, "U"), (6, "D"), (7, "U")]
BASS = [(0, 0, 0.45), (3, 0, 0.2), (4, 12, 0.3), (6, 7, 0.25)]   # (corchea, intervalo, dur)
BELLS = [[72, 76, 79, 76], [71, 74, 79, 74], [72, 76, 81, 76], [72, 77, 81, 77]]

def strum(notes, t, direction, vel):
    order = notes if direction == "D" else notes[::-1]
    for k, m in enumerate(order):
        add(pluck(midi(m), dur=1.2, bright=0.55 if direction == "D" else 0.7),
            t + k * 0.012, gain=vel * (0.9 if direction == "D" else 0.6), pan=-0.25)

for b in range(n_bars):
    tb = t0 + b * BAR
    name, notes, root = CHORDS[b % 4]
    intro = b == 0
    for e8, d in STRUM:
        strum(notes, tb + e8 * BEAT / 2, d, 0.55)
    for e8, iv, dur in BASS:
        add(bass(midi(root + iv), dur + 0.15), tb + e8 * BEAT / 2, gain=0.9)
    for q in range(4):
        add(kick(), tb + q * BEAT, gain=0.0 if intro and q % 2 else 0.85)
        if q in (1, 3): add(clap(), tb + q * BEAT, gain=0.5, pan=0.1)
        add(hat(), tb + q * BEAT + BEAT / 2, gain=0.6, pan=0.35)
    for s16 in range(16):
        add(shaker(), tb + s16 * BEAT / 4, gain=0.6 if s16 % 2 else 0.35, pan=0.5)
    for q, m in enumerate(BELLS[b % 4]):
        add(bell(midi(m + 12)), tb + q * BEAT + (BEAT / 2 if q % 2 else 0), gain=0.22, pan=0.4)

# "ta-da" final en el logo + campanitas subiendo
tH = hit
for k, m in enumerate([48, 60, 64, 67, 72, 76]):
    add(pluck(midi(m), dur=3.5, bright=0.6, decay=0.998), tH + k * 0.015, gain=0.6, pan=-0.2)
add(bass(midi(36), 2.5), tH, gain=1.0)
add(kick(), tH, gain=1.0); add(clap(), tH, gain=0.5)
add(hat(open_=True), tH, gain=0.8, pan=0.3)
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(bell(midi(m + 12), 2.0), tH + 0.18 + k * BEAT / 4, gain=0.25, pan=0.4 - k * 0.15)

# ---------- reverb + master ----------
mix = np.stack([L, R])
ir_n = int(1.3 * SR); ti = np.arange(ir_n) / SR
for ch in range(2):
    ir = rng.uniform(-1, 1, ir_n) * np.exp(-ti * 4.5)
    b, a = butter(1, 5000 / (SR / 2)); ir = lfilter(b, a, ir); ir[0] = 0
    wet = fftconvolve(mix[ch], ir)[:N] * 0.015
    mix[ch] = mix[ch] + wet
s0 = at(0.0)
mix = mix[:, s0: s0 + int(total * SR)]
n = mix.shape[1]; t = np.arange(n) / SR
fade = np.minimum(1, t / 0.25) * np.clip((total - t) / 0.6, 0, 1)
mix *= fade
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) * 0.85
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(out_path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"musica: {total:.2f}s, {BPM} bpm, {n_bars} compases antes del logo ({hit:.2f}s)")
