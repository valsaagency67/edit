#!/usr/bin/env python3
"""Fotos de perfil con fondo rojo y azul a partir de cuadros 4K de los videos de la petición.

Para cada toma: cuadro del original (HLG -> BT.709), recorte de la persona con rembg
(birefnet-portrait, modelo en whisper-models/u2net), micrófono de solapa borrado clonando tela
lisa de la misma camisa (cv2.seamlessClone), contorno blanco y sombra, y dos fondos:
  split   azul a la izquierda / rojo a la derecha con corte diagonal
  glow    resplandor rojo detrás de la cabeza que se abre a azul en los bordes
Salida: out/perfil/perfil-<toma>-<fondo>.png (1080x1080) y una vista en círculo.

Uso: U2NET_HOME=whisper-models/u2net python3 scripts/make_perfil.py
"""
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/out/perfil"
TMP = os.environ.get("PERFIL_TMP", f"{ROOT}/out/perfil/tmp")
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=2,"
      "zscale=t=bt709:m=bt709:r=tv,format=rgb24")
BLUE, BLUE_D = np.array([29, 62, 158]), np.array([12, 30, 92])
RED, RED_D = np.array([227, 6, 19]), np.array([150, 0, 12])

# toma: clip, segundo, caja del micrófono (x0, y0, x1, y1) y desplazamiento de la tela fuente,
# recorte cuadrado (x0, y0, lado) en coordenadas del cuadro 4K (2160x3840).
SHOTS = {
    "caminando": dict(clip="IMG_1741", t=12.90, mic=(1262, 1518, 1568, 1670), src=(0, 178), sq=(420, 0, 1760)),
    "catedral": dict(clip="IMG_1724", t=24.65, mic=(1103, 1850, 1256, 1982), src=(0, 170), sq=(218, 606, 1600)),
    # Frame de la captura (IMG_1713 al inicio, cara seria), con el micrófono sobre la camisa.
    "inicio": dict(clip="IMG_1713", t=0.3, mic=(688, 2520, 900, 2720), src=(0, 260), sq=(0, 648, 2100)),
}


def frame(clip, t):
    path = f"{TMP}/{clip}_{t:.2f}.png"
    if not os.path.exists(path):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", f"{ROOT}/media/raw/{clip}.MOV",
                        "-frames:v", "1", "-vf", TM, path], check=True)
    return Image.open(path).convert("RGB")


def matte(img, key):
    """Máscara de la persona (birefnet-portrait). Se corre aparte y a media resolución: en 4K
    junto con otras tomas el proceso se queda sin memoria."""
    path = f"{TMP}/mask_{key}.png"
    if not os.path.exists(path):
        src = f"{TMP}/in_{key}.png"
        img.save(src)
        code = ("import sys;from PIL import Image;from rembg import new_session,remove;"
                "im=Image.open(sys.argv[1]);s=im.resize((im.width//2,im.height//2),Image.LANCZOS);"
                "remove(s,session=new_session('birefnet-portrait'),only_mask=True)"
                ".resize(im.size,Image.LANCZOS).save(sys.argv[2])")
        subprocess.run([sys.executable, "-c", code, src, path], check=True)
    return np.array(Image.open(path).convert("L")).astype(np.float32) / 255


def remove_mic(img, box, shift, feather=26):
    """Tapa el micrófono (y su pinza negra) con un parche de tela real de la misma camisa: el parche
    se escoge con la misma geometría (p. ej. la misma línea de la tapeta), se ajusta al tono del
    borde de la zona y se mezcla con bordes difuminados. Así conserva la textura del tejido."""
    a = np.array(img).astype(np.float32)
    x0, y0, x1, y1 = box
    dx, dy = shift
    f = feather
    X0, Y0, X1, Y1 = x0 - f, y0 - f, x1 + f, y1 + f
    tgt = a[Y0:Y1, X0:X1]
    src = a[Y0 + dy:Y1 + dy, X0 + dx:X1 + dx].copy()
    h, w = tgt.shape[:2]
    m = np.zeros((h, w), np.float32)
    cv2.ellipse(m, (w // 2, h // 2), ((x1 - x0) // 2 + f // 2, (y1 - y0) // 2 + f // 2), 0, 0, 360, 1.0, -1)
    m = cv2.GaussianBlur(m, (0, 0), f / 2.5)
    # Tono: el borde de la zona (donde m es bajo) manda; se iguala la media por canal.
    ring = (m > 0.02) & (m < 0.4)
    gain = tgt[ring].mean(0) / np.maximum(src[ring].mean(0), 1)
    src = np.clip(src * gain, 0, 255)
    a[Y0:Y1, X0:X1] = tgt * (1 - m[..., None]) + src * m[..., None]
    return Image.fromarray(a.astype(np.uint8))


def background(kind, L):
    yy, xx = np.mgrid[0:L, 0:L].astype(np.float32) / L
    # Luz suave detrás de la cabeza (arriba al centro).
    r = np.sqrt((xx - 0.5) ** 2 + (yy - 0.38) ** 2)
    if kind == "split":
        # Corte diagonal: de (0.62, 0) a (0.40, 1); 1.5 % de transición para que no se vea dentado.
        line = 0.62 - 0.22 * yy
        w = np.clip((xx - line) / 0.015 + 0.5, 0, 1)[..., None]
        blue = BLUE + (BLUE_D - BLUE) * np.clip(r * 1.6, 0, 1)[..., None]
        red = RED + (RED_D - RED) * np.clip(r * 1.6, 0, 1)[..., None]
        bg = blue * (1 - w) + red * w
    else:
        t = np.clip((r - 0.12) / 0.5, 0, 1)[..., None]
        bg = RED * (1 - t) ** 1.5 + BLUE_D * (1 - (1 - t) ** 1.5)
        bg = bg * (1 - 0.25 * np.clip((r - 0.55) / 0.3, 0, 1)[..., None])
    return bg


def compose(key, cfg):
    img = frame(cfg["clip"], cfg["t"])
    img = remove_mic(img, cfg["mic"], cfg["src"])
    alpha = matte(img, key)
    x0, y0, L = cfg["sq"]
    # Lienzo cuadrado (con margen si el cuadrado sale del cuadro: ahí no hay persona).
    pad = np.zeros((L, L, 3), np.float32)
    pa = np.zeros((L, L), np.float32)
    src = np.array(img).astype(np.float32)
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(img.width, x0 + L), min(img.height, y0 + L)
    pad[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = src[sy0:sy1, sx0:sx1]
    pa[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = alpha[sy0:sy1, sx0:sx1]

    stroke = int(L * 0.012)
    hard = (pa > 0.5).astype(np.uint8)
    ring = cv2.dilate(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * stroke + 1,) * 2))
    ring = cv2.GaussianBlur(ring.astype(np.float32), (0, 0), stroke * 0.25)
    shadow = cv2.GaussianBlur(np.roll(ring, int(L * 0.012), axis=0), (0, 0), L * 0.02) * 0.45

    for kind in ("split", "glow"):
        bg = background(kind, L)
        out = bg * (1 - shadow[..., None])
        out = out * (1 - ring[..., None]) + 255 * ring[..., None]
        out = out * (1 - pa[..., None]) + pad * pa[..., None]
        im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).resize((1080, 1080), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
        path = f"{OUT}/perfil-{key}-{kind}.png"
        im.save(path)
        print("listo", path)


def circle_preview(paths, dst):
    tiles = []
    for p in paths:
        im = Image.open(p).resize((360, 360), Image.LANCZOS)
        m = Image.new("L", (360, 360), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(m).ellipse((0, 0, 359, 359), fill=255)
        tile = Image.new("RGB", (360, 360), "white")
        tile.paste(im, (0, 0), m)
        tiles.append(tile)
    sheet = Image.new("RGB", (len(tiles) * 380, 360), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * 380, 0))
    sheet.save(dst)


if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    done = []
    keys = sys.argv[1:] or list(SHOTS)
    for key in keys:
        compose(key, SHOTS[key])
        done += [f"{OUT}/perfil-{key}-split.png", f"{OUT}/perfil-{key}-glow.png"]
    circle_preview(done, f"{OUT}/vista-circulos-{'-'.join(keys)}.png")
    print("vista", f"{OUT}/vista-circulos.png")
