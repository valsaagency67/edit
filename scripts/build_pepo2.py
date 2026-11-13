#!/usr/bin/env python3
"""Video del IVA a la canasta familiar en la «ley de rescate» de Abelardo de la Espriella (carpeta de Drive
«Pepo 2»). Estilo de los videos de Óscar Benavides (media/ref/referencia-6.mp4): gancho en blanco y negro, color
claro y vivo, subtítulos blancos sin resaltar, cara de Abelardo recortada y animaciones sencillas (`stickers`),
con muy pocos efectos. Reusa las funciones de scripts/build_pepo3.py cambiando su configuración y carpetas.

- Voz: DPDFNet + cadena de Pepo1, a 1.07x y sin pausas (monólogo, regla «que hable de seguido»); saturada
  mientras la imagen está en blanco y negro (saturar()).
- Música propia (media/pepo2/musica.wav, se arma aquí): tensa y moderna, Re menor a 92 bpm. Contrabajo en
  corcheas, chelo largo y una nota aguda de piano cada dos compases; muestras reales tonejs-instruments
  (CC-BY 3.0, media/samples/, `npm pack tonejs-instrument-<inst>-mp3`). Va continua, ~11 dB bajo la voz.
Salida de la línea de tiempo: src/campaign/pepo2.json.

Uso: python3 scripts/build_pepo2.py
"""
import json
import os
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import build_pepo3 as b3  # noqa: E402
import make_music as mm  # noqa: E402
from build_pepo import DENOISE, VOZ, zooms  # noqa: E402
from tomas import SR, Proyecto, write_wav  # noqa: E402

b3.CFG = json.load(open(f"{ROOT}/scripts/pepo2.config.json", encoding="utf-8"))
b3.OUT = f"{ROOT}/public/pepo2"
b3.TMP = f"{ROOT}/out/pepo2/tmp"
b3.MEDIA = f"{ROOT}/media/pepo2"


def ventanas(data, key):
    """Ventanas (inicio, fin) de `stickers` o `abelardo` de la config, ancladas a palabras de cada escena."""
    by = {s["key"]: s for s in data["scenes"]}
    out = []
    for w in b3.CFG.get(key, []):
        sc = by[w["scene"]]
        a = b3.word_at(sc, w["at"])
        z = sc["end"] if w.get("untilEnd") else b3.word_at(sc, w["until"], a + 0.01)
        out.append({k: v for k, v in w.items() if k not in ("at", "until", "untilEnd")} | {"start": round(a, 3),
                                                                                        "end": round(z, 3)})
    return out


def fotos():
    """Fotos de apoyo (CFG["fotos"]) a 1080x1920: a lo ancho (alto máximo 1000, centradas en y=760) sobre una copia
    suya desenfocada y oscurecida. Las cajas `pixel` se difuminan (la cara de la niña: menor de edad)."""
    from PIL import Image, ImageEnhance, ImageFilter
    os.makedirs(f"{b3.OUT}/fotos", exist_ok=True)
    W, H, CY, MAXH = 1080, 1920, 760, 1000
    for name, f in b3.CFG.get("fotos", {}).items():
        if name.startswith("_"):
            continue
        im = Image.open(f"{b3.MEDIA}/fotos/{f['file']}").convert("RGB")
        for x0, y0, x1, y1 in f.get("pixel", []):
            im.paste(im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(14)), (x0, y0))
        s = max(W / im.width, H / im.height)
        bg = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
        bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(45))).enhance(0.45)
        s = min(W / im.width, MAXH / im.height)
        fg = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        bg.paste(fg, ((W - fg.width) // 2, CY - fg.height // 2))
        bg.save(f"{b3.OUT}/fotos/{name}.jpg", quality=92)


def recorte_abelardo():
    """Cara de Abelardo recortada (rembg u2net_human_seg) desde media/pepo2/abelardo.* (la manda el cliente) a
    public/pepo2/fotos/abelardo.png. Devuelve False si todavía no hay foto."""
    import glob
    import subprocess
    src = sorted(glob.glob(f"{b3.MEDIA}/abelardo.*"))
    if not src:
        print("abelardo: falta la foto (media/pepo2/abelardo.*)")
        return False
    os.makedirs(f"{b3.OUT}/fotos", exist_ok=True)
    code = ("import sys;from PIL import Image;from rembg import new_session,remove;"
            "im=Image.open(sys.argv[1]).convert('RGB');"
            "o=remove(im,session=new_session('u2net_human_seg'));o=o.crop(o.getbbox());"
            "o.crop((0,0,o.width,int(o.height*0.72))).save(sys.argv[2])")
    subprocess.run([sys.executable, "-c", code, src[0], f"{b3.OUT}/fotos/abelardo.png"], check=True,
                   env={**os.environ, "U2NET_HOME": f"{ROOT}/whisper-models/u2net"})
    return True


def saturar(data):
    """Voz saturada mientras la imagen está en blanco y negro (el gancho; lo pidió el cliente), como el «distort»
    del Fondo Milagro pero más de saturación que de radio: se empuja la voz contra un recorte suave, con una
    banda de 200–5000 Hz. Mismo nivel RMS y fundidos de 30 ms para que el cambio no truene."""
    import subprocess
    from tomas import read_wav
    voz = read_wav(f"{b3.OUT}/voz.wav")
    for sc in data["scenes"]:
        for fx in sc.get("effects", []):
            if not fx.get("gray"):
                continue
            a, b = int(fx["start"] * SR), int(fx["end"] * SR)
            seg = voz[a:b]
            src, dst = f"{b3.TMP}/saturar-in.wav", f"{b3.TMP}/saturar-out.wav"
            write_wav(src, seg)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
                            "highpass=f=200,lowpass=f=5000,volume=14dB,asoftclip=type=tanh:param=1,"
                            "acrusher=bits=10:mix=0.25:mode=log:aa=1,highpass=f=180,lowpass=f=5500",
                            "-ar", str(SR), "-ac", "1", dst], check=True)
            out = read_wav(dst)[:len(seg)]
            out = out * np.sqrt(np.mean(seg ** 2)) / max(1e-9, np.sqrt(np.mean(out ** 2)))
            f = int(0.03 * SR)
            mix = np.ones(len(seg))
            mix[:f], mix[-f:] = np.linspace(0, 1, f), np.linspace(1, 0, f)
            voz[a:b] = seg * (1 - mix) + out * mix
    write_wav(f"{b3.OUT}/voz.wav", voz)


def componer(total):
    """Re menor a 92 bpm (i - VI - III - VII: Rem - Sib - Fa - Do), compases de 4 tiempos."""
    beat = 60 / 92
    bar = 4 * beat
    buf = np.zeros(int((total + 4) * SR))
    prog = [("D2", ["D3", "A3"], "A5"), ("As1", ["As2", "F3"], "F5"), ("F1", ["F2", "C3"], "A5"),
            ("C2", ["C3", "G3"], "G5")]
    t, k = 0.0, 0
    while t < total + 2:
        bass, cello, ping = prog[k % 4]
        grow = 0.75 + 0.4 * min(1, t / total)
        for e in range(8):  # contrabajo en corcheas, acento en el 1 y el 3
            mm.place(buf, mm.note("contrabass", bass, beat * 0.45, (0.3 if e % 4 == 0 else 0.18) * grow,
                                  release=0.08), t + e * beat / 2)
        for n in cello:
            mm.place(buf, mm.note("cello", n, bar + 0.6, 0.11 * grow, attack=0.4, release=0.9), t)
        if k % 2 == 1:
            mm.place(buf, mm.note("piano", ping, 2.4, 0.08 * grow, release=1.2), t + 2 * beat)
        t += bar
        k += 1
    buf = mm.reverb(buf, 2.6, 0.3)
    end = int((total + 0.6) * SR)
    fade = int(2.0 * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    os.makedirs(b3.MEDIA, exist_ok=True)
    write_wav(f"{b3.MEDIA}/musica.wav", buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)


if __name__ == "__main__":
    path = f"{ROOT}/src/campaign/pepo2.json"
    d = Proyecto(b3.CFG, f"{ROOT}/media/pepo2", ".MOV", b3.OUT, b3.TMP, b3.CFG.get("grade", b3.GRADE), voice=VOZ,
                 denoise=DENOISE).build(path)
    d["zooms"] = zooms(d)
    d["big"] = b3.bigs(d)
    b3.mattes(d)
    b3.heads(d)
    for sc in d["scenes"]:  # el blanco y negro del gancho arranca en el primer cuadro, no en la primera palabra
        for e in sc["effects"]:
            if e.get("gray") and e["start"] - sc["start"] < 0.5:
                e["start"] = sc["start"]
    d["stickers"] = ventanas(d, "stickers")
    d["abelardo"] = ventanas(d, "abelardo") if recorte_abelardo() else []
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=1)
    saturar(d)
    fotos()
    componer(d["duration"])
    b3.musica(d)
    b3.foley(d)
    print("listo:", d["duration"], "s")
