#!/usr/bin/env python3
"""Foto de perfil con la foto de traje (media/perfil/traje.jpg, la mandó el cliente) sobre fondo sólido con el
azul y el rojo de la campaña, «como el del carrusel del IVA». Recorte con rembg (birefnet-portrait, máscara en
out/perfil/traje-mask.png) y dos fondos:
  diagonal  azul a la izquierda / rojo a la derecha, partidos en diagonal
  iva       azul noche del carrusel del IVA con un resplandor rojo detrás de la cabeza
Salida: out/perfil/perfil-traje-<fondo>.png (1080x1080) y la vista en círculo -circulo.png.

Uso: python3 scripts/make_perfil_traje.py
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/out/perfil"
S = 1080
BLUE, BLUE_D = np.array([29, 62, 158]), np.array([11, 23, 54])
RED, RED_D = np.array([227, 6, 19]), np.array([140, 0, 12])
# Centro de la cara en la foto original y dónde queda en el cuadro; escala de la persona.
FACE, FACE_TO, SCALE = (840, 225), (540, 410), 1.18


def lerp(a, b, t):
    return a[None, None, :] * (1 - t[..., None]) + b[None, None, :] * t[..., None]


def fondo(kind):
    y, x = np.mgrid[0:S, 0:S] / S
    vign = np.clip(np.hypot(x - 0.5, y - 0.42) / 0.75, 0, 1)  # bordes un poco más oscuros
    if kind == "diagonal":
        blue = lerp(BLUE, BLUE_D, vign * 0.8)
        red = lerp(RED, RED_D, vign * 0.8)
        side = (x + 0.35 * (y - 0.5)) > 0.5  # corte diagonal suave
        img = np.where(side[..., None], red, blue)
    else:
        img = lerp(np.array([31, 59, 140]), np.array([7, 15, 38]), np.clip(np.hypot(x - 0.8, y - 0.1) / 1.1, 0, 1))
        glow = np.exp(-(((x - 0.5) ** 2) / 0.05 + ((y - 0.45) ** 2) / 0.07))
        img = img * (1 - 0.75 * glow[..., None]) + RED[None, None, :] * 0.75 * glow[..., None]
    return Image.fromarray(img.astype(np.uint8))


def persona():
    foto = Image.open(f"{ROOT}/media/perfil/traje.jpg").convert("RGB")
    mask = Image.open(f"{OUT}/traje-mask.png").convert("L")
    w, h = round(foto.width * SCALE), round(foto.height * SCALE)
    foto, mask = foto.resize((w, h), Image.LANCZOS), mask.resize((w, h), Image.LANCZOS)
    dx, dy = FACE_TO[0] - round(FACE[0] * SCALE), FACE_TO[1] - round(FACE[1] * SCALE)
    capa, alfa = Image.new("RGB", (S, S)), Image.new("L", (S, S), 0)
    capa.paste(foto, (dx, dy))
    alfa.paste(mask, (dx, dy))
    return capa, alfa


def componer(kind):
    bg = fondo(kind)
    capa, alfa = persona()
    # Sombra suave detrás de la persona para despegarla del fondo.
    sombra = alfa.filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * 0.55))
    bg.paste(Image.new("RGB", (S, S), (0, 0, 0)), (14, 18), sombra)
    bg.paste(capa, (0, 0), alfa)
    bg.save(f"{OUT}/perfil-traje-{kind}.png")
    circ = Image.new("L", (S, S), 0)
    ImageDraw.Draw(circ).ellipse((0, 0, S - 1, S - 1), fill=255)
    vista = Image.new("RGB", (S, S), (255, 255, 255))
    vista.paste(bg, (0, 0), circ)
    vista.save(f"{OUT}/perfil-traje-{kind}-circulo.png")


if __name__ == "__main__":
    for k in ("diagonal", "iva"):
        componer(k)
    print("listo")
