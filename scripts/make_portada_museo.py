#!/usr/bin/env python3
"""Imágenes de la portada del video del Museo (src/campaign/CoverMuseo.tsx), pedida «referente al museo,
con colores vivos, muy libertaria»:

- public/cover/museo-jf.png: Juan Felipe recortado (rembg, birefnet-portrait) del final de IMG_3993, cuando
  queda serio mirando a cámara; sin el póster ni la silla del fondo.
- public/jf3/fotos/museo-expo.jpg: el panel central de la foto de la exposición que mandó el cliente
  (bandera arcoíris y afiches), en vertical y con color más vivo. No se versiona (foto de prensa).

Uso: python3 scripts/make_portada_museo.py <foto-de-la-exposicion> (la .avif que mandó el cliente)
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = f"{ROOT}/out/jf3/tmp"
MODEL = f"{ROOT}/whisper-models/u2net/models/birefnet-portrait"


def recorte():
    frame, mask = f"{TMP}/portada-jf.png", f"{TMP}/portada-jf-mask.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.1", "-i", f"{ROOT}/media/jf3/IMG_3993.MOV",
                    "-update", "1", "-frames:v", "1", "-vf", "eq=contrast=1.05:saturation=1.08", frame], check=True)
    # Máscara a media resolución en un proceso aparte (como en make_perfil.py).
    code = ("import sys;from PIL import Image;from rembg import new_session,remove;"
            "im=Image.open(sys.argv[1]).convert('RGB');s=im.resize((im.width//2,im.height//2),Image.LANCZOS);"
            "remove(s,session=new_session('birefnet-portrait'),only_mask=True)"
            ".resize(im.size,Image.LANCZOS).save(sys.argv[2])")
    subprocess.run([sys.executable, "-c", code, frame, mask], check=True, env={**os.environ, "U2NET_HOME": MODEL})
    rgba = Image.open(frame).convert("RGB")
    rgba.putalpha(Image.open(mask).convert("L"))
    rgba.crop(rgba.getbbox()).save(f"{ROOT}/public/cover/museo-jf.png")


def fondo(src):
    """Panel central de la foto (los tres paneles van lado a lado), 1080x1920, color vivo."""
    tmp = f"{TMP}/portada-expo.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, tmp], check=True)
    im = Image.open(tmp).convert("RGB")
    w, h = im.size
    panel = im.crop((int(w * 0.365), 0, int(w * 0.74), h))
    pw, ph = panel.size
    s = 1920 / ph
    panel = panel.resize((round(pw * s), 1920), Image.LANCZOS)
    x = (panel.width - 1080) // 2
    panel.crop((x, 0, x + 1080, 1920)).save(tmp)
    os.makedirs(f"{ROOT}/public/jf3/fotos", exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-vf",
                    "vibrance=intensity=0.35,eq=saturation=1.25:contrast=1.08,unsharp=5:5:0.5",
                    "-q:v", "2", f"{ROOT}/public/jf3/fotos/museo-expo.jpg"], check=True)


if __name__ == "__main__":
    os.makedirs(TMP, exist_ok=True)
    recorte()
    fondo(sys.argv[1])
    print("listo")
