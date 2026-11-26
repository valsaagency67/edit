# Genera música ambient original (sin licencias) + efectos para el video de FacturApp.
import numpy as np, wave, sys
SR = 44100
DUR = 40.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env_ar(n, a, r):
    e = np.ones(n); a = int(a * SR); r = int(r * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e

bpm = 96
beat = 60 / bpm
bar = beat * 4
# Am9 - Fmaj7 - Cmaj9 - G6  (2 compases c/u)
chords = [
    ([57, 64, 67, 71, 72], 45),
    ([53, 60, 64, 67, 69], 41),
    ([60, 64, 67, 71, 74], 48),
    ([55, 62, 66, 71, 76], 43),
]
L = np.zeros(N); R = np.zeros(N)

def add(sig, start, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    seg = sig[: N - i]
    L[i:i+len(seg)] += seg * (1 - max(pan, 0))
    R[i:i+len(seg)] += seg * (1 + min(pan, 0))

# Pads
chord_len = bar * 2
k = 0
while k * chord_len < DUR:
    notes, bass = chords[k % 4]
    start = k * chord_len
    n = int((chord_len + 2.5) * SR)
    tt = np.arange(n) / SR
    pad = np.zeros(n)
    for j, m in enumerate(notes):
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            pad += np.sin(2*np.pi*ff*tt + j) * 0.5 + np.sin(2*np.pi*2*ff*tt) * 0.12 + np.sin(2*np.pi*3*ff*tt) * 0.04
    pad *= 0.018 * env_ar(n, 1.6, 2.4)
    # tremolo suave
    pad *= 0.85 + 0.15 * np.sin(2*np.pi*0.18*tt + k)
    add(pad, start, 0.0)
    b = np.sin(2*np.pi*midi(bass)*tt) * 0.16 * env_ar(n, 0.6, 1.8)
    add(b, start, 0.0)
    k += 1

# Arpegio tipo pluck con eco
step = beat / 2
idx = 0
tm = 0.0
patterns = [0, 2, 4, 3, 2, 4, 1, 3]
while tm < DUR:
    ci = int(tm // chord_len) % 4
    notes = chords[ci][0]
    m = notes[patterns[idx % 8] % len(notes)] + 12
    # entra suave desde 2s, más presente tras 15s
    gain = np.clip((tm - 2) / 4, 0, 1) * (0.55 if tm < 15 else 0.85)
    n = int(1.4 * SR); tt = np.arange(n) / SR
    f = midi(m)
    p = (np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*6) + 0.15*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*9)) * np.exp(-tt*4.2)
    p[:int(0.004*SR)] *= np.linspace(0, 1, int(0.004*SR))
    add(p * 0.075 * gain, tm, pan=(-0.5 if idx % 2 else 0.5))
    tm += step; idx += 1

# Pulso suave (kick sub) a partir de 15s
tm = 15.0
while tm < 38.0:
    n = int(0.35 * SR); tt = np.arange(n) / SR
    fr = 120 * np.exp(-tt * 18) + 45
    kk = np.sin(2*np.pi*np.cumsum(fr)/SR) * np.exp(-tt * 9) * 0.22
    add(kk, tm)
    tm += beat

# Hi-hat muy suave en contratiempo desde 22s
tm = 22.0 + beat / 2
while tm < 38.0:
    n = int(0.05 * SR)
    h = rng.standard_normal(n) * np.exp(-np.arange(n)/SR*90)
    h = np.diff(h, prepend=0) * 0.05
    add(h, tm, 0.3)
    tm += beat
# Eco estéreo
def echo(x, d, g):
    y = x.copy(); s = int(d*SR)
    for r in range(1, 5):
        y[r*s:] += x[:-r*s] * (g ** r)
    return y
L = echo(L, beat*0.75, 0.38); R = echo(R, beat*0.5, 0.38)
# fades
fade = np.minimum(np.minimum(t / 2.0, 1), np.clip((DUR - t) / 2.5, 0, 1))
L *= fade; R *= fade
pk = max(np.abs(L).max(), np.abs(R).max())
L, R = L / pk * 0.85, R / pk * 0.85

def write(path, l, r):
    s = (np.stack([l, r], 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes())
out = sys.argv[1]
write(out + "/music.wav", L, R)

# SFX
def sfx(name, sig):
    sig = sig / max(np.abs(sig).max(), 1e-9) * 0.8
    write(f"{out}/{name}.wav", sig, sig)
# Obturador
n = int(0.32*SR); tt = np.arange(n)/SR
sh = np.zeros(n)
for off, g in ((0.0, 1.0), (0.11, 0.7)):
    i = int(off*SR); m = int(0.05*SR)
    c = rng.standard_normal(m) * np.exp(-np.arange(m)/SR*120)
    sh[i:i+m] += np.diff(c, prepend=0) * g
sfx("shutter", sh)
# Éxito (campanita)
n = int(1.6*SR); tt = np.arange(n)/SR
ch = np.zeros(n)
for off, m in ((0.0, 79), (0.09, 83), (0.18, 86)):
    i = int(off*SR); tl = tt[:n-i]
    ch[i:] += (np.sin(2*np.pi*midi(m)*tl) + 0.3*np.sin(2*np.pi*midi(m)*2.01*tl)) * np.exp(-tl*3.2)
sfx("success", ch)
# Whoosh
n = int(0.7*SR); tt = np.arange(n)/SR
w = rng.standard_normal(n)
# filtro paso-banda barrido simple por modulación de media móvil
k = np.cumsum(w); 
w = np.convolve(w, np.ones(24)/24, mode="same")
w *= np.sin(np.pi * np.clip(tt/0.7, 0, 1)) ** 2
sfx("whoosh", w)
