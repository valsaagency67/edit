#!/usr/bin/env python3
"""Pixela la cara del vigilante en un master de IMG_1697.

En el material, Juan Felipe le promete al vigilante: "te voy a pixelear". El vigilante
siempre está a la izquierda de Juan Felipe, así que se toma la cara detectada más a la
izquierda (Haar frontal + perfil, OpenCV), se suaviza el recorrido y se mantiene la última
caja cuando la detección falla mientras él sigue en cuadro.
Uso: python3 scripts/pixelate_guard.py <master entrada> <salida> <desde_s> <hasta_s>
     (desde_s: segundo del master en que el vigilante ya está en cuadro)
Ej.: python3 scripts/pixelate_guard.py IMG_1697_44s IMG_1697_hook 0 16
"""
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/public/master/{sys.argv[1]}.mov"
OUT = f"{ROOT}/public/master/{sys.argv[2]}.mov"
GUARD_FROM_S, END_S = float(sys.argv[3]), float(sys.argv[4])
FPS, W, H = 60, 1080, 1920
BLOCK = 28  # tamaño del mosaico en px

front = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
profile = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")


def detect(gray):
    small = cv2.resize(gray, (W // 2, H // 2))
    boxes = []
    for casc, flip in ((front, False), (profile, False), (profile, True)):
        img = cv2.flip(small, 1) if flip else small
        for (x, y, w, h) in casc.detectMultiScale(img, 1.1, 5, minSize=(40, 40)):
            if flip:
                x = small.shape[1] - x - w
            boxes.append((x * 2, y * 2, w * 2, h * 2))
    # Solo caras en la mitad izquierda y en la franja de altura de cabeza.
    boxes = [b for b in boxes if b[0] + b[2] / 2 < W * 0.55 and H * 0.1 < b[1] + b[3] / 2 < H * 0.6]
    return min(boxes, key=lambda b: b[0]) if boxes else None


def main():
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-t", str(END_S), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                           stdout=subprocess.PIPE)
    frames = []
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        frames.append(np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy())
    n = len(frames)
    first = int(GUARD_FROM_S * FPS)
    raw = [None] * n
    for i in range(first, n, 2):
        raw[i] = detect(cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY))
    # Rellenar huecos (mantener/interpolar) y suavizar con media móvil.
    known = [(i, b) for i, b in enumerate(raw) if b is not None]
    print(f"detecciones: {len(known)} de {(n - first) // 2}")
    boxes = [None] * n
    if known:
        for i in range(first, n):
            prev = max((k for k in known if k[0] <= i), default=None, key=lambda k: k[0])
            nxt = min((k for k in known if k[0] >= i), default=None, key=lambda k: k[0])
            if prev and nxt and nxt[0] != prev[0]:
                f = (i - prev[0]) / (nxt[0] - prev[0])
                boxes[i] = tuple(p + (q - p) * f for p, q in zip(prev[1], nxt[1]))
            else:
                boxes[i] = (prev or nxt)[1]
        # El vigilante aparece desde la izquierda: antes de la primera detección, la caja sigue
        # a la primera detección para cubrir su entrada.
        for i in range(first, known[0][0]):
            boxes[i] = known[0][1]
        k = 9
        for i in range(first, n):
            win = [boxes[j] for j in range(max(first, i - k), min(n, i + k + 1)) if boxes[j]]
            boxes[i] = tuple(np.mean(win, axis=0))
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", SRC, "-map", "0:v", "-map", "1:a", "-t", str(END_S), "-c:v", "libx264", "-preset", "fast", "-crf", "10",
         "-pix_fmt", "yuv420p", "-g", "30", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-c:a", "copy", OUT], stdin=subprocess.PIPE)
    for i, fr in enumerate(frames):
        b = boxes[i]
        if b:
            x, y, w, h = b
            cx, cy = x + w / 2, y + h / 2
            s = max(w, h) * 1.7  # margen: pelo, orejas, mentón
            x0, y0 = int(max(0, cx - s / 2)), int(max(0, cy - s * 0.55))
            x1, y1 = int(min(W, cx + s / 2)), int(min(H, cy + s * 0.55))
            if x1 - x0 > BLOCK and y1 - y0 > BLOCK:
                roi = fr[y0:y1, x0:x1]
                small = cv2.resize(roi, ((x1 - x0) // BLOCK, (y1 - y0) // BLOCK), interpolation=cv2.INTER_AREA)
                fr[y0:y1, x0:x1] = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
        enc.stdin.write(fr.tobytes())
    enc.stdin.close()
    enc.wait()
    print("listo", OUT)


if __name__ == "__main__":
    main()
