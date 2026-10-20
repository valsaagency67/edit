#!/usr/bin/env python3
"""«La muerte de Sócrates» (Jacques-Louis David, 1787; dominio público) animada para el video de Nia.

Cada personaje que se mueve es un recorte del cuadro (polígono con borde difuminado) que se gira o se
desplaza poco alrededor de un pivote; debajo, el cuadro con esas zonas rellenadas (cv2.inpaint) para
que no se vea doble. La cámara recorre el cuadro de izquierda a derecha y se queda en Sócrates.
  - Sócrates: el brazo levantado sube y baja el dedo, la cabeza asiente como si hablara, la mano
    sobre la copa se mueve;
  - el que le pasa la copa solloza (la cabeza tiembla), Critón inclina la cabeza, Platón asiente;
  - el discípulo contra la pared y la mano del borde derecho se mueven; la lámpara titila.
Salida: public/nia/broll/socrates.mp4 (1080x1920, 30 fps) y src/nia/socrates.json (posición en
pantalla de las cabezas para anclar los globos de texto).
Uso: python3 scripts/make_socrates.py
"""
import json
import math
import os
import subprocess

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/media/nia/socrates/david.jpg"
OUT = f"{ROOT}/public/nia/broll/socrates.mp4"
W, H, FPS, DUR = 1080, 1920, 30, 6.5
S = 3.4          # escala del cuadro (798x586 -> 2713x1992)
OY = 40          # recorte vertical del lienzo
PAN_END = 1.6    # s: la cámara llega a Sócrates
GRADE = ("eq=saturation=0.9:contrast=0.95:brightness=0.02,"
         "curves=r='0/0.05 1/0.98':g='0/0.04 1/0.97':b='0/0.08 1/0.96'")

# Partes móviles: polígono (coordenadas del cuadro original), pivote y movimiento en función de t.
# rot: grados; dy: píxeles del cuadro original.
PARTS = {
    "brazo": dict(poly=[(528, 262), (530, 228), (526, 205), (524, 185), (529, 161), (537, 163), (546, 179),
                        (552, 196), (554, 216), (559, 240), (553, 263), (540, 272)],
                  pivot=(538, 262), rot=lambda t: 3.0 * math.sin(2 * math.pi * t / 1.4)),
    "cabeza": dict(poly=[(461, 196), (472, 187), (490, 186), (503, 194), (506, 214), (502, 236), (493, 248),
                         (478, 250), (466, 240), (460, 220)],
                   pivot=(486, 250), rot=lambda t: 2.2 * math.sin(2 * math.pi * t / 0.9) * (0.6 + 0.4 * math.sin(t))),
    "mano": dict(poly=[(351, 237), (372, 233), (393, 236), (397, 249), (384, 258), (360, 258), (350, 249)],
                 pivot=(400, 250), dy=lambda t: 1.4 * math.sin(2 * math.pi * t / 1.1)),
    "copero": dict(poly=[(228, 203), (250, 200), (272, 206), (281, 224), (277, 246), (262, 254), (240, 256),
                         (227, 246)],
                   pivot=(258, 256), dy=lambda t: 1.3 * abs(math.sin(2 * math.pi * t * 1.6))),
    "criton": dict(poly=[(557, 271), (575, 260), (601, 261), (613, 275), (613, 301), (603, 319), (585, 323),
                         (565, 313), (555, 295)],
                   pivot=(592, 322), rot=lambda t: 3.0 * math.sin(2 * math.pi * t / 2.3 + 1.0)),
    "platon": dict(poly=[(112, 268), (124, 257), (146, 259), (153, 275), (151, 296), (136, 303), (117, 296)],
                   pivot=(136, 306), rot=lambda t: 1.6 * math.sin(2 * math.pi * t / 2.8)),
    "pared": dict(poly=[(188, 245), (197, 192), (210, 180), (224, 188), (226, 215), (220, 248)],
                  pivot=(208, 258), rot=lambda t: 2.0 * math.sin(2 * math.pi * t / 1.9 + 0.5)),
    "mano_der": dict(poly=[(774, 205), (780, 172), (790, 163), (798, 168), (798, 218), (779, 220)],
                     pivot=(790, 232), rot=lambda t: -5.0 * math.sin(2 * math.pi * t / 1.7)),
}
HEADS = {"socrates": (484, 205), "criton": (585, 288)}


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def cam_x(t):
    """Centro de la ventana en x (coordenadas del cuadro): de Platón a Sócrates."""
    if t < PAN_END:
        return 230 + (488 - 230) * ease(t / PAN_END)
    return 488 + 10 * (t - PAN_END) / (DUR - PAN_END)


def main():
    img = cv2.imread(SRC)
    canvas = cv2.resize(img, (int(img.shape[1] * S), int(img.shape[0] * S)), interpolation=cv2.INTER_LANCZOS4)
    canvas = cv2.addWeighted(canvas, 1.35, cv2.GaussianBlur(canvas, (0, 0), 2.0), -0.35, 0)  # nitidez
    ch, cw = canvas.shape[:2]
    masks, union = {}, np.zeros((ch, cw), np.uint8)
    for k, p in PARTS.items():
        m = np.zeros((ch, cw), np.uint8)
        cv2.fillPoly(m, [np.int32(np.array(p["poly"]) * S)], 255)
        union |= cv2.dilate(m, np.ones((15, 15), np.uint8))
        masks[k] = cv2.GaussianBlur(m, (0, 0), 3.5).astype(np.float32) / 255
    base = cv2.inpaint(canvas, union, 9, cv2.INPAINT_TELEA)
    src = canvas.astype(np.float32)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                             "-r", str(FPS), "-i", "-", "-vf", f"{GRADE},format=yuv420p", "-c:v", "libx264",
                             "-preset", "slow", "-crf", "16", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        t = i / FPS
        x0 = int(round(cam_x(t) * S - W / 2))
        x0 = max(0, min(cw - W, x0))
        frame = base[OY:OY + H, x0:x0 + W].astype(np.float32)
        for k, p in PARTS.items():
            px, py = p["pivot"][0] * S - x0, p["pivot"][1] * S - OY
            ang = p["rot"](t) if "rot" in p else 0.0
            dy = (p["dy"](t) if "dy" in p else 0.0) * S
            M = cv2.getRotationMatrix2D((px, py), ang, 1.0)
            M[1, 2] += dy
            part = cv2.warpAffine(src[OY:OY + H, x0:x0 + W], M, (W, H), flags=cv2.INTER_LINEAR,
                                  borderMode=cv2.BORDER_REFLECT)
            a = cv2.warpAffine(masks[k][OY:OY + H, x0:x0 + W], M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
            frame = frame * (1 - a) + part * a
        # Lámpara: titila el brillo de la llama.
        fx, fy = int(312 * S - x0), int(137 * S - OY)
        if 0 <= fx < W:
            g = 1 + 0.12 * math.sin(t * 23) + 0.08 * math.sin(t * 37)
            y0, y1, xa, xb = max(0, fy - 40), fy + 40, max(0, fx - 40), min(W, fx + 40)
            frame[y0:y1, xa:xb] *= g
        proc.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    proc.stdin.close()
    proc.wait()
    x0 = cam_x(DUR) * S - W / 2
    heads = {k: [round(v[0] * S - x0), round(v[1] * S - OY)] for k, v in HEADS.items()}
    json.dump({"dur": DUR, "panEnd": PAN_END, "heads": heads}, open(f"{ROOT}/src/nia/socrates.json", "w"), indent=1)
    print("listo", OUT, heads)


if __name__ == "__main__":
    main()
