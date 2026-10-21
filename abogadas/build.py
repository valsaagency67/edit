#!/usr/bin/env python3
"""Edita los videos de consultoría de Enso Jurídicos (pensión y cartera vencida).

- Corta todas las pausas (> 0.22 s, decididas por el audio) para que hable de seguido.
- Acercamientos y alejamientos sobre la cara con whoosh; obturador + destello en los cambios de tema.
- Subtítulos palabra por palabra (Montserrat ExtraBold, palabra activa en dorado), sin sonido.
- Textos grandes con un clic suave y «magic reveal» solo para revelar la marca.
- Tomas de apoyo a pantalla completa (apoyo.py): gráficos animados y la biblioteca de la oficina.
  Los 4 efectos son los del video de referencia del cliente (sfx/*.wav, sin el «faaahh»), pocos y bajos
  (el cliente pidió menos sonidos en los textos).
- Voz limpia (RNNoise) y nivelada a -14 LUFS.

Uso: python3 abogadas/build.py abogadas/pension.config.json [--draft]
Salida: out/abogadas/<nombre>.mp4 (1080x1920, H.264 CRF 16, AAC 320k) y <nombre>-celular.mp4 (540x960).
"""
import json
import os
import re
import subprocess
import sys
import unicodedata
import wave

import numpy as np
from PIL import Image

import apoyo

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FPS = 30
W, H = 1080, 1920
SR = 48000
PAD_IN, PAD_OUT = 0.05, 0.10  # margen antes y después de cada tramo de voz
TAIL = 0.9  # segundos de imagen después de la última palabra (para leer el cierre)

# Paleta: blanco, dorado y azul noche (sobria, de firma de abogados).
GOLD = "&H004EC1F2&"  # #F2C14E
NAVY = "&H004B2913&"  # #13294B
WHITE = "&H00FFFFFF&"
BLACK = "&H00000000&"


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


# ---------------------------------------------------------------- tiempos

def speech_segments(src, dur):
    """Tramos con voz según el audio (silencios > 0.22 s a -38 dB)."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vn", "-af",
                        "highpass=f=100,silencedetect=n=-38dB:d=0.22", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    sil = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
    segs, t = [], 0.0
    for a, b in sil:
        if a > t:
            segs.append([t, a])
        t = b
    if t < dur:
        segs.append([t, dur])
    return [s for s in segs if s[1] - s[0] > 0.1]


def load_words(name, segs):
    """Palabras con tiempos. La primera palabra después de un silencio viene adelantada (~0.3 s):
    se acomoda al inicio real del tramo y las que quedan encimadas se reparten por largo."""
    raw = json.load(open(os.path.join(HERE, "subs", name + ".json")))
    words = [{"t": w["text"].strip(), "s": w["startMs"] / 1000, "e": w["endMs"] / 1000} for w in raw]
    for w in words:
        mid = w["s"] + 0.25
        w["seg"] = min(range(len(segs)), key=lambda k: 0 if segs[k][0] <= mid <= segs[k][1]
                       else min(abs(mid - segs[k][0]), abs(mid - segs[k][1])))
    for k, (a, b) in enumerate(segs):
        ws = [w for w in words if w["seg"] == k]
        if not ws:
            continue
        # Palabras que empiezan antes del tramo (o casi encima de su inicio) se reparten.
        n = 0
        while n < len(ws) and ws[n]["s"] < a + 0.12 * (n + 1):
            n += 1
        if n:
            stop = ws[n]["s"] if n < len(ws) else b
            chars = [max(2, len(w["t"])) for w in ws[:n]]
            t = a
            for w, c in zip(ws[:n], chars):
                w["s"] = t
                t += (stop - a) * c / sum(chars)
        for i, w in enumerate(ws):
            nxt = ws[i + 1]["s"] if i + 1 < len(ws) else b
            w["e"] = max(w["s"] + 0.08, min(w["e"], nxt, b))
    return words


def find(words, ref):
    """«texto#n»: n-ésima palabra (1..) que coincide con «texto»."""
    if ref == "END":
        return None
    txt, _, n = ref.partition("#")
    hits = [w for w in words if norm(w["t"]) == norm(txt)]
    if not hits:
        raise SystemExit(f"No encuentro la palabra «{ref}»")
    return hits[int(n or 1) - 1]


# ---------------------------------------------------------------- línea de tiempo

class Timeline:
    """Tramos conservados (en segundos del original, en frames exactos) y conversión a tiempo de salida."""

    def __init__(self, segs, last_word_end, dur):
        keep = []
        for i, (a, b) in enumerate(segs):
            a, b = max(0, a - PAD_IN), min(dur, b + PAD_OUT)
            if i == len(segs) - 1 or b >= last_word_end:
                b = min(dur, max(b, last_word_end + TAIL))
            keep.append([round(a * FPS) / FPS, round(b * FPS) / FPS])
            if b >= last_word_end + TAIL - 1e-6:
                break
        merged = []
        for a, b in keep:
            if merged and a <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], b)
            else:
                merged.append([a, b])
        self.keep = merged
        self.offsets, t = [], 0.0
        for a, b in merged:
            self.offsets.append(t)
            t += b - a
        self.duration = t
        self.cuts = self.offsets[1:]

    def out(self, t):
        for (a, b), o in zip(self.keep, self.offsets):
            if t < b:
                return o + max(0.0, t - a)
        return self.duration


# ---------------------------------------------------------------- audio

def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        x = x.reshape(-1, w.getnchannels()).mean(axis=1)
        if w.getframerate() != SR:
            n = int(len(x) * SR / w.getframerate())
            x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    return x


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.repeat(x[:, None], 2, axis=1) * 32767).astype(np.int16).tobytes())


def voice(src, tl, tmp):
    """Tramos conservados con fundidos de 8 ms en cada corte, RNNoise, EQ de presencia, compresión y -14 LUFS."""
    sel = "+".join(f"between(t,{a:.4f},{b:.4f})" for a, b in tl.keep)
    model = os.path.join(HERE, "models", "rnnoise-std.rnnn")
    raw = f"{tmp}/voz-cortes.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-af",
         f"aselect='{sel}',asetpts=N/SR/TB,aresample={SR}", "-ac", "1", raw])
    x = read_wav(raw)
    fade = int(0.008 * SR)
    ramp = np.linspace(0, 1, fade)
    for o in tl.cuts:
        i = int(round(o * SR))
        if fade <= i <= len(x) - fade:
            x[i - fade:i] *= ramp[::-1]
            x[i:i + fade] *= ramp
    write_wav(raw, x)
    out = f"{tmp}/voz.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
         f"highpass=f=80,arnndn=m='{model}':mix=0.85,equalizer=f=250:t=q:w=1:g=-2,"
         "equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
         "loudnorm=I=-15:TP=-2:LRA=7", "-ar", str(SR), "-ac", "2", out])
    return out


def place(buf, x, t):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i:i + n] += x[:n]


def sfx_track(events, dur, tmp):
    s = {n: read_wav(os.path.join(HERE, "sfx", n + ".wav")) for n in ("click", "magic", "whoosh", "shutter")}
    # Pico del whoosh en el acercamiento.
    peak = {n: int(np.argmax(np.abs(x))) / SR for n, x in s.items()}
    buf = np.zeros(int((dur + 3) * SR))
    for kind, t, gain in events:
        lead = peak[kind] if kind in ("whoosh", "shutter") else 0.0
        place(buf, s[kind] * gain, t - lead)
    out = f"{tmp}/efectos.wav"
    write_wav(out, buf[: int(dur * SR) + SR // 2])
    return out


# ---------------------------------------------------------------- subtítulos y textos (ASS)

def ts(t):
    t = max(0.0, t)
    h, m = int(t // 3600), int(t % 3600 // 60)
    return f"{h}:{m:02d}:{t % 60:05.2f}"


ASS_HEAD = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Montserrat ExtraBold,86,{WHITE},{WHITE},{BLACK},&H80000000&,0,0,0,0,100,100,0,0,1,7,3,5,60,60,0,1
Style: Big,Montserrat Black,100,{WHITE},{WHITE},{NAVY},&H00000000&,0,0,0,0,100,100,1,0,3,20,0,5,40,40,0,1
Style: Box,Montserrat Black,70,{WHITE},{WHITE},{NAVY},&H00000000&,0,0,0,0,100,100,1,0,3,18,0,4,40,40,0,1
Style: Flash,Montserrat Black,10,{WHITE},{WHITE},{WHITE},{WHITE},0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

CAP_Y = 1400  # centro de los subtítulos: debajo de la cara, encima de la interfaz de Reels/TikTok
BIG_Y = 560  # textos grandes: arriba de la cabeza, dentro del recorte 4:5 de Instagram


def caption_blocks(words, tl):
    """Bloques de máx. 3 palabras / 18 caracteres; corte en puntuación, pausa o cambio de tramo."""
    blocks, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        text = " ".join(x["t"] for x in cur)
        if (nxt is None or w["t"][-1] in ".,?!" or len(cur) == 3 or len(text) + len(nxt["t"]) > 18
                or nxt["seg"] != w["seg"]):
            blocks.append(cur)
            cur = []
    return blocks


def pop(scale=100, t0=0):
    """Entrada con rebote: 65 % → 108 % → 100 % en ~0.22 s."""
    a = int(scale * 0.65)
    b = int(scale * 1.08)
    return (f"\\fscx{a}\\fscy{a}\\t({t0},{t0 + 130},\\fscx{b}\\fscy{b})"
            f"\\t({t0 + 130},{t0 + 220},\\fscx{scale}\\fscy{scale})")


def build_ass(cfg, words, tl, path):
    ev = []
    sfx = []
    o = tl.out
    # Subtítulos palabra por palabra.
    blocks = caption_blocks(words, tl)
    for b, blk in enumerate(blocks):
        start = o(blk[0]["s"])
        end = o(blk[-1]["e"]) + 0.12
        if b + 1 < len(blocks):
            end = min(end, o(blocks[b + 1][0]["s"]))
        for j, w in enumerate(blk):
            ws = o(w["s"]) if j else start
            we = o(blk[j + 1]["s"]) if j + 1 < len(blk) else end
            parts = []
            for k, x in enumerate(blk):
                t = x["t"].upper()
                parts.append(f"{{\\c{GOLD}}}{t}{{\\c{WHITE}}}" if k == j else t)
            anim = pop() if j == 0 else ""
            ev.append(f"Dialogue: 2,{ts(ws)},{ts(we)},Cap,,0,0,0,,{{\\an5\\pos({W // 2},{CAP_Y}){anim}}}"
                      + " ".join(parts))
    # Textos grandes.
    for tx in cfg["texts"]:
        w0 = find(words, tx["at"])
        t0 = o(w0["s"])
        until = find(words, tx["until"])
        t1 = (o(until["s"]) - 0.05) if until else tl.duration
        style = tx.get("style", "plain")
        if "list" in tx:
            # Lista que se arma ítem por ítem, en cajas azul noche.
            for i, (item, ref) in enumerate(zip(tx["list"], tx["items_at"])):
                ti = o(find(words, ref)["s"])
                y = BIG_Y - 170 + i * 150
                ev.append(f"Dialogue: 3,{ts(ti)},{ts(t1)},Box,,0,0,0,,"
                          f"{{\\an4\\pos(110,{y})\\fad(0,150)\\c{WHITE}{pop(100)}}}{{\\c{GOLD}}}• {{\\c{WHITE}}}{item}")
                if i == 0:
                    sfx.append(("click", ti, 0.4))
            continue
        n = len(tx["lines"])
        for i, line in enumerate(tx["lines"]):
            delay = i * 140
            y = tx.get("y", BIG_Y) - (n - 1) * 80 + i * 160
            color = GOLD if (style == "gold" or (style == "brand" and i == 1)) else WHITE
            size = 120 if style == "brand" and i == 0 else 100
            ev.append(f"Dialogue: 4,{ts(t0)},{ts(t1)},Big,,0,0,0,,"
                      f"{{\\an5\\pos({W // 2},{y})\\fs{size}\\c{color}\\fad(0,150){pop(100, delay)}}}{line}")
        if style == "brand":
            # Filete dorado debajo de la marca.
            y = BIG_Y + 80 + 100
            ev.append(f"Dialogue: 4,{ts(t0 + 0.25)},{ts(t1)},Flash,,0,0,0,,"
                      f"{{\\an7\\pos({W // 2 - 170},{y})\\c{GOLD}\\bord0\\shad0\\fad(0,150)"
                      f"\\fscx0\\t(0,250,\\fscx100)\\p1}}m 0 0 l 340 0 340 8 0 8{{\\p0}}")
        kind = tx.get("sfx", "click")
        sfx.append((kind, t0, 0.35 if kind == "magic" else 0.4))
    # Destello cálido en los cambios de tema (con obturador).
    for ref in cfg.get("transitions", []):
        t = o(find(words, ref)["s"]) - PAD_IN
        t = min(tl.cuts, key=lambda c: abs(c - t)) if tl.cuts else t
        # +0.01 s: que el destello no caiga en el último frame del tramo anterior (ASS redondea a centésimas).
        ev.append(f"Dialogue: 9,{ts(t + 0.01)},{ts(t + 0.3)},Flash,,0,0,0,,"
                  f"{{\\an7\\pos(0,0)\\c&H00E0F3FF&\\1a&H40&\\t(0,300,\\1a&HFF&)\\bord0\\shad0\\p1}}"
                  f"m 0 0 l {W} 0 {W} {H} 0 {H}{{\\p0}}")
        sfx.append(("shutter", t, 0.5))
    open(path, "w").write(ASS_HEAD + "\n".join(ev) + "\n")
    return sfx


# ---------------------------------------------------------------- imagen

def zoom_curve(cfg, words, tl):
    """Zoom en cada frame. En un corte el cambio es seco; dentro de un tramo, acercamiento suave de 0.25 s."""
    keys = sorted((tl.out(find(words, z["at"])["s"]) - 0.04, z["z"]) for z in cfg["zooms"])
    n = int(round(tl.duration * FPS))
    zs = np.ones(n) * cfg.get("zoom_start", 1.0)
    events = []
    cur = cfg.get("zoom_start", 1.0)
    t_prev = 0.0
    for t, z in keys + [(tl.duration + 1, None)]:
        i0, i1 = int(t_prev * FPS), min(n, int(t * FPS))
        zs[i0:i1] = cur
        if z is None:
            break
        near = [c for c in tl.cuts if abs(c - (t + 0.04)) < 0.12]
        if near:
            t = near[0]
        else:
            dur = 0.25
            j0, j1 = int(t * FPS), min(n, int((t + dur) * FPS))
            for j in range(j0, j1):
                u = (j - j0) / max(1, j1 - j0)
                zs[j] = cur + (z - cur) * (1 - (1 - u) ** 3)
            t += dur
        events.append(("whoosh", t if near else t - 0.1, 0.4))
        cur, t_prev = z, t
    zs[int(t_prev * FPS):] = cur
    return zs, events


def snap(t, tl):
    near = [c for c in tl.cuts if abs(c - t) < 0.12]
    return near[0] if near else t


def inserts(cfg, words, tl):
    """Tomas de apoyo: [(t0, t1, frame(t, dur), extra_sfx)] en tiempo de salida."""
    out = []
    for ins in cfg.get("inserts", []):
        t0 = snap(tl.out(find(words, ins["at"])["s"]) - 0.04, tl)
        until = find(words, ins["until"])
        t1 = snap(tl.out(until["s"]) - 0.04, tl) if until else tl.duration
        kind = ins["kind"]
        extra = []
        if kind == "bookshelf":
            fn = apoyo.Bookshelf(os.path.join(ROOT, ins["src"]), ins.get("from", 16.0), t1 - t0, FPS)
        else:
            kw = {}
            if "lines" in ins:
                kw["lines"] = tuple(ins["lines"])
            if "label" in ins:
                kw["label"] = ins["label"]
            if "stamp" in ins:
                kw["stamp_at"] = tl.out(find(words, ins["stamp"])["s"]) - t0
                extra.append(("click", t0 + kw["stamp_at"], 0.45))
            g = apoyo.GRAPHICS[kind]
            fn = (lambda g, kw: lambda t, d: g(t, d, **kw))(g, kw)
        out.append((t0, t1, fn, extra))
    return out


def render_video(cfg, src, tl, zs, ins, ass, mix, out, draft):
    sel = "+".join(f"between(t,{a:.4f},{b:.4f})" for a, b in tl.keep)
    fx, fy = cfg["face"][0] * W, cfg["face"][1] * H
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-an", "-vf",
         f"fps={FPS},select='{sel}',setpts=N/FRAME_RATE/TB,scale={W}:{H}:flags=lanczos,"
         "eq=contrast=1.04:saturation=1.06,unsharp=5:5:0.4",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    crf = "23" if draft else "16"
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-i", mix, "-vf", f"ass='{ass}':fontsdir='{os.path.join(HERE, 'fonts')}'",
         "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "veryfast" if draft else "slow", "-crf", crf,
         "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    size = W * H * 3
    i = 0
    while True:
        buf = dec.stdout.read(size)
        if len(buf) < size:
            break
        z = zs[min(i, len(zs) - 1)]
        t = i / FPS
        cur = [x for x in ins if x[0] <= t + 1e-6 < x[1]]
        if cur:
            t0, t1, fn, _ = cur[0]
            buf = fn(max(0.0, t - t0), t1 - t0).tobytes()
        elif abs(z - 1) > 1e-3:
            img = Image.frombuffer("RGB", (W, H), buf)
            cw, ch = W / z, H / z
            x0, y0 = fx * (1 - 1 / z), fy * (1 - 1 / z)
            img = img.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch))
            buf = img.tobytes()
        enc.stdin.write(buf)
        i += 1
    enc.stdin.close()
    dec.wait()
    enc.wait()
    if enc.returncode:
        raise SystemExit("falló el codificador")
    return i


def main():
    cfg_path = sys.argv[1]
    draft = "--draft" in sys.argv
    cfg = json.load(open(cfg_path))
    src = os.path.join(ROOT, cfg["src"])
    name = cfg["out"]
    tmp = os.path.join(ROOT, "out", "abogadas", "tmp-" + name)
    os.makedirs(tmp, exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                               capture_output=True, text=True).stdout)
    segs = speech_segments(src, dur)
    words = load_words(name, segs)
    tl = Timeline(segs, words[-1]["e"], dur)
    print(f"{name}: {dur:.2f} s → {tl.duration:.2f} s, tramos: " +
          " ".join(f"[{a:.2f}-{b:.2f}]" for a, b in tl.keep))
    # Posición de subtítulos y textos grandes (en un primer plano tipo selfie van a la altura del pecho).
    global CAP_Y, BIG_Y
    CAP_Y, BIG_Y = cfg.get("cap_y", CAP_Y), cfg.get("big_y", BIG_Y)
    ass = f"{tmp}/{name}.ass"
    sfx = build_ass(cfg, words, tl, ass)
    zs, zsfx = zoom_curve(cfg, words, tl)
    ins = inserts(cfg, words, tl)
    print("apoyo: " + " ".join(f"[{a:.2f}-{b:.2f}]" for a, b, _, _ in ins))
    vo = voice(src, tl, tmp)
    # Pocos sonidos: whoosh suave al entrar a una toma de apoyo; el de los zooms solo si se ve el zoom
    # (no dentro de una toma de apoyo) y si no hay otro sonido cerca.
    for t0, t1, _, extra in ins:
        sfx += extra
        follows = any(abs(t0 - b) < 0.05 for _, b, _, _ in ins)  # entre dos tomas de apoyo, sin sonido
        if not follows and all(abs(t0 - t) > 0.3 for _, t, _ in sfx):
            sfx.append(("whoosh", t0, 0.35))
    zsfx = [e for e in zsfx if not any(a - 0.1 <= e[1] < b for a, b, _, _ in ins)]
    zsfx = [e for e in zsfx if all(abs(e[1] - t) > 0.5 for _, t, _ in sfx)]
    print("efectos: " + " ".join(f"{k}@{t:.1f}" for k, t, _ in sorted(sfx + zsfx, key=lambda e: e[1])))
    fx = sfx_track(sfx + zsfx, tl.duration, tmp)
    mix = f"{tmp}/mezcla.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", vo, "-i", fx, "-filter_complex",
         "[1:a]volume=0.45[f];[0:a][f]amix=inputs=2:normalize=0:duration=first,"
         "alimiter=limit=0.89:level=false", "-ar", str(SR), mix])
    # Mezcla final a -14 LUFS (Reels/TikTok) con limitador a -1 dBFS.
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", mix, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", p.stderr)[-1])
    final = f"{tmp}/mezcla-14.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", mix, "-af",
         f"volume={-14 - lufs:.2f}dB,alimiter=limit=0.89:level=false", "-ar", str(SR), final])
    mix = final
    out = os.path.join(ROOT, "out", "abogadas", name + ("-borrador" if draft else "") + ".mp4")
    frames = render_video(cfg, src, tl, zs, ins, ass, mix, out, draft)
    print(f"{out}: {frames} frames")
    if not draft:
        cel = out.replace(".mp4", "-celular.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", "scale=540:960:flags=lanczos", "-c:v", "libx264",
             "-crf", "26", "-preset", "slow", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", cel])
        print(cel)


if __name__ == "__main__":
    main()
