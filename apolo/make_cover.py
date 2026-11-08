"""Portada 1080x1920 para Reels/TikTok (todo el contenido dentro del recorte 3:4
del perfil, y = 240..1680).
Uso: python3 make_cover.py foto_base.png logo_alpha.png salida.jpg"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
GOLD = (232, 184, 74)
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"

base_p, logo_p, out_p = sys.argv[1:4]

# Foto: se baja SHIFT px para dejar espacio al logo; arriba se rellena con
# la franja superior de la foto estirada y difuminada.
SHIFT = 170
img = Image.open(base_p).convert("RGB").resize((W, H), Image.LANCZOS)
canvas = Image.new("RGB", (W, H))
strip = img.crop((0, 0, W, 60)).resize((W, SHIFT + 120)).filter(ImageFilter.GaussianBlur(30))
canvas.paste(strip, (0, 0))
photo = img.crop((0, 0, W, H - SHIFT))
mask = Image.linear_gradient("L").resize((W, 140))          # fundido suave en la union
full_mask = Image.new("L", (W, H - SHIFT), 255); full_mask.paste(mask, (0, 0))
canvas.paste(photo, (0, SHIFT), full_mask)
img = canvas.convert("RGBA")

# Degradados oscuros arriba (logo) y abajo (texto)
grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(grad)
for y in range(H):
    top = max(0.0, 1 - y / 820) ** 1.4 * 235
    bot = max(0.0, (y - 1060) / (H - 1060)) ** 1.3 * 235
    g.line([(0, y), (W, y)], fill=(12, 6, 20, int(max(top, bot))))
img.alpha_composite(grad)

# Logo con sombra suave
logo = Image.open(logo_p).convert("RGBA")
lw = 360
logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
lx, ly = (W - lw) // 2, 268
halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(halo).ellipse((lx - 110, ly - 50, lx + lw + 110, ly + logo.height + 60), fill=(10, 5, 18, 170))
img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(55)))
shadow = Image.new("RGBA", logo.size, (0, 0, 0, 0))
shadow.putalpha(logo.getchannel("A").point(lambda v: int(v * 0.85)))
pad = 40
sh_img = Image.new("RGBA", (logo.width + 2 * pad, logo.height + 2 * pad), (0, 0, 0, 0))
sh_img.alpha_composite(shadow, (pad, pad))
sh_img = sh_img.filter(ImageFilter.GaussianBlur(14))
img.alpha_composite(sh_img, (lx - pad, ly - pad + 6))
img.alpha_composite(logo, (lx, ly))

# Textos (dichos en el video)
d = ImageDraw.Draw(img)

def text_c(y, txt, font, fill, stroke=0, spacing=0):
    if spacing:
        widths = [d.textlength(ch, font=font) for ch in txt]
        total = sum(widths) + spacing * (len(txt) - 1)
        x = (W - total) / 2
        for ch, w in zip(txt, widths):
            d.text((x, y), ch, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
            x += w + spacing
        return
    w = d.textlength(txt, font=font)
    d.text(((W - w) / 2, y), txt, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))

def fit(txt, path, max_w, size):
    while size > 20:
        f = ImageFont.truetype(path, size)
        if d.textlength(txt, font=f) <= max_w: return f
        size -= 2
    return ImageFont.truetype(path, size)

f1 = ImageFont.truetype(FONT, 66)
f2 = fit("INAUGURACIÓN!", FONT, 960, 132)
f3 = ImageFont.truetype(FONT_B, 40)
text_c(1338, "¡HOY ES LA", f1, (255, 255, 255), stroke=3, spacing=4)
text_c(1410, "INAUGURACIÓN!", f2, GOLD, stroke=4)
# linea decorativa con rombo (como en el logo)
cy = 1586
d.line([(250, cy), (505, cy)], fill=GOLD + (255,), width=3)
d.line([(575, cy), (830, cy)], fill=GOLD + (255,), width=3)
d.polygon([(540, cy - 13), (552, cy), (540, cy + 13), (528, cy)], fill=GOLD)
text_c(1610, "CÓCTELES  ·  ENTRADAS  ·  KARAOKE", f3, (255, 255, 255), spacing=2)

img.convert("RGB").save(out_p, quality=95, subsampling=0)
print("portada:", out_p)
