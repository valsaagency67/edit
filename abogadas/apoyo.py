"""Tomas de apoyo a pantalla completa (1080x1920) para los videos de Enso Jurídicos.

No hay material de archivo del tema, así que son de dos tipos:
- gráficos animados dibujados aquí (reloj de arena, semanas cotizadas, documento con lupa, facturas con
  sello «VENCIDA», curva de liquidez, escudo), en azul noche y dorado como los textos del video;
- un plano real de la biblioteca de la oficina, recortado del original de cartera (1080x1920) con un
  acercamiento lento.

Cada toma es una función frame(t, dur) -> PIL.Image RGB. Se dibuja al doble de tamaño y se reduce
(antialiasing).
"""
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
K = 2  # supermuestreo
NAVY = (19, 41, 75)
NAVY_DARK = (9, 20, 40)
GOLD = (242, 193, 78)
CREAM = (248, 244, 234)
INK = (60, 72, 92)
RED = (198, 40, 40)
WHITE = (255, 255, 255)


def font(weight, size):
    return ImageFont.truetype(os.path.join(HERE, "fonts", f"Montserrat-{weight}.ttf"), size * K)


def ease(u):
    u = min(1.0, max(0.0, u))
    return 1 - (1 - u) ** 3


def back(u):
    """Entrada con rebote leve (sobrepasa ~6 %)."""
    u = min(1.0, max(0.0, u))
    c = 1.6
    return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2


_bg = None


def background():
    """Degradado radial azul noche con viñeta."""
    global _bg
    if _bg is None:
        y, x = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * 0.47) / H) ** 2 * 0.8)
        u = np.clip(d / 0.75, 0, 1)[..., None]
        img = np.array(NAVY, np.float32) * (1 - u) + np.array(NAVY_DARK, np.float32) * u
        _bg = Image.fromarray(img.astype(np.uint8)).resize((W * K, H * K), Image.BILINEAR)
    return _bg.copy()


def canvas():
    img = background()
    return img, ImageDraw.Draw(img, "RGBA")


def finish(img):
    return img.reduce(K)


def title(d, lines, t, y=470, color=GOLD, size=92):
    """Título con entrada de abajo hacia arriba y filete dorado."""
    f = font(900, size)
    u = ease(t / 0.3)
    dy = (1 - u) * 60
    a = int(255 * u)
    for i, line in enumerate(lines):
        yy = (y + i * (size + 24) + dy) * K
        d.text((W * K / 2, yy), line, font=f, fill=color + (a,), anchor="mm")
    yl = (y + (len(lines) - 1) * (size + 24) + size * 0.85 + dy) * K
    half = 150 * ease((t - 0.1) / 0.3) * K
    d.rounded_rectangle((W * K / 2 - half, yl, W * K / 2 + half, yl + 8 * K), radius=4 * K, fill=GOLD + (a,))


def S(*v):
    return [x * K for x in v]


# ------------------------------------------------------------------ gráficos

def hourglass(t, dur, lines=("TU FUTURO",)):
    img, d = canvas()
    title(d, lines, t)
    cx, top, neck, bot, half = W / 2, 760, 1010, 1260, 200
    p = ease(t / dur) * 0.85 + 0.05
    sc = back(t / 0.35)
    def T(x, y):  # escala desde el centro del reloj
        return ((cx + (x - cx) * sc) * K, (neck + (y - neck) * sc) * K)
    def wtop(y):
        return half * (neck - y) / (neck - top)
    def wbot(y):
        return half * (y - neck) / (bot - neck)
    # Arena de arriba (baja) y de abajo (sube).
    lv = top + 40 + (neck - top - 40) * p
    d.polygon([T(cx - wtop(lv), lv), T(cx + wtop(lv), lv), T(cx, neck)], fill=GOLD)
    lv2 = bot - (bot - neck - 60) * p
    d.polygon([T(cx - half, bot), T(cx + half, bot), T(cx + wbot(lv2) * 0.95, lv2), T(cx - wbot(lv2) * 0.95, lv2)],
              fill=GOLD)
    if p < 0.88:
        d.line([T(cx, neck), T(cx, lv2)], fill=GOLD, width=6 * K)
    # Vidrio y bases.
    glass = [T(cx - half, top), T(cx + half, top), T(cx + 14, neck), T(cx + half, bot), T(cx - half, bot),
             T(cx - 14, neck)]
    d.line(glass + [glass[0]], fill=(255, 255, 255, 220), width=int(7 * K * sc), joint="curve")
    for y in (top - 28, bot):
        x0, y0 = T(cx - half - 50, y)
        x1, y1 = T(cx + half + 50, y + 28)
        d.rounded_rectangle((x0, y0, x1, y1), radius=12 * K, fill=GOLD)
    return finish(img)


def weeks(t, dur, lines=("SEMANAS", "COTIZADAS")):
    img, d = canvas()
    title(d, lines, t, y=440)
    cols, rows, s, g = 8, 6, 84, 22
    x0 = (W - cols * s - (cols - 1) * g) / 2
    y0 = 690
    n = cols * rows
    for i in range(n):
        r, c = divmod(i, cols)
        x, y = x0 + c * (s + g), y0 + r * (s + g)
        d.rounded_rectangle(S(x, y, x + s, y + s), radius=14 * K, outline=(255, 255, 255, 70), width=3 * K)
        ti = 0.15 + (dur * 0.8 - 0.15) * i / n
        u = (t - ti) / 0.18
        if u > 0:
            m = s / 2 * (1 - back(u))
            d.rounded_rectangle(S(x + m, y + m, x + s - m, y + s - m), radius=14 * K, fill=GOLD)
    return finish(img)


_paper_cache = {}


def paper(kind, w, h, label):
    key = (kind, w, h, label)
    if key in _paper_cache:
        return _paper_cache[key]
    im = Image.new("RGBA", (w * K + 60 * K, h * K + 60 * K), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(S(36, 42, 30 + w, 36 + h), radius=24 * K, fill=(0, 0, 0, 130))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(14 * K)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(S(30, 30, 30 + w, 30 + h), radius=22 * K, fill=CREAM)
    d.rounded_rectangle(S(30, 30, 30 + w, 30 + 120), radius=22 * K, fill=NAVY)
    d.rectangle(S(30, 100, 30 + w, 30 + 120), fill=NAVY)
    d.text(S(30 + w / 2, 90), label, font=font(900, 46 if len(label) < 12 else 38), fill=WHITE, anchor="mm")
    if kind == "factura":
        for i in range(5):
            y = 200 + i * 70
            d.rounded_rectangle(S(80, y, 80 + w * 0.45, y + 18), radius=9 * K, fill=(200, 205, 215))
            d.rounded_rectangle(S(w - 140, y, w - 20, y + 18), radius=9 * K, fill=(200, 205, 215))
        d.line(S(80, h - 150, w - 20, h - 150), fill=INK, width=3 * K)
        d.text(S(80, h - 110), "TOTAL", font=font(800, 36), fill=INK, anchor="lm")
        d.text(S(w - 20, h - 110), "$ ––––", font=font(900, 40), fill=NAVY, anchor="rm")
    _paper_cache[key] = im
    return im


def paste_rot(img, layer, cx, cy, angle=0.0, scale=1.0, alpha=1.0):
    lay = layer
    if scale != 1.0:
        lay = lay.resize((max(1, int(lay.width * scale)), max(1, int(lay.height * scale))), Image.BICUBIC)
    if angle:
        lay = lay.rotate(angle, resample=Image.BICUBIC, expand=True)
    if alpha < 1.0:
        a = lay.getchannel("A").point(lambda v: int(v * alpha))
        lay = lay.copy()
        lay.putalpha(a)
    img.alpha_composite(lay, (int(cx * K - lay.width / 2), int(cy * K - lay.height / 2)))


def document(t, dur, label="", lines=None):
    img, d = canvas()
    if lines:
        title(d, lines, t, y=400)
    img = img.convert("RGBA")
    pw, ph = 600, 680
    u = ease(t / 0.35)
    cy = 1000 + (1 - u) * 260
    base = paper("doc", pw, ph, label).copy()
    pd = ImageDraw.Draw(base)
    # Renglones que se escriben uno tras otro, con su viñeta dorada.
    for i in range(7):
        y = 230 + i * 78
        ti = 0.25 + i * (dur * 0.7 - 0.25) / 7
        v = ease((t - ti) / 0.25)
        if v <= 0:
            continue
        pd.ellipse(S(90, y - 4, 118, y + 24), fill=GOLD)
        full = (pw - 120) - 150 - (i % 3) * 60
        pd.rounded_rectangle(S(140, y, 140 + full * v, y + 20), radius=10 * K, fill=(185, 192, 205))
    paste_rot(img, base, W / 2, cy, angle=0, alpha=u)
    # Lupa que recorre el documento.
    a = t / dur
    lx = W / 2 - 170 + 340 * (0.5 - 0.5 * math.cos(math.pi * a))
    ly = 900 + 260 * a
    d = ImageDraw.Draw(img, "RGBA")
    r = 120
    if t > 0.3:
        d.ellipse(S(lx - r, ly - r, lx + r, ly + r), fill=(255, 255, 255, 40), outline=GOLD, width=18 * K)
        hx, hy = lx + r * 0.72, ly + r * 0.72
        d.line(S(hx, hy, hx + 120, hy + 120), fill=GOLD, width=30 * K)
    return finish(img.convert("RGB"))


def invoices(t, dur, stamp_at, lines=("¿TUS CLIENTES", "NO PAGAN?")):
    img, d = canvas()
    title(d, lines, t, y=420, color=WHITE, size=84)
    img = img.convert("RGBA")
    pw, ph = 500, 640
    layer = paper("factura", pw, ph, "FACTURA")
    for i, (ang, dx) in enumerate(((10, -120), (-8, 120), (0, 0))):
        ti = 0.1 + i * 0.22
        u = ease((t - ti) / 0.3)
        if u <= 0:
            continue
        paste_rot(img, layer, W / 2 + dx, 1000 + (1 - u) * 500, angle=ang * u, alpha=min(1, u * 1.5))
    # Sello «VENCIDA» que cae sobre la factura de adelante.
    u = (t - stamp_at) / 0.14
    if u > 0:
        st = Image.new("RGBA", (620 * K, 200 * K), (0, 0, 0, 0))
        sd = ImageDraw.Draw(st)
        sd.rounded_rectangle(S(10, 10, 610, 190), radius=26 * K, outline=RED, width=14 * K, fill=(255, 255, 255, 30))
        sd.text(S(310, 102), "VENCIDA", font=font(900, 110), fill=RED, anchor="mm")
        sc = 1 + 1.3 * (1 - ease(u))
        paste_rot(img, st, W / 2, 1010, angle=12, scale=sc * 0.9, alpha=min(1, u))
    return finish(img.convert("RGB"))


def chart_down(t, dur, lines=("LIQUIDEZ",)):
    img, d = canvas()
    title(d, lines, t)
    x0, x1, y0, y1 = 160, 920, 700, 1240
    for i in range(5):
        y = y0 + i * (y1 - y0) / 4
        d.line(S(x0, y, x1, y), fill=(255, 255, 255, 40), width=2 * K)
    d.line(S(x0, y0 - 20, x0, y1), fill=(255, 255, 255, 140), width=4 * K)
    d.line(S(x0, y1, x1 + 20, y1), fill=(255, 255, 255, 140), width=4 * K)
    vals = [0.55, 0.62, 0.58, 0.7, 0.66, 0.48, 0.38, 0.22, 0.08]
    pts = [(x0 + 40 + (x1 - x0 - 80) * i / (len(vals) - 1), y1 - (y1 - y0) * v) for i, v in enumerate(vals)]
    p = ease((t - 0.15) / (dur * 0.75))
    n = p * (len(pts) - 1)
    k = int(n)
    shown = pts[:k + 1]
    if k < len(pts) - 1:
        f = n - k
        a, b = pts[k], pts[k + 1]
        shown = shown + [(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)]
    if len(shown) >= 2:
        d.polygon([(x * K, y * K) for x, y in shown] + [(shown[-1][0] * K, y1 * K), (shown[0][0] * K, y1 * K)],
                  fill=GOLD + (40,))
        for (xa, ya), (xb, yb) in zip(shown, shown[1:]):
            red = (xa - x0) / (x1 - x0) > 0.55
            d.line(S(xa, ya, xb, yb), fill=RED if red else GOLD, width=12 * K)
        ex, ey = shown[-1]
        col = RED if (ex - x0) / (x1 - x0) > 0.55 else GOLD
        d.ellipse(S(ex - 20, ey - 20, ex + 20, ey + 20), fill=col)
        if p >= 0.98:
            # Flecha hacia abajo al final de la caída.
            u = ease((t - 0.15 - dur * 0.75) / 0.2)
            ax, ay = x1 - 10, y1 - 300
            d.polygon(S(ax - 60, ay, ax + 60, ay, ax, ay + 90 * u + 1), fill=RED)
            d.rectangle(S(ax - 22, ay - 120, ax + 22, ay), fill=RED)
    return finish(img)


def shield(t, dur, lines=("ESTABILIDAD", "FINANCIERA")):
    img, d = canvas()
    title(d, lines, t, y=420)
    cx, cy = W / 2, 1010
    sc = back((t - 0.1) / 0.35)
    # Rayos suaves que giran detrás.
    for i in range(12):
        a = i * math.pi / 6 + t * 0.4
        r1, r2 = 300, 520
        d.polygon(S(cx + r1 * math.cos(a - 0.06), cy + r1 * math.sin(a - 0.06), cx + r2 * math.cos(a), cy + r2 * math.sin(a),
                    cx + r1 * math.cos(a + 0.06), cy + r1 * math.sin(a + 0.06)), fill=GOLD + (45,))
    if sc > 0:
        def P(x, y):
            return ((cx + x * sc) * K, (cy + y * sc) * K)
        pts = [P(-230, -260), P(0, -320), P(230, -260), P(230, 20), P(150, 190), P(0, 300), P(-150, 190), P(-230, 20)]
        d.polygon(pts, fill=NAVY)
        d.line(pts + [pts[0]], fill=GOLD, width=int(20 * K * sc), joint="curve")
        v = ease((t - 0.45) / 0.35)
        if v > 0:
            c = [(-110, 0), (-20, 95), (130, -90)]
            seg1 = min(1, v * 2)
            seg2 = max(0, v * 2 - 1)
            a, b, e = c
            m = (a[0] + (b[0] - a[0]) * seg1, a[1] + (b[1] - a[1]) * seg1)
            d.line([P(*a), P(*m)], fill=WHITE, width=int(34 * K * sc))
            if seg2 > 0:
                n = (b[0] + (e[0] - b[0]) * seg2, b[1] + (e[1] - b[1]) * seg2)
                d.line([P(*b), P(*n)], fill=WHITE, width=int(34 * K * sc))
                d.ellipse([P(b[0] - 17, b[1] - 17), P(b[0] + 17, b[1] + 17)], fill=WHITE)
    return finish(img)


class Bookshelf:
    """Plano real de la biblioteca (original de cartera): acercamiento lento sobre los estantes de la derecha."""

    def __init__(self, src, start, dur, fps):
        self.box = (600, 170, 1000, 881)  # x0, y0, x1, y1 en el original 1080x1920 (9:16)
        x0, y0, x1, y1 = self.box
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur + 0.2), "-i", src, "-an", "-vf",
             f"fps={fps},crop={x1 - x0}:{y1 - y0}:{x0}:{y0}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
            capture_output=True, check=True).stdout
        n = len(raw) // ((x1 - x0) * (y1 - y0) * 3)
        self.frames = [Image.frombuffer("RGB", (x1 - x0, y1 - y0), raw[i * (x1 - x0) * (y1 - y0) * 3:
                                                                         (i + 1) * (x1 - x0) * (y1 - y0) * 3])
                       for i in range(n)]
        self.fps = fps

    def __call__(self, t, dur):
        im = self.frames[min(len(self.frames) - 1, int(t * self.fps))]
        z = 1 + 0.12 * (t / dur)
        w, h = im.width / z, im.height / z
        x0, y0 = (im.width - w) * 0.6, (im.height - h) * 0.4
        out = im.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + w, y0 + h))
        out = out.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        # Un poco más oscuro para que la marca resalte encima.
        return Image.blend(out, Image.new("RGB", (W, H), NAVY_DARK), 0.28)


GRAPHICS = {
    "hourglass": hourglass,
    "weeks": weeks,
    "document": document,
    "invoices": invoices,
    "chart_down": chart_down,
    "shield": shield,
}


def person(d, cx, cy, r, color):
    """Ícono de persona: cabeza y hombros."""
    d.ellipse(S(cx - r * 0.55, cy - r * 1.35, cx + r * 0.55, cy - r * 0.25), fill=color)
    d.pieslice(S(cx - r, cy - r * 0.1, cx + r, cy + r * 1.9), 180, 360, fill=color)


def family_tree(t, dur, lines=("DERECHOS", "HEREDITARIOS")):
    """Árbol de herederos: la persona de arriba y las líneas que bajan a tres herederos."""
    img, d = canvas()
    title(d, lines, t, y=430)
    top = (W / 2, 820)
    heirs = [(W / 2 - 300, 1180), (W / 2, 1180), (W / 2 + 300, 1180)]
    u0 = back((t - 0.1) / 0.3)
    if u0 > 0:
        person(d, top[0], top[1], 80 * u0, GOLD)
    # Líneas: vertical, horizontal y bajadas.
    v = ease((t - 0.35) / 0.35)
    if v > 0:
        yb = 960
        d.line(S(W / 2, 1010, W / 2, 1010 + (yb - 1010 + 0.01) * min(1, v * 3)), fill=WHITE, width=6 * K)
        span = 300 * min(1, max(0, v * 3 - 1))
        d.line(S(W / 2 - span, yb, W / 2 + span, yb), fill=WHITE, width=6 * K)
        drop = 120 * min(1, max(0, v * 3 - 2))
        for x, _ in heirs:
            if drop > 0:
                d.line(S(x, yb, x, yb + drop), fill=WHITE, width=6 * K)
    for i, (x, y) in enumerate(heirs):
        u = back((t - 0.7 - i * 0.12) / 0.3)
        if u > 0:
            person(d, x, y, 70 * u, WHITE)
    return finish(img)


def notary(t, dur, lines=("ANTE NOTARÍA",)):
    """Documento que se firma y recibe el sello dorado de la notaría."""
    img, d = canvas()
    title(d, lines, t, y=440)
    img = img.convert("RGBA")
    pw, ph = 600, 660
    u = ease(t / 0.35)
    cy = 1000 + (1 - u) * 260
    base = paper("doc", pw, ph, "").copy()
    pd = ImageDraw.Draw(base)
    for i in range(4):
        y = 220 + i * 70
        pd.rounded_rectangle(S(80, y, 80 + pw - 160 - (i % 2) * 90, y + 18), radius=9 * K, fill=(185, 192, 205))
    # Firma que se dibuja sobre la línea.
    pd.line(S(80, 560, 330, 560), fill=INK, width=3 * K)
    v = ease((t - 0.35) / 0.6)
    pts = [(90 + 230 * k / 40, 525 - 28 * math.sin(k / 40 * 9.5) * (1 - k / 60)) for k in range(int(40 * v) + 1)]
    if len(pts) > 1:
        pd.line([(x * K, y * K) for x, y in pts], fill=NAVY, width=5 * K, joint="curve")
    paste_rot(img, base, W / 2, cy, alpha=u)
    # Sello dorado.
    s = (t - min(dur * 0.6, 1.0)) / 0.14
    if s > 0:
        st = Image.new("RGBA", (300 * K, 300 * K), (0, 0, 0, 0))
        sd = ImageDraw.Draw(st)
        sd.ellipse(S(10, 10, 290, 290), outline=GOLD, width=14 * K, fill=(242, 193, 78, 40))
        sd.ellipse(S(45, 45, 255, 255), outline=GOLD, width=5 * K)
        star = [(150 + (62 if k % 2 == 0 else 26) * math.cos(-math.pi / 2 + k * math.pi / 5),
                 150 + (62 if k % 2 == 0 else 26) * math.sin(-math.pi / 2 + k * math.pi / 5)) for k in range(10)]
        sd.polygon([(x * K, y * K) for x, y in star], fill=GOLD)
        sc = 1 + 1.2 * (1 - ease(s))
        paste_rot(img, st, W / 2 + 170, cy + 200, angle=-10, scale=sc * 0.9, alpha=min(1, s))
    return finish(img.convert("RGB"))


def gavel(t, dur, lines=("PROCESO", "JUDICIAL"), hit_at=0.55):
    """Mazo de juez que golpea la base (con ondas al golpear)."""
    img, d = canvas()
    title(d, lines, t, y=430)
    img = img.convert("RGBA")
    # Base.
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle(S(W / 2 - 220, 1180, W / 2 + 220, 1240), radius=16 * K, fill=GOLD)
    d.rounded_rectangle(S(W / 2 - 160, 1140, W / 2 + 160, 1190), radius=14 * K, fill=(214, 166, 60))
    # Mazo: sube y cae hasta el golpe; rebota un poco después.
    if t < hit_at:
        ang = 38 * (1 - (t / hit_at) ** 2)
    else:
        ang = 6 * math.exp(-(t - hit_at) * 9) * abs(math.sin((t - hit_at) * 14))
    g = Image.new("RGBA", (760 * K, 300 * K), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    gd.rounded_rectangle(S(300, 60, 460, 240), radius=24 * K, fill=WHITE)  # cabeza
    gd.rectangle(S(286, 80, 300, 220), fill=GOLD)
    gd.rectangle(S(460, 80, 474, 220), fill=GOLD)
    gd.rounded_rectangle(S(460, 130, 740, 170), radius=18 * K, fill=WHITE)  # mango
    # Gira alrededor del extremo del mango.
    big = Image.new("RGBA", (1500 * K, 1500 * K), (0, 0, 0, 0))
    big.alpha_composite(g, (750 * K - 740 * K, 750 * K - 150 * K))
    big = big.rotate(-ang, resample=Image.BICUBIC, center=(750 * K, 750 * K))
    # La cabeza golpea en x≈W/2, y≈1100.
    img.alpha_composite(big, (int((W / 2 + 360) * K - 750 * K), int(1100 * K - 750 * K)))
    if t >= hit_at:
        u = (t - hit_at) / 0.45
        if u < 1:
            d = ImageDraw.Draw(img, "RGBA")
            for k in range(2):
                r = 120 + 260 * min(1, u + k * 0.2)
                a = int(160 * (1 - u))
                d.arc(S(W / 2 - r, 1150 - r * 0.45, W / 2 + r, 1150 + r * 0.45), 180, 360, fill=GOLD + (a,), width=6 * K)
    return finish(img.convert("RGB"))


GRAPHICS.update({"family_tree": family_tree, "notary": notary, "gavel": gavel})
