#!/usr/bin/env python3
"""Fotos de apoyo del video de Nia animadas a pantalla completa, como la pintura de Sócrates
(scripts/make_socrates.py): cámara que recorre la foto en vertical y partes que se mueven.

Capas por foto (coordenadas de la foto original):
  persona  recorte de la persona en primer plano (rembg birefnet-portrait) con paralaje: se mueve un
           poco más que el fondo y respira (escala), así la foto gana profundidad;
  parte    polígono que gira o se desplaza alrededor de un pivote (el cartel de la protesta, buses);
  ondear   zona que ondula (banderines);
  derivar  zona que se desliza despacio (nubes);
  velas    luz que titila alrededor de una llama.
Debajo de lo que se mueve va la foto con esas zonas rellenadas (cv2.inpaint) para que no se vea doble.
Salida: public/nia/broll/<nombre>-anim.mp4 (1080x1920, 30 fps, 3 s).

Uso: U2NET_HOME=$PWD/whisper-models/u2net python3 scripts/make_fotos.py [nombre ...]
"""
import math
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/media/nia/broll"
OUT = f"{ROOT}/public/nia/broll"
TMP = f"{ROOT}/out/nia/tmp"
W, H, FPS, DUR = 1080, 1920, 30, 3.0
# Misma gradación viva que las tomas (build_nia.py), un poco más suave.
GRADE = ("vibrance=intensity=0.25,eq=saturation=1.08:contrast=1.05,"
         "curves=b='0/0.015 0.5/0.5 1/0.98',colorbalance=bs=0.02:rh=0.02:bh=-0.015")


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


# cam: (x inicial, x final) del centro de la ventana y (zoom inicial, zoom final); y = centro vertical.
FOTOS = {
    "protesta": dict(
        cam=((250, 360), (1.0, 1.08)), y=300,
        partes=[dict(poly=[(218, 62), (490, 70), (486, 392), (224, 386)], pivot=(330, 560),
                     rot=lambda t: 2.4 * math.sin(2 * math.pi * t / 1.3))]),
    "nestle": dict(cam=((470, 400), (1.0, 1.07)), y=300, persona=0.04, brillo=True),
    "pobreza": dict(
        cam=((300, 380), (1.0, 1.08)), y=290, persona=0.035,
        derivar=[dict(box=(0, 0, 731, 70), dx=18)]),
    "barrio": dict(
        cam=((430, 520), (1.0, 1.06)), y=520,
        ondear=[dict(box=(620, 540, 856, 640), amp=3.0, period=0.9), dict(box=(145, 548, 420, 650), amp=2.5, period=1.1)],
        derivar=[dict(box=(0, 0, 856, 75), dx=16)]),
    "universidad": dict(
        cam=((190, 340), (1.0, 1.06)), y=330,
        derivar=[dict(box=(0, 0, 808, 300), dx=14, until=520)]),
    "mesa": dict(
        cam=((250, 430), (1.0, 1.07)), y=205, persona=0.03,
        velas=[(304, 282, 22), (455, 258, 20)]),
    "transporte": dict(
        cam=((330, 470), (1.0, 1.08)), y=330, persona=0.03,
        partes=[dict(poly=[(600, 150), (864, 170), (864, 360), (600, 330)], pivot=(730, 260),
                     dx=lambda t: -4.0 * t / DUR)]),
}


def persona_mask(name, img):
    """Máscara de la persona en primer plano (birefnet-portrait, en otro proceso y a media resolución:
    en 4K junto con más imágenes se quedaba sin memoria)."""
    path = f"{TMP}/{name}-persona.png"
    if not os.path.exists(path):
        src = f"{TMP}/{name}-in.png"
        cv2.imwrite(src, img)
        code = ("import sys;from PIL import Image;from rembg import new_session,remove;"
                "im=Image.open(sys.argv[1]);"
                "remove(im,session=new_session('birefnet-portrait'),only_mask=True).save(sys.argv[2])")
        subprocess.run([sys.executable, "-c", code, src, path], check=True)
    return cv2.imread(path, cv2.IMREAD_GRAYSCALE)


def poly_mask(shape, poly, s):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.int32(np.array(poly) * s)], 255)
    return m


def render(name, cfg):
    img = cv2.imread(f"{SRC}/{name}.jpg")
    s = max(1992 / img.shape[0], 1240 / img.shape[1])  # lienzo un poco más grande que la ventana
    canvas = cv2.resize(img, (int(img.shape[1] * s), int(img.shape[0] * s)), interpolation=cv2.INTER_LANCZOS4)
    canvas = cv2.addWeighted(canvas, 1.4, cv2.GaussianBlur(canvas, (0, 0), 2.2), -0.4, 0)  # nitidez
    ch, cw = canvas.shape[:2]
    feather = lambda m, r=3.5: cv2.GaussianBlur(m, (0, 0), r).astype(np.float32) / 255  # noqa: E731
    layers, union = [], np.zeros((ch, cw), np.uint8)
    for p in cfg.get("partes", []):
        m = poly_mask((ch, cw), p["poly"], s)
        union |= cv2.dilate(m, np.ones((21, 21), np.uint8))
        layers.append(("parte", p, feather(m)))
    if cfg.get("persona"):
        m = cv2.resize(persona_mask(name, img), (cw, ch), interpolation=cv2.INTER_LINEAR)
        m = (m > 128).astype(np.uint8) * 255
        union |= cv2.dilate(m, np.ones((25, 25), np.uint8))
        layers.append(("persona", cfg["persona"], feather(m, 2.5)))
    base = canvas
    if union.any():
        # Relleno a media resolución (zonas grandes) y solo dentro de la máscara.
        small = cv2.inpaint(cv2.resize(canvas, (cw // 2, ch // 2)), cv2.resize(union, (cw // 2, ch // 2)), 7,
                            cv2.INPAINT_TELEA)
        fill = cv2.resize(small, (cw, ch))
        a = feather(union, 6)[..., None]
        base = (canvas * (1 - a) + fill * a).astype(np.uint8)
    src = canvas.astype(np.float32)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                             "-r", str(FPS), "-i", "-", "-vf", f"{GRADE},format=yuv420p", "-c:v", "libx264",
                             "-preset", "slow", "-crf", "17", "-movflags", "+faststart",
                             f"{OUT}/{name}-anim.mp4"], stdin=subprocess.PIPE)
    (x_a, x_b), (z_a, z_b) = cfg["cam"]
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    for i in range(int(DUR * FPS)):
        t = i / FPS
        k = ease(t / DUR) * 0.6 + 0.4 * t / DUR  # arranca rápido y frena suave
        cx, zoom = (x_a + (x_b - x_a) * k) * s, z_a + (z_b - z_a) * k
        frame = base.astype(np.float32)
        for kind, p, a in layers:
            if kind == "parte":
                px, py = p["pivot"][0] * s, p["pivot"][1] * s
                M = cv2.getRotationMatrix2D((px, py), p["rot"](t) if "rot" in p else 0.0, 1.0)
                M[0, 2] += (p["dx"](t) if "dx" in p else 0.0) * s
            else:
                # Paralaje: la persona se mueve con la cámara un poco más que el fondo y respira.
                sc = 1 + p * k + 0.006 * math.sin(2 * math.pi * t / 1.8)
                M = cv2.getRotationMatrix2D((cx, ch * 0.75), 0.0, sc)
                M[0, 2] -= (x_b - x_a) * s * p * k * 1.5
            part = cv2.warpAffine(src, M, (cw, ch), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            am = cv2.warpAffine(a, M, (cw, ch), flags=cv2.INTER_LINEAR)[..., None]
            frame = frame * (1 - am) + part * am
        for d in cfg.get("derivar", []):
            x0, y0, x1, y1 = (int(v * s) for v in d["box"])
            band = np.zeros((ch, cw), np.uint8)
            band[y0:y1, x0:min(cw, int(d.get("until", 99999) * s))] = 255
            a = feather(band, 25)[..., None]
            shift = d["dx"] * s * t / DUR
            moved = cv2.remap(frame, xx - shift, yy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            frame = frame * (1 - a) + moved * a
        for o in cfg.get("ondear", []):
            x0, y0, x1, y1 = (int(v * s) for v in o["box"])
            band = np.zeros((ch, cw), np.uint8)
            band[y0:y1, x0:x1] = 255
            a = feather(band, 12)
            disp = o["amp"] * s * np.sin(2 * np.pi * (xx / (60 * s) - t / o["period"])) * a
            frame = cv2.remap(frame, xx, yy + disp, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        for vx, vy, vr in cfg.get("velas", []):
            # Velas: la luz titila (brillo cálido alrededor de la llama).
            g = 0.10 * math.sin(t * 21 + vx) + 0.06 * math.sin(t * 34 + vy)
            d2 = ((xx - vx * s) ** 2 + (yy - vy * s) ** 2) / (vr * s * 2.2) ** 2
            frame *= (1 + g * np.exp(-d2))[..., None]
        if cfg.get("brillo"):
            frame *= 1 + 0.04 * math.sin(2 * math.pi * t / 1.5)
        # Ventana vertical 9:16 (con zoom) centrada en cx, cfg["y"].
        wh = min(ch * 0.97, cw * H / W) / zoom
        ww = wh * W / H
        x0 = int(max(0, min(cw - ww, cx - ww / 2)))
        y0 = int(max(0, min(ch - wh, cfg["y"] * s - wh / 2)))
        win = frame[y0:y0 + int(wh), x0:x0 + int(ww)]
        out = cv2.resize(np.clip(win, 0, 255).astype(np.uint8), (W, H), interpolation=cv2.INTER_LINEAR)
        proc.stdin.write(out.tobytes())
    proc.stdin.close()
    proc.wait()
    print("listo", name)


def video_full(name, src):
    """Video de apoyo (vertical 3:4) a pantalla completa: recorte 9:16 al centro con un acercamiento lento."""
    vf = (f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},"
          f"zoompan=z='1+0.0012*on':d=1:s={W}x{H}:fps={FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',"
          f"{GRADE},format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{SRC}/{src}", "-an", "-vf", vf, "-c:v", "libx264",
                    "-preset", "slow", "-crf", "17", "-movflags", "+faststart", f"{OUT}/{name}-anim.mp4"], check=True)
    print("listo", name)


VIDEOS = {"discusion": "discusion.mp4"}

if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    for n in sys.argv[1:] or list(FOTOS) + list(VIDEOS):
        if n in VIDEOS:
            video_full(n, VIDEOS[n])
        else:
            render(n, FOTOS[n])
