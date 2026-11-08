"""Portada 1080x1920 para Reels/TikTok: letrero de Apolo con la entrada y la
cinta de inauguracion. El texto va arriba, sobre la pared, y todo el contenido
importante queda dentro del recorte 3:4 del perfil (y = 240..1680).
Uso: python3 make_cover.py foto_base.png salida.jpg"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
GOLD = (232, 184, 74)
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
SHIFT = 190  # se baja la foto para dar espacio al texto

base_p, out_p = sys.argv[1:3]

img = Image.open(base_p).convert("RGB").resize((W, H), Image.LANCZOS)
canvas = Image.new("RGB", (W, H))
# relleno superior: franja de pared estirada y difuminada
wall = img.crop((0, 130, W, 190)).resize((W, SHIFT + 160)).filter(ImageFilter.GaussianBlur(25))
canvas.paste(wall, (0, 0))
photo = img.crop((0, 0, W, H - SHIFT))
mask = Image.new("L", (W, H - SHIFT), 255)
mask.paste(Image.linear_gradient("L").resize((W, 260)), (0, 0))
canvas.paste(photo, (0, SHIFT), mask)
img = canvas.convert("RGBA")

# degradado oscuro arriba para el texto
grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(grad)
for y in range(H):
    a = max(0.0, 1 - y / 760) ** 1.3 * 215
    g.line([(0, y), (W, y)], fill=(14, 8, 24, int(a)))
img.alpha_composite(grad)

d = ImageDraw.Draw(img)

def text_c(y, txt, font, fill, stroke=0, spacing=0):
    widths = [d.textlength(ch, font=font) for ch in txt]
    total = sum(widths) + spacing * (len(txt) - 1)
    x = (W - total) / 2
    if not spacing:
        d.text((x, y), txt, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
        return
    for ch, w in zip(txt, widths):
        d.text((x, y), ch, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
        x += w + spacing

def fit(txt, path, max_w, size):
    while size > 20:
        f = ImageFont.truetype(path, size)
        if d.textlength(txt, font=f) <= max_w:
            return f
        size -= 2
    return ImageFont.truetype(path, size)

# sombra suave detras del bloque de texto
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).rounded_rectangle((60, 250, W - 60, 590), 80, fill=(8, 4, 14, 120))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(45)))
d = ImageDraw.Draw(img)

text_c(268, "¡HOY ES LA", ImageFont.truetype(FONT, 70), (255, 255, 255), stroke=3, spacing=4)
text_c(346, "INAUGURACIÓN!", fit("INAUGURACIÓN!", FONT, 980, 136), GOLD, stroke=4)
cy = 520
d.line([(250, cy), (505, cy)], fill=GOLD, width=3)
d.line([(575, cy), (830, cy)], fill=GOLD, width=3)
d.polygon([(540, cy - 13), (552, cy), (540, cy + 13), (528, cy)], fill=GOLD)
text_c(544, "CÓCTELES  ·  ENTRADAS  ·  KARAOKE", ImageFont.truetype(FONT_B, 40), (255, 255, 255), stroke=2, spacing=2)

img.convert("RGB").save(out_p, quality=95, subsampling=0)
print("portada:", out_p)
