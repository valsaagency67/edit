"""Portada 1080x1920 para Reels/TikTok: los dos sonriendo en la mesa (ultimo
clip, segundo 4.55), logo arriba y texto abajo. Todo el contenido importante
queda dentro del recorte 3:4 del perfil (y = 240..1680).
Uso: python3 make_cover.py foto_base.png logo_alpha.png salida.jpg"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
GOLD = (232, 184, 74)
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"

base_p, logo_p, out_p = sys.argv[1:4]
img = Image.open(base_p).convert("RGB").resize((W, H), Image.LANCZOS).convert("RGBA")

# degradados oscuros: arriba (logo) y abajo (texto)
grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(grad)
for y in range(H):
    top = max(0.0, 1 - y / 640) ** 1.3 * 200
    bot = max(0.0, (y - 1150) / (H - 1150)) ** 1.1 * 225
    g.line([(0, y), (W, y)], fill=(16, 6, 26, int(max(top, bot))))
img.alpha_composite(grad)

# logo con halo oscuro y sombra
logo = Image.open(logo_p).convert("RGBA")
lw = 320
logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
lx, ly = (W - lw) // 2, 245
halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(halo).ellipse((lx - 120, ly - 50, lx + lw + 120, ly + logo.height + 50), fill=(12, 5, 20, 175))
img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(55)))
pad = 40
sh = Image.new("RGBA", (lw + 2 * pad, logo.height + 2 * pad), (0, 0, 0, 0))
sh_l = Image.new("RGBA", logo.size, (0, 0, 0, 0)); sh_l.putalpha(logo.getchannel("A"))
sh.alpha_composite(sh_l, (pad, pad))
img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(12)), (lx - pad, ly - pad + 5))
img.alpha_composite(logo, (lx, ly))

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

Y0 = 1352
text_c(Y0, "¡HOY ES LA", ImageFont.truetype(FONT, 68), (255, 255, 255), stroke=3, spacing=4)
text_c(Y0 + 76, "INAUGURACIÓN!", fit("INAUGURACIÓN!", FONT, 980, 136), GOLD, stroke=4)
cy = Y0 + 246
d.line([(250, cy), (505, cy)], fill=GOLD, width=3)
d.line([(575, cy), (830, cy)], fill=GOLD, width=3)
d.polygon([(540, cy - 13), (552, cy), (540, cy + 13), (528, cy)], fill=GOLD)
text_c(cy + 22, "CÓCTELES  ·  ENTRADAS  ·  KARAOKE", ImageFont.truetype(FONT_B, 40), (255, 255, 255), stroke=2, spacing=2)

img.convert("RGB").save(out_p, quality=95, subsampling=0)
print("portada:", out_p)
