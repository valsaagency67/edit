#!/usr/bin/env python3
"""Recortes de evidencia del derecho de petición para el video (src/campaign/Peticion.tsx).

Fuente: media/evidencia/derecho-peticion-correo.pdf (correo de Gmail impreso a PDF, 2 páginas:
el envío del 14 de septiembre a ventanillaunica@palmira.gov.co y la respuesta con el radicado).
Las coordenadas salen de `pdftotext -bbox-layout` (puntos PDF, 72 por pulgada).

Produce public/policia/evidencia-{1,2,3}.png y src/campaign/evidencia.json con el tamaño de cada
imagen y las cajas a resaltar (en píxeles de la imagen) para el resaltador animado.
Privacidad: se difuminan la cédula y el correo personal de Juan Felipe.

Uso: python3 scripts/make_evidencia.py
"""
import json
import os
import subprocess
import tempfile

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = f"{ROOT}/media/evidencia/derecho-peticion-correo.pdf"
OUT = f"{ROOT}/public/policia"
DPI = 300
K = DPI / 72  # píxeles por punto PDF
PAD = 1.5     # margen de las cajas, en puntos


def pages():
    tmp = tempfile.mkdtemp()
    subprocess.run(["pdftoppm", "-r", str(DPI), "-png", PDF, f"{tmp}/p"], check=True)
    out = [Image.open(f"{tmp}/{f}").convert("RGB") for f in sorted(os.listdir(tmp))]
    for f in os.listdir(tmp):
        os.remove(f"{tmp}/{f}")
    os.rmdir(tmp)
    return out


def px(box):
    x0, y0, x1, y1 = box
    return [round((x0 - PAD) * K), round((y0 - PAD) * K), round((x1 + PAD) * K), round((y1 + PAD) * K)]


def blur(img, box):
    """Difumina fuerte (pixelado + desenfoque) una caja en puntos PDF."""
    b = px(box)
    region = img.crop(b)
    w, h = region.size
    region = region.resize((max(1, w // 14), max(1, h // 14)), Image.BILINEAR).resize((w, h), Image.NEAREST)
    img.paste(region.filter(ImageFilter.GaussianBlur(6)), b[:2])


def crop(img, box, marks):
    """Recorta `box` (puntos) y pasa las cajas a resaltar a píxeles relativos al recorte."""
    b = [round(v * K) for v in box]
    out = img.crop(b)
    rel = [[m[0] - b[0], m[1] - b[1], m[2] - b[0], m[3] - b[1]] for m in (px(x) for x in marks)]
    return out, rel


def main():
    p1, p2 = pages()
    email1 = (163.4, 152.4, 332.1, 163.3)    # <juanfelipecastanomotoa@gmail.com> en el envío
    email2 = (172.2, 759.2, 340.9, 770.1)    # el mismo correo en "To:" de la respuesta
    cedula = (443.1, 384.6, 516.2, 397.7)    # cédula en el cuerpo (no entra en los recortes, por si acaso)
    cedula2 = (91.9, 657.6, 162.0, 670.7)    # cédula en la firma
    for b in (email1, email2, cedula, cedula2):
        blur(p1, b)

    items = []
    # 1. El envío: asunto, remitente, fecha (14 de septiembre) y destinatario (la Alcaldía).
    img, marks = crop(p1, (28, 86, 568, 208), [(446.8, 146.4, 561.7, 157.3), (546.0, 157.7, 561.7, 168.6),
                                                (34.0, 169.0, 187.0, 180.0), (43.0, 191.0, 231.0, 204.0)])
    items.append(("evidencia-1.png", img, marks))
    # 2. Lo que pidió: homicidios y violencia intrafamiliar en Palmira, 2024 y 2025.
    img, marks = crop(p1, (38, 436.6, 534, 481), [(168.2, 437.8, 505.0, 450.9), (43.0, 451.0, 529.0, 464.0),
                                                (43.0, 465.0, 71.0, 478.0)])
    items.append(("evidencia-2.png", img, marks))
    # 3. La respuesta: remitente y fecha arriba (página 1) + el radicado (página 2).
    top, m_top = crop(p1, (28, 744, 568, 773), [])
    body, m_body = crop(p2, (28, 25, 568, 76), [(443.5, 28.7, 545.0, 39.6), (43.5, 39.9, 105.9, 50.8)])
    gap = round(10 * K)
    img = Image.new("RGB", (top.width, top.height + gap + body.height), "white")
    img.paste(top, (0, 0))
    img.paste(body, (0, top.height + gap))
    marks = [[m[0], m[1] + top.height + gap, m[2], m[3] + top.height + gap] for m in m_body]
    items.append(("evidencia-3.png", img, marks))

    data = []
    for name, im, mk in items:
        im.save(f"{OUT}/{name}", optimize=True)
        data.append({"src": f"policia/{name}", "w": im.width, "h": im.height, "marks": mk})
        print(name, im.size, len(mk), "resaltados")
    json.dump(data, open(f"{ROOT}/src/campaign/evidencia.json", "w"), indent=1)


if __name__ == "__main__":
    main()
