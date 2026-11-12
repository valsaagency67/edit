#!/usr/bin/env python3
"""Video «cinematográfico» de Juan Felipe (carpeta de Drive «Pepo 3»): caso dramatizado de una clienta a la que le
vaciaron la tarjeta de crédito y cómo reclamarle al banco. Estilo del video de referencia que mandó el cliente
(media/ref/referencia-4.mp4).

- Escenas, voz y tomas: scripts/tomas.py, con la limpieza DPDFNet y la cadena de voz de Pepo1 (build_pepo.VOZ).
  De cada toma se quita el «ya / listo / ¿ya? sí» del inicio (`from` en la config).
- Color: SIN cambios (lo pidió el cliente). De corrido, como entrevista real: voz a velocidad normal y solo se
  quitan las pausas largas.
- Cuando habla ella (`woman`): el riser de la referencia como suspenso, solo la primera y la última vez
  (`which`). La música va continua y más fuerte (`musicLUFS`, -25); `duckWoman` la bajaría mientras habla ella
  (el cliente lo pidió al principio y después la quiso continua).
- Palabras grandes (`big`): delante de Juan Felipe, o detrás (layer behind). Para las de detrás se recorta a la
  persona cuadro a cuadro con rembg (u2net_human_seg) y se guarda en public/pepo3/matte/<escena>/<n>.png, donde
  n es el cuadro de public/pepo3/<escena>.mp4; Pepo3.tsx pone la palabra y encima el recorte.
- Efectos (`sfx`): los del video de referencia (public/sfx/ref2-*.wav, scripts/extract_sfx_ref4.py): riser al
  inicio, clic en «paso 1 / paso 2», impacto en los datos clave, obturador en dos cambios de toma, y el «转场 10»
  en uno de cada dos zooms.
- Música: el audio del video que mandó el cliente (media/ref/referencia-5.mp4 -> media/pepo3/musica.m4a, sin el
  cierre de TikTok); si falta, public/pepo3/musica.wav va en silencio.
Salida de la línea de tiempo: src/campaign/pepo3.json.

Uso: python3 scripts/build_pepo3.py
"""
import glob
import json
import os
import subprocess
import sys
import unicodedata

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import make_foley as mf  # noqa: E402
from build_pepo import DENOISE, VOZ, zooms  # noqa: E402
from tomas import SR, Proyecto, read_wav, write_wav  # noqa: E402

CFG = json.load(open(f"{ROOT}/scripts/pepo3.config.json", encoding="utf-8"))
OUT = f"{ROOT}/public/pepo3"
TMP = f"{ROOT}/out/pepo3/tmp"
MEDIA = f"{ROOT}/media/pepo3"  # build_pepo2.py cambia CFG, OUT, TMP y MEDIA y reusa estas funciones
# El cliente no quiere que se le cambie el color: la imagen va tal como viene («null» no toca nada). La gradación
# de cine que se probó primero queda aquí por si la pide para otro video.
GRADE = "null"
GRADE_CINE = ("eq=contrast=1.12:saturation=1.12:gamma=1.06,curves=master='0/0.01 0.25/0.22 0.7/0.76 1/0.98',"
              "colorbalance=rs=-0.04:bs=0.05:rm=0.02:bm=-0.02:rh=0.06:gh=0.015:bh=-0.06,"
              "vignette=angle=PI/5.5,noise=alls=4:allf=t")


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return "".join(c for c in w if c.isalnum() and unicodedata.category(c) != "Mn")


def word_at(sc, word, after=0.0, nth=1):
    """Inicio (s) de la palabra `word` en la escena, desde `after`."""
    hits = [w for w in sc["words"] if norm(w["t"]) == norm(word) and w["s"] >= after - 1e-6]
    if len(hits) < nth:
        raise SystemExit(f"{sc['key']}: no encuentro «{word}»")
    return hits[nth - 1]["s"]


def bigs(data):
    """Palabras grandes con su inicio y fin (s): desde `at` hasta `until` (o hasta el fin de la escena)."""
    by = {s["key"]: s for s in data["scenes"]}
    out = []
    for b in CFG["big"]:
        sc = by[b["scene"]]
        start = word_at(sc, b["at"])
        end = sc["end"] if b.get("untilEnd") else word_at(sc, b["until"], start + 0.01)
        shot = sc["shots"][0]
        out.append({k: v for k, v in b.items() if k not in ("at", "until", "untilEnd")} |
                   {"start": round(start, 3), "end": round(end, 3), "shotStart": shot["start"], "src": shot["src"]})
    return out


def mattes(data):
    """Recorte de la persona para cada palabra de detrás: los cuadros de la toma ya cortada y graduada, con la
    máscara de u2net_human_seg (a media resolución, en procesos aparte)."""
    fps = data["fps"]
    jobs = []
    for b in data["big"]:
        if b["layer"] != "behind":
            continue
        a = round((b["start"] - b["shotStart"]) * fps) - 6
        z = round((b["end"] - b["shotStart"]) * fps) + 6
        d = f"{OUT}/matte/{b['src']}"
        os.makedirs(d, exist_ok=True)
        todo = [n for n in range(max(0, a), z) if not os.path.exists(f"{d}/{n}.png")]
        if not todo:
            continue
        frames = f"{TMP}/frames-{b['src']}"
        os.makedirs(frames, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/{b['src']}.mp4", "-vf",
                        f"select='between(n\\,{todo[0]}\\,{todo[-1]})'", "-vsync", "0", "-start_number",
                        str(todo[0]), f"{frames}/%d.png"], check=True)
        jobs += [(f"{frames}/{n}.png", f"{d}/{n}.png") for n in todo]
    if not jobs:
        return
    code = ("import sys,json;from PIL import Image;from rembg import new_session,remove;"
            "s=new_session('u2net_human_seg');"
            "[(lambda im:(lambda m:(im.putalpha(m),im.save(o)))(remove(im.convert('RGB').resize((im.width//2,im.height//2),Image.LANCZOS),"
            "session=s,only_mask=True).resize(im.size,Image.LANCZOS)))(Image.open(i).convert('RGBA')) for i,o in json.loads(sys.argv[1])]")
    jobs = list(dict(jobs).items())  # dos palabras de la misma escena piden los mismos cuadros
    # Por tandas en procesos aparte, para no acumular memoria.
    for i in range(0, len(jobs), 40):
        subprocess.run([sys.executable, "-c", code, json.dumps(jobs[i:i + 40])], check=True,
                       env={**os.environ, "U2NET_HOME": f"{ROOT}/whisper-models/u2net", "OMP_NUM_THREADS": "4"})
    print("recortes:", len(jobs))


def woman(data):
    """Tramos (s) en que habla ella: escenas enteras o hasta la palabra `until`."""
    by = {s["key"]: s for s in data["scenes"]}
    out = []
    for w in CFG.get("woman", []):
        sc = by[w["scene"]]
        out.append((sc["start"], word_at(sc, w["until"]) - 0.1 if "until" in w else sc["end"]))
    return out


def heads(data):
    """Altura de la cabeza para cada palabra de detrás: la primera fila (bajo la firma, y > 320) del recorte del
    cuadro del medio con al menos 25 píxeles de persona. Pepo3.tsx centra la palabra un poco más abajo, para que la
    cabeza tape el centro de las letras (con una altura fija la palabra quedaba encima de la cabeza)."""
    from PIL import Image
    fps = data["fps"]
    for b in data["big"]:
        if b["layer"] != "behind":
            continue
        n = round(((b["start"] + b["end"]) / 2 - b["shotStart"]) * fps)
        a = np.asarray(Image.open(f"{OUT}/matte/{b['src']}/{n}.png").getchannel("A")) > 128
        top = CFG.get("headSearchFrom", 320)
        rows = np.nonzero(a[top:].sum(1) >= 25)[0]
        b["headTop"] = int(rows[0] + top) if len(rows) else 620
        # Base de las letras 60 px bajo el inicio de la cabeza, pero sin bajar de `behindMaxBaseline` (Pepo 2:
        # la cabeza está tan arriba que la palabra chocaba con la firma de y=300).
        b["baseline"] = min(b["headTop"] + 60, CFG.get("behindMaxBaseline", 10000))


def musica(data):
    """La música la manda el cliente: el primer archivo de audio en media/pepo3/musica.* va ~17 dB bajo la voz
    (-33 LUFS), con fundido al final; mientras habla ella baja 14 dB más (rampas de 0.35 s) y vuelve con él.
    Mientras no esté, silencio."""
    total = data["duration"]
    src = sorted(glob.glob(f"{MEDIA}/musica.*"))
    if not src:
        write_wav(f"{OUT}/musica.wav", np.zeros((int((total + 1) * SR), 2)), 2)
        print("música: falta (silencio)")
        return
    fade = max(0.0, total - 2.0)
    tmp = f"{TMP}/musica-norm.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src[0], "-t", f"{total + 0.5:.2f}", "-af",
                    f"loudnorm=I={CFG.get('musicLUFS', -33)}:TP=-6:LRA=11,afade=t=out:st={fade:.2f}:d=2", "-ar",
                    str(SR), "-ac", "2", tmp], check=True)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", tmp, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
    t = np.arange(len(m)) / SR
    db = np.zeros(len(m))
    for a, b in (woman(data) if CFG.get("duckWoman", True) and CFG.get("woman") else []):
        db = np.minimum(db, np.interp(t, [a - 0.35, a, b, b + 0.35], [0, -14, -14, 0], left=0, right=0))
    write_wav(f"{OUT}/musica.wav", m * (10 ** (db / 20))[:, None], 2)


def foley(data):
    """Efectos del video de referencia en los momentos de la config, y el «转场 10» en uno de cada dos zooms."""
    buf = np.zeros((int((data["duration"] + 3) * SR), 2))
    by = {s["key"]: s for s in data["scenes"]}

    def put(name, t, gain):
        x = read_wav(f"{ROOT}/public/sfx/ref2-{name}.wav")
        mf.place(buf, np.stack([x, x], 1) * gain, max(0.0, t))

    for e in CFG["sfx"]:
        if e.get("at") is not None and "scene" not in e and "sceneStart" not in e and not e.get("womanStart"):
            put(e["name"], e["at"], e["gain"])
            continue
        if e.get("womanStart"):  # suspenso cada vez que empieza a hablar ella
            ws = woman(data)
            for k in e.get("which", range(len(ws))):  # p. ej. [0, -1]: solo la primera y la última vez
                put(e["name"], max(0.0, ws[k][0] - 0.2), e["gain"])
            continue
        if "sceneStart" in e:
            t = by[e["sceneStart"]]["start"] - 0.05
        elif "scene" in e:
            t = word_at(by[e["scene"]], e["word"]) - 0.04
        else:
            t = e["at"]
        put(e["name"], t, e["gain"])
    for k, (t, _) in enumerate(data["zooms"]):
        if k % 2 == 1:
            put("transicion", t - 0.25, 0.4)
    if "outro" in data:
        put("click", data["outro"]["start"], 0.6)
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    path = f"{ROOT}/src/campaign/pepo3.json"
    d = Proyecto(CFG, f"{ROOT}/media/pepo3", ".MOV", OUT, TMP, GRADE, voice=VOZ, denoise=DENOISE).build(path)
    d["zooms"] = zooms(d)
    d["big"] = bigs(d)
    mattes(d)
    heads(d)
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=1)
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
