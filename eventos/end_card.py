"""Cierre animado con el logo de Apolo (fondo oscuro, destellos dorados,
entrada con zoom suave y un brillo que recorre el logo).
Uso: python3 end_card.py logo_alpha.png carpeta_salida segundos fps"""
import sys, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

logo_p, out, dur, fps = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4])
W, H = 1080, 1920
GOLD = (232, 184, 74)
os.makedirs(out, exist_ok=True)
FONT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

# fondo: degradado radial gris carbon (como el fondo del logo)
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * 0.45) / H) ** 2)
c0, c1 = np.array([52, 54, 60]), np.array([10, 10, 13])
t = np.clip(r / 0.75, 0, 1)[..., None]
bg = Image.fromarray((c0 * (1 - t) + c1 * t).astype(np.uint8), "RGB").convert("RGBA")

logo = Image.open(logo_p).convert("RGBA")
LW = 780
logo = logo.resize((LW, int(logo.height * LW / logo.width)), Image.LANCZOS)
alpha = logo.getchannel("A")
glow = Image.new("RGBA", logo.size, GOLD + (0,)); glow.putalpha(alpha.filter(ImageFilter.GaussianBlur(18)))

random.seed(4)
parts = [(random.uniform(0, W), random.uniform(0, H), random.uniform(1.5, 4.5), random.uniform(0.15, 0.6),
          random.uniform(-25, -60), random.uniform(0, 6.28)) for _ in range(70)]
font = ImageFont.truetype(FONT, 34)
tag = "EVENTOS PRIVADOS  ·  DECORACIONES  ·  KARAOKE"

def ease(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

n = int(round(dur * fps))
for i in range(n):
    s = i / fps
    fr = bg.copy()
    d = ImageDraw.Draw(fr)
    for (px, py, pr, pa, vy, ph) in parts:            # destellos que suben
        y = (py + vy * s) % H
        a = pa * (0.6 + 0.4 * math.sin(ph + s * 3)) * ease(s / 0.8)
        d.ellipse((px - pr, y - pr, px + pr, y + pr), fill=GOLD + (int(255 * a),))
    fr = fr.filter(ImageFilter.GaussianBlur(0.6))
    k = ease(s / 0.9)
    scale = 0.86 + 0.14 * k + 0.025 * (s / dur)
    lw, lh = int(LW * scale), int(logo.height * scale)
    L = logo.resize((lw, lh), Image.LANCZOS)
    G = glow.resize((lw, lh), Image.LANCZOS)
    # brillo que recorre el logo
    if 1.0 < s < 2.1:
        p = (s - 1.0) / 1.1
        band = Image.new("L", (lw, lh), 0); bd = ImageDraw.Draw(band)
        cx = -0.3 * lw + p * 1.6 * lw
        bd.polygon([(cx - 60, 0), (cx + 20, 0), (cx - 60 + lh * 0.35 + 80, lh), (cx - 140 + lh * 0.35 + 80, lh)], fill=200)
        band = ImageChops.multiply(band.filter(ImageFilter.GaussianBlur(25)), L.getchannel("A"))
        white = Image.new("RGBA", (lw, lh), (255, 245, 210, 0)); white.putalpha(band)
        L = Image.alpha_composite(L, white)
    for img, a in ((G, 0.55 * k), (L, k)):
        img = img.copy(); img.putalpha(img.getchannel("A").point(lambda v, a=a: int(v * a)))
        fr.alpha_composite(img, ((W - lw) // 2, int(H * 0.42 - lh / 2)))
    ta = ease((s - 1.3) / 0.7)
    if ta > 0:
        d = ImageDraw.Draw(fr)
        tw = d.textlength(tag, font=font)
        y0 = int(H * 0.42 + logo.height / 2 + 70)
        d.line([(W / 2 - 230, y0 - 26), (W / 2 + 230, y0 - 26)], fill=GOLD + (int(170 * ta),), width=2)
        d.text(((W - tw) / 2, y0), tag, font=font, fill=(240, 220, 170, int(255 * ta)))
    fr.convert("RGB").save(f"{out}/f_{i:04d}.png")
print("cierre:", n, "cuadros")
