"""Foto de perfil: recorte del pantallazo, mejora (Real-ESRGAN x4 + GFPGAN 1.4 en la cara),
quitar fondo (rembg BiRefNet) y fondo rojo con negro."""
import os
import sys

import cv2
import numpy as np
import torch
from PIL import Image, ImageFilter
from spandrel import ModelLoader

D = os.path.dirname(os.path.abspath(__file__))
SRC = "/root/.claude/uploads/d889b5d6-5b99-59a9-acf6-3122ec50f13a/c594763f-image.jpg"
BOX = (170, 830, 910, 1570)  # cuadro del círculo en el pantallazo
torch.set_num_threads(os.cpu_count())


def tiles(model, img, scale, tile=256, pad=16):
    """Inferencia por bloques (img float32 HxWx3 0..1)."""
    h, w = img.shape[:2]
    out = np.zeros((h * scale, w * scale, 3), np.float32)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            t = torch.from_numpy(img[y0:y1, x0:x1].transpose(2, 0, 1))[None]
            with torch.no_grad():
                r = model(t)[0].numpy().transpose(1, 2, 0)
            yy, xx = (y - y0) * scale, (x - x0) * scale
            hh, ww = min(tile, h - y) * scale, min(tile, w - x) * scale
            out[y * scale:y * scale + hh, x * scale:x * scale + ww] = r[yy:yy + hh, xx:xx + ww]
    return np.clip(out, 0, 1)


def main():
    crop = Image.open(SRC).convert("RGB").crop(BOX)
    src = np.asarray(crop).astype(np.float32) / 255
    up_path = f"{D}/up.png"
    if not os.path.exists(up_path):
        esr = ModelLoader().load_from_file(f"{D}/models/RealESRGAN_x4plus.pth").model.eval()
        up = tiles(esr, src, 4)
        Image.fromarray((up * 255).round().astype(np.uint8)).save(up_path)
    up = np.asarray(Image.open(up_path)).astype(np.float32) / 255

    # Cara: alinear a la plantilla FFHQ 512 con 5 puntos marcados a mano (en el recorte x1), GFPGAN y pegar.
    pts = np.array([[343, 189], [401, 188], [371, 216], [350, 247], [393, 247]], np.float32) * 4
    tpl = np.array([[192.98, 239.95], [318.90, 240.19], [256.63, 314.02], [201.26, 371.41], [313.09, 371.15]],
                   np.float32)
    M, _ = cv2.estimateAffinePartial2D(pts, tpl, method=cv2.LMEDS)
    face = cv2.warpAffine(up, M, (512, 512), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    gfp = ModelLoader().load_from_file(f"{D}/models/GFPGANv1.4.pth").model.eval()
    t = torch.from_numpy((face * 2 - 1).transpose(2, 0, 1))[None].float()
    with torch.no_grad():
        r = gfp(t)
        r = r[0] if isinstance(r, (tuple, list)) else r
    rf = np.clip((r[0].numpy().transpose(1, 2, 0) + 1) / 2, 0, 1)
    w = float(sys.argv[1]) if len(sys.argv) > 1 else 0.6  # mezcla con la cara de Real-ESRGAN (identidad)
    rf = face * (1 - w) + rf * w
    Minv = cv2.invertAffineTransform(M)
    H, W = up.shape[:2]
    back = cv2.warpAffine(rf, Minv, (W, H), flags=cv2.INTER_CUBIC)
    m = np.zeros((512, 512), np.float32)
    cv2.ellipse(m, (256, 290), (190, 235), 0, 0, 360, 1, -1)
    m = cv2.GaussianBlur(m, (0, 0), 25)
    mb = cv2.warpAffine(m, Minv, (W, H))[..., None]
    up = up * (1 - mb) + back * mb
    Image.fromarray((up * 255).round().astype(np.uint8)).save(f"{D}/up_face.png")

    # Quitar fondo.
    from rembg import new_session, remove
    sess = new_session("birefnet-portrait")
    rgba = remove(Image.fromarray((up * 255).round().astype(np.uint8)), session=sess, post_process_mask=True)
    a = np.asarray(rgba)[..., 3].astype(np.float32) / 255
    # Solo dentro del círculo original (fuera está la interfaz de Instagram y el lápiz).
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy, R = 370 * 4, 370 * 4, 352 * 4
    a *= ((xx - cx) ** 2 + (yy - cy) ** 2 < R ** 2)
    # Quitar el halo rosado del fondo viejo en los bordes: estimación del color de primer plano.
    from pymatting import estimate_foreground_ml
    small = 0.5
    fg = estimate_foreground_ml(cv2.resize(up, None, fx=small, fy=small, interpolation=cv2.INTER_AREA).astype(np.float64),
                                cv2.resize(a, None, fx=small, fy=small, interpolation=cv2.INTER_AREA).astype(np.float64))
    fg = cv2.resize(fg.astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
    edge = ((a > 0.02) & (a < 0.98)).astype(np.float32)
    edge = cv2.GaussianBlur(cv2.dilate(edge, np.ones((9, 9))), (0, 0), 3)[..., None]
    fgc = up * (1 - edge) + fg * edge
    np.save(f"{D}/alpha.npy", a)
    Image.fromarray((np.clip(fgc, 0, 1) * 255).round().astype(np.uint8)).save(f"{D}/fg.png")
    print("listo", up.shape)


if __name__ == "__main__":
    main()
