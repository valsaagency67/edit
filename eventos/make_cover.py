"""Portada 1080x1920 del video de eventos: el chico sonriendo bajo el letrero de
Apolo y texto abajo (dentro del recorte 3:4 del perfil, y = 240..1680).
Uso: python3 make_cover.py foto_base.png salida.jpg"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
GOLD = (232, 184, 74)
FB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FM = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
img = Image.open(sys.argv[1]).convert("RGB").resize((W, H), Image.LANCZOS).convert("RGBA")
grad = Image.new("RGBA", (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(grad)
for y in range(H):
    a = max(0.0, (y - 880) / (H - 880)) ** 1.0 * 235
    g.line([(0, y), (W, y)], fill=(14, 8, 22, int(a)))
img.alpha_composite(grad)
d = ImageDraw.Draw(img)

def center(y, txt, font, fill, stroke=0, sp=0):
    ws = [d.textlength(c, font=font) for c in txt]; x = (W - sum(ws) - sp * (len(txt) - 1)) / 2
    for c, w in zip(txt, ws):
        d.text((x, y), c, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0)); x += w + sp

def fit(txt, path, maxw, size):
    while d.textlength(txt, font=ImageFont.truetype(path, size)) > maxw: size -= 2
    return ImageFont.truetype(path, size)

Y = 1135
center(Y, "POR SI NO SABÍAN…", ImageFont.truetype(FB, 58), (255, 255, 255), stroke=3, sp=3)
center(Y + 74, "EVENTOS", fit("EVENTOS", FB, 900, 150), GOLD, stroke=4, sp=4)
center(Y + 222, "PRIVADOS", fit("PRIVADOS", FB, 900, 150), GOLD, stroke=4, sp=4)
cy = Y + 392
d.line([(230, cy), (505, cy)], fill=GOLD, width=3); d.line([(575, cy), (850, cy)], fill=GOLD, width=3)
d.polygon([(540, cy - 13), (552, cy), (540, cy + 13), (528, cy)], fill=GOLD)
center(cy + 24, "DECORACIONES  ·  15 AÑOS  ·  FIESTAS", ImageFont.truetype(FM, 36), (255, 255, 255), stroke=2, sp=2)
img.convert("RGB").save(sys.argv[2], quality=95, subsampling=0)
