"""Composición final: persona sobre fondo rojo con negro, 2048x2048 (y vista circular de prueba)."""
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw

D = os.path.dirname(os.path.abspath(__file__))
OUT = 2048

fg = np.asarray(Image.open(f"{D}/fg.png")).astype(np.float32) / 255
a = np.load(f"{D}/alpha.npy").astype(np.float32)
# Bordes limpios: el borde de la silueta tenía restos claros del fondo rosado. Se cierra un poco el alfa y,
# en la franja del borde, el color se toma del interior de la persona (relleno hacia afuera).
a = np.clip((a - 0.35) / 0.6, 0, 1)
a = cv2.GaussianBlur(a, (0, 0), 1.2)
interior = (a > 0.98).astype(np.uint8)
band = (cv2.dilate(1 - interior, np.ones((3, 3))) & cv2.dilate((a > 0.01).astype(np.uint8), np.ones((15, 15))))
fg8 = (fg * 255).round().astype(np.uint8)
fill = cv2.inpaint(fg8, band, 6, cv2.INPAINT_TELEA).astype(np.float32) / 255
fg = np.where(band[..., None] > 0, fill, fg)
# Encuadre: círculo original (centro 1480, radio ~1408 en la imagen x4) con la persona un 8 % más grande,
# para que el corte curvo de la chaqueta quede fuera del círculo de perfil.
cx = cy = 1480
side = 2 * 1408 / 1.08
x0, y0 = cx - side / 2, cy - side / 2 - 60  # persona un poco más abajo: más aire sobre la cabeza
M = np.float32([[OUT / side, 0, -x0 * OUT / side], [0, OUT / side, -y0 * OUT / side]])
fg = cv2.warpAffine(fg, M, (OUT, OUT), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE)
a = cv2.warpAffine(a, M, (OUT, OUT), flags=cv2.INTER_AREA)[..., None]
# Fila más alta y más baja de la persona en el centro (control).
rows = np.where(a[:, OUT // 2, 0] > 0.5)[0]

# Fondo: resplandor rojo detrás de la persona que se va a negro en los bordes, con luz diagonal suave.
yy, xx = np.mgrid[0:OUT, 0:OUT].astype(np.float32) / OUT
d = np.sqrt((xx - 0.5) ** 2 + ((yy - 0.42) * 1.1) ** 2)
u = np.clip(d / 0.72, 0, 1)
# Rojo vivo en casi todo el círculo de perfil; el negro entra solo hacia las orillas y las esquinas
# (la primera versión era tan oscura que en el celular el rojo se veía casi negro).
red = np.array([226, 18, 34], np.float32) / 255
mid = np.array([150, 8, 20], np.float32) / 255
blk = np.array([6, 4, 6], np.float32) / 255
t1 = np.clip(u / 0.85, 0, 1)[..., None] ** 1.6
t2 = np.clip((u - 0.78) / 0.32, 0, 1)[..., None]
bg = red * (1 - t1) + mid * t1
bg = bg * (1 - t2) + blk * t2
streak = np.exp(-((xx - yy * 0.6 - 0.05) ** 2) / 0.01)[..., None] * 0.06
bg = np.clip(bg + streak * red, 0, 1)
bg += np.random.default_rng(1).normal(0, 0.006, bg.shape).astype(np.float32)  # grano: sin bandas

# Halo rojo detrás de la silueta (da profundidad).
glow = cv2.GaussianBlur(a[..., 0], (0, 0), 40)[..., None]
bg = np.clip(bg + glow * np.array([0.55, 0.05, 0.08], np.float32) * 0.15, 0, 1)
# Sombra suave pegada a la silueta.
sh = cv2.GaussianBlur(a[..., 0], (0, 0), 14)[..., None]
bg = bg * (1 - sh * 0.35)
# Luz de borde roja sutil sobre la persona (como si el fondo la iluminara).
inner = np.clip(a[..., 0] - cv2.erode(a[..., 0], np.ones((25, 25))), 0, 1)
rim = cv2.GaussianBlur(inner, (0, 0), 6)[..., None] * 0.25
person = np.clip(fg + rim * (red - fg) * 0.6, 0, 1)

out = person * a + bg * (1 - a)
img = Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8))
img.save(f"{D}/perfil-2048.png")
img.save(f"{D}/perfil-2048.jpg", quality=95)
img.resize((1080, 1080), Image.LANCZOS).save(f"{D}/perfil-1080.jpg", quality=95)
# Vista de prueba en círculo (como se ve en Instagram/WhatsApp).
m = Image.new("L", (OUT, OUT), 0)
ImageDraw.Draw(m).ellipse((0, 0, OUT, OUT), fill=255)
prev = Image.new("RGB", (OUT, OUT), (20, 22, 28))
prev.paste(img, (0, 0), m)
prev.resize((600, 600), Image.LANCZOS).save(f"{D}/vista-circulo.jpg", quality=92)
print("listo", rows.min() if len(rows) else None, rows.max() if len(rows) else None)
