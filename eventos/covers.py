"""4 portadas llamativas (1080x1920) para el video de eventos de Apolo.
Todo lo importante queda dentro del recorte 3:4 del perfil (y = 240..1680).
Uso: python3 eventos/covers.py   (desde la raiz del repo)"""
import os
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
W, H = 1080, 1920
GOLD, BLACK, WHITE = (240, 190, 70), (12, 10, 14), (255, 255, 255)
F = "eventos/fonts/"
ANTON, BEBAS, BOWLBY = F + "anton-latin-400-normal.woff", F + "bebas-neue-latin-400-normal.woff", F + "bowlby-one-latin-400-normal.woff"
INTER = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
P = "media/nuevo/portada/"
LOGO = Image.open("media/cover/logo_alpha.png").convert("RGBA")


def font(path, size): return ImageFont.truetype(path, size)


def fit(txt, path, maxw, size):
    while font(path, size).getlength(txt) > maxw: size -= 2
    return font(path, size)


def photo(path, crop_y=0.5, zoom=1.0, sat=1.25, con=1.12, bri=1.0):
    im = Image.open(path).convert("RGB")
    if zoom != 1.0:
        w, h = int(W * zoom), int(H * zoom); im = im.resize((w, h), Image.LANCZOS)
        x, y = (w - W) // 2, int((h - H) * crop_y); im = im.crop((x, y, x + W, y + H))
    else:
        im = im.resize((W, H), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(sat); im = ImageEnhance.Contrast(im).enhance(con)
    im = ImageEnhance.Brightness(im).enhance(bri)
    return im.convert("RGBA")


def vgrad(img, y0, y1, color=(10, 6, 16), amax=230, up=False):
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    for y in range(H):
        t = (y1 - y) / (y1 - y0) if up else (y - y0) / (y1 - y0)
        d.line([(0, y), (W, y)], fill=color + (int(amax * min(max(t, 0), 1) ** 1.2),))
    img.alpha_composite(g)


def vignette(img, strength=170):
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((-250, -150, W + 250, H + 150), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(180))
    dark = Image.new("RGBA", (W, H), (0, 0, 0, strength)); dark.putalpha(Image.eval(m, lambda v: int(strength * (1 - v / 255))))
    img.alpha_composite(dark)


def text_layer(txt, fnt, fill, stroke=0, stroke_fill=BLACK, shadow=0, glow=None, spacing=0):
    """Texto en capa transparente con sombra / brillo opcionales."""
    w = int(sum(fnt.getlength(c) for c in txt) + spacing * (len(txt) - 1)) + 2 * stroke + 80
    asc, desc = fnt.getmetrics(); h = asc + desc + 2 * stroke + 80
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    def draw(on, col, st, stc, off=(0, 0)):
        d = ImageDraw.Draw(on); x = 40 + stroke + off[0]
        for c in txt:
            d.text((x, 40 + off[1]), c, font=fnt, fill=col, stroke_width=st, stroke_fill=stc); x += fnt.getlength(c) + spacing
    if glow:
        g = Image.new("RGBA", (w, h), (0, 0, 0, 0)); draw(g, glow, stroke + 6, glow)
        lay.alpha_composite(g.filter(ImageFilter.GaussianBlur(18)))
    if shadow:
        s = Image.new("RGBA", (w, h), (0, 0, 0, 0)); draw(s, (0, 0, 0, 200), stroke, (0, 0, 0, 200), (shadow, shadow))
        lay.alpha_composite(s.filter(ImageFilter.GaussianBlur(4)))
    draw(lay, fill, stroke, stroke_fill)
    return lay


def paste_c(img, lay, cy, angle=0, cx=W // 2):
    if angle: lay = lay.rotate(angle, resample=Image.BICUBIC, expand=True)
    img.alpha_composite(lay, (int(cx - lay.width / 2), int(cy - lay.height / 2)))


def banner(txt, fnt, bg, fg, padx=50, pady=18, angle=0, shadow=True):
    tw = int(fnt.getlength(txt)); asc, desc = fnt.getmetrics()
    w, h = tw + 2 * padx, asc + desc + 2 * pady
    lay = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    if shadow:
        s = Image.new("RGBA", lay.size, (0, 0, 0, 0)); ImageDraw.Draw(s).rectangle((40, 42, 40 + w, 42 + h), fill=(0, 0, 0, 170))
        lay.alpha_composite(s.filter(ImageFilter.GaussianBlur(10)))
    d.rectangle((30, 30, 30 + w, 30 + h), fill=bg)
    d.text((30 + padx, 30 + pady - 4), txt, font=fnt, fill=fg)
    return lay.rotate(angle, resample=Image.BICUBIC, expand=True) if angle else lay


def badge(lines, r, bg, fg, angle=-12):
    s = 2 * r + 40; lay = Image.new("RGBA", (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.ellipse((20, 24, 20 + 2 * r, 24 + 2 * r), fill=(0, 0, 0, 120))
    d.ellipse((20, 20, 20 + 2 * r, 20 + 2 * r), fill=bg, outline=WHITE, width=6)
    fs = [fit(t, ANTON, 2 * r - 120, sz) for t, sz in lines]
    boxes = [d.textbbox((0, 0), t, font=f) for (t, _), f in zip(lines, fs)]   # tamano real de cada palabra
    gap = 14; total = sum(b[3] - b[1] for b in boxes) + gap * (len(boxes) - 1); y = s / 2 - total / 2
    for (t, _), f, b in zip(lines, fs, boxes):
        d.text((s / 2 - (b[2] - b[0]) / 2 - b[0], y - b[1]), t, font=f, fill=fg); y += (b[3] - b[1]) + gap
    return lay.rotate(angle, resample=Image.BICUBIC, expand=True)


def logo(img, width, cy, cx=W // 2, glow=True, alpha=1.0):
    L = LOGO.resize((width, int(LOGO.height * width / LOGO.width)), Image.LANCZOS)
    if alpha < 1: L.putalpha(L.getchannel("A").point(lambda v: int(v * alpha)))
    if glow:
        halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(halo).ellipse((cx - width * 0.75, cy - L.height * 0.7, cx + width * 0.75, cy + L.height * 0.7), fill=(8, 4, 12, 170))
        img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(50)))
    img.alpha_composite(L, (int(cx - width / 2), int(cy - L.height / 2)))


def save(img, n):
    img.convert("RGB").save(f"out/Apolo_Eventos_portada_{n}.jpg", quality=95, subsampling=0)


# 1) NEON — barra con luz roja
img = photo(P + "b_08.png", sat=1.3, con=1.15)
vignette(img, 150); vgrad(img, 1050, 1750, (40, 0, 10), 235)
logo(img, 300, 380)
paste_c(img, text_layer("¿TU FIESTA?", fit("¿TU FIESTA?", ANTON, 960, 230), WHITE, stroke=6, shadow=10), 1230, angle=4)
paste_c(img, text_layer("AQUÍ", font(BOWLBY, 250), GOLD, stroke=8, glow=(255, 60, 60, 255)), 1460, angle=4)
paste_c(img, banner("EVENTOS PRIVADOS  ·  RESERVA YA", fit("EVENTOS PRIVADOS  ·  RESERVA YA", BEBAS, 820, 70), BLACK, GOLD), 1630, angle=4)
save(img, 1)

# 2) DECORACION — globos y "40" en azul y dorado
img = photo(P + "d_07.png", sat=1.35, con=1.15, bri=1.08)
vignette(img, 120); vgrad(img, 260, 760, (5, 5, 30), 220, up=True); vgrad(img, 1280, 1800, (5, 5, 30), 220)
paste_c(img, text_layer("HACEMOS TU", fit("HACEMOS TU", ANTON, 700, 120), WHITE, stroke=5, shadow=8), 330)
paste_c(img, text_layer("DECORACIÓN", fit("DECORACIÓN", ANTON, 1000, 250), GOLD, stroke=7, shadow=10, glow=(60, 90, 255, 255)), 510)
paste_c(img, banner("RESERVA YA  ·  FIESTAS PRIVADAS", fit("RESERVA YA  ·  FIESTAS PRIVADAS", BEBAS, 760, 76), GOLD, BLACK, angle=-3), 700)
logo(img, 280, 1490)
save(img, 2)

# 3) COLLAGE — 3 tomas en diagonal (cada una encuadrada en su franja) + cinta dorada
img = Image.new("RGBA", (W, H), BLACK + (255,))
def shifted(path, dy, zoom=1.0, sat=1.3):
    ph = photo(path, sat=sat, con=1.12)
    if zoom != 1.0: ph = ph.resize((int(W * zoom), int(H * zoom)), Image.LANCZOS)
    c = Image.new("RGBA", (W, H), BLACK + (255,)); c.alpha_composite(ph, ((W - ph.width) // 2, dy)); return c
shots = [shifted(P + "base4k.png", -470, 1.0), shifted(P + "d_07.png", -330, 1.0, 1.35), shifted(P + "b_16.png", 680, 1.0)]
bands = [(-200, 760), (560, 1360), (1160, 2120)]
for sh, (y0, y1) in zip(shots, bands):
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([(0, y0 + 120), (W, y0 - 40), (W, y1 - 40), (0, y1 + 120)], fill=255)
    img.paste(sh, (0, 0), m)
d = ImageDraw.Draw(img)
for y in (560, 1160):
    d.line([(0, y + 120), (W, y - 40)], fill=GOLD, width=10)
vignette(img, 110)
paste_c(img, banner("EVENTOS PRIVADOS", fit("EVENTOS PRIVADOS", ANTON, 860, 150), GOLD, BLACK, padx=40, pady=10, angle=8), 960)
paste_c(img, badge([("RESERVA", 70), ("YA", 110)], 120, (200, 20, 60), WHITE), 1470, cx=860)
save(img, 3)

# 4) ENTRADA — cinta dorada inclinada + burbuja
img = photo(P + "base4k.png", sat=1.2, con=1.12)
vignette(img, 130); vgrad(img, 950, 1800, (12, 6, 20), 230)
bub = text_layer("¿SABÍAS QUE…?", font(INTER, 60), BLACK, spacing=2)
bw, bh = bub.width + 20, bub.height - 20
bubble = Image.new("RGBA", (bw + 40, bh + 80), (0, 0, 0, 0)); bd = ImageDraw.Draw(bubble)
bd.rounded_rectangle((20, 20, 20 + bw, 20 + bh), 50, fill=WHITE); bd.polygon([(90, 20 + bh - 4), (150, 20 + bh - 4), (80, 20 + bh + 50)], fill=WHITE)
bubble.alpha_composite(bub, (30, 10))
paste_c(img, bubble, 1075, angle=-4, cx=430)
paste_c(img, banner("EVENTOS", font(ANTON, 210), GOLD, BLACK, padx=40, pady=4, angle=-5), 1280)
paste_c(img, banner("PRIVADOS", font(ANTON, 210), BLACK, GOLD, padx=40, pady=4, angle=-5), 1495)
save(img, 4)
print("portadas listas")
