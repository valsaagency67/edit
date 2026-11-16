"""Arma el montaje de entrevistas de Huroban Sabores Sorprendentes.

Corta los clips originales (quitando pausas), los une en un solo video vertical
1080x1920 y genera los subtítulos palabra por palabra con los tiempos ya
reubicados en el montaje.

Uso:  python3 avanzares/build.py
Salida: public/avanzares/montaje.mp4, public/avanzares/captions.json,
        public/avanzares/meta.json
"""

import json
import sys
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "media" / "raw"
OUT = ROOT / "public" / "avanzares"
FPS = 30

# (clip, inicio, fin) en segundos del archivo original, en orden de aparición.
RANGES = [
    # Solo la intro lleva la pregunta; en cada entrevista se corta la pregunta
    # y queda únicamente la respuesta.
    ("IMG_0309", 0.00, 5.45),   # Intro: "Vamos a preguntarle a algunos clientes..."
    ("IMG_0312", 4.42, 22.70),  # Chico de camiseta amarilla + Cristian
    ("IMG_0314", 6.15, 14.25),  # Valentina
    ("IMG_0319", 4.92, 14.45),  # Chico de gorra
    ("IMG_0319", 16.65, 18.45), # "Eso es todo, muchas gracias"
    # Último clip: completo (sin recortar pausas), solo se quita la pregunta.
    ("IMG_0321", 4.54, 22.00, "completo"),  # Pareja: crema de whisky
]

# Etiquetas con nombre (clip, segundo original en que aparecen, texto).
NAME_TAGS = [
    ("IMG_0312", 12.40, "Cristian"),
    ("IMG_0314", 6.20, "Valentina"),
]

# Correcciones de la transcripción automática.
REPLACE = {
    "Arequipé": "arequipe",
    "Maracuyá,": "maracuyá,",
    "Uroban,": "Huroban,",
    "sabores": "Sabores",
    "comparamos,": "compramos,",
    "sorprendentes.": "Sorprendentes.",
    "palmas.": "Palmas.",
}
DROP_WORDS: set[tuple[str, str]] = set()

# Tiempos corregidos a mano (whisper los ubicó antes de tiempo, encima del final
# de la pregunta). Clave: (clip, palabra); valor: (inicio, fin) en el original.
WORD_TIME_FIX = {
    ("IMG_0319", "La"): (4.96, 5.06),
    ("IMG_0319", "verdad,"): (5.06, 5.28),
}

KEYWORDS = {
    "sabores", "sorprendentes", "huroban", "arequipe", "maracuyá", "crema",
    "whisky", "café", "100%", "delicioso", "increíble", "sabrosos",
}

MIN_PAUSE = 0.40  # pausas más largas que esto se cortan
KEEP_MARGIN = 0.08


def pauses(clip: str) -> list[tuple[float, float]]:
    """Tramos de baja energía (pausas) del audio del clip."""
    wav = OUT.parent.parent / "media" / "wav" / f"{clip}.wav"
    if not wav.exists():
        wav.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW / f"{clip}.MOV",
                        "-ac", "1", "-ar", "16000", wav], check=True)
    w = wave.open(str(wav))
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    hop = 800  # 50 ms
    n = len(a) // hop
    db = 20 * np.log10(np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    low = db < np.percentile(db, 90) - 18
    runs, i = [], 0
    while i < n:
        if low[i]:
            j = i
            while j < n and low[j]:
                j += 1
            if (j - i) * 0.05 >= MIN_PAUSE:
                runs.append((i * 0.05, j * 0.05))
            i = j
        else:
            i += 1
    return runs


def build_segments():
    segs = []
    for clip, s, e, *flags in RANGES:
        cur = s
        for ps, pe in ([] if "completo" in flags else pauses(clip)):
            if ps > s and pe < e:
                cut_s, cut_e = ps + KEEP_MARGIN, pe - KEEP_MARGIN
                if cut_s > cur:
                    segs.append([clip, cur, cut_s])
                cur = cut_e
        segs.append([clip, cur, e])
    # Ajusta a cuadros exactos y calcula la posición en el montaje.
    t = 0
    out = []
    for clip, s, e in segs:
        frames = round((e - s) * FPS)
        if frames < 6:
            continue
        out.append({"clip": clip, "srcStart": s, "srcEnd": s + frames / FPS,
                    "outStart": t / FPS, "frames": frames, "outFrame": t})
        t += frames
    return out, t


def map_time(segs, clip, src_t):
    for sg in segs:
        if sg["clip"] == clip and src_t < sg["srcEnd"]:
            if src_t < sg["srcStart"]:
                if src_t < sg["srcStart"] - 0.08:
                    return None  # palabra que quedó en un tramo cortado
                src_t = sg["srcStart"]
            return sg["outStart"] + (src_t - sg["srcStart"])
    return None


def build_captions(segs):
    words = json.loads((ROOT / "avanzares" / "transcripcion_whisper.json").read_text())
    caps = []
    for clip, ws in words.items():
        merged = []
        for w in ws:
            txt = w["text"].strip()
            if txt == "%" and merged:
                merged[-1]["text"] += "%"
                merged[-1]["end"] = w["end"]
                continue
            merged.append({**w, "text": txt})
        for w in merged:
            if (clip, w["text"]) in DROP_WORDS:
                continue
            fix = WORD_TIME_FIX.get((clip, w["text"]))
            if fix and abs(fix[0] - w["start"]) < 0.6:
                w = {**w, "start": fix[0], "end": fix[1]}
            ts = map_time(segs, clip, w["start"])
            te = map_time(segs, clip, w["end"] - 0.01)
            if ts is None:
                continue
            if te is None or te < ts:
                te = ts + 0.25
            txt = REPLACE.get(w["text"], w["text"])
            key = txt.lower().strip(",.¿?¡!")
            caps.append({
                "text": " " + txt,
                "startMs": round(ts * 1000),
                "endMs": round(te * 1000),
                "timestampMs": None,
                "confidence": w["p"],
                "keyword": key in KEYWORDS,
            })
    caps.sort(key=lambda c: c["startMs"])
    # Evita solapes.
    for a, b in zip(caps, caps[1:]):
        a["endMs"] = min(a["endMs"], b["startMs"])
    return caps


def render(segs):
    """Corta cada segmento por separado (poca memoria) y luego los une."""
    tmp = ROOT / "media" / "segs"
    tmp.mkdir(parents=True, exist_ok=True)
    lst = []
    for i, s in enumerate(segs):
        d = s["frames"] / FPS
        f = tmp / f"seg{i:02d}.mov"
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-threads", "2",
            "-ss", f"{s['srcStart']:.4f}", "-i", str(RAW / f"{s['clip']}.MOV"),
            "-t", f"{d:.4f}", "-map", "0:v:0", "-map", "0:a:0",
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
                   f"crop=1080:1920,fps={FPS},format=yuv420p,setsar=1",
            "-frames:v", str(s["frames"]),
            "-af", f"aformat=sample_rates=48000:channel_layouts=stereo,"
                   f"afade=t=in:d=0.015,afade=t=out:st={d - 0.015:.4f}:d=0.015,apad",
            "-c:v", "libx264", "-preset", "medium", "-crf", "10", "-x264-params", "threads=2",
            "-c:a", "pcm_s16le", "-shortest", str(f)], check=True)
        lst.append(f"file '{f}'")
        print(f"  segmento {i + 1}/{len(segs)} listo", flush=True)
    (tmp / "list.txt").write_text("\n".join(lst) + "\n")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"),
        "-af", "highpass=f=90,loudnorm=I=-15:TP=-1.5:LRA=9",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
        "-movflags", "+faststart", str(OUT / "montaje.mp4")], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    segs, total = build_segments()
    for s in segs:
        print(f"{s['clip']} {s['srcStart']:6.2f}-{s['srcEnd']:6.2f}  -> {s['outStart']:6.2f}")
    print(f"Duración del montaje: {total / FPS:.2f} s")
    caps = build_captions(segs)
    (OUT / "captions.json").write_text(json.dumps(caps, ensure_ascii=False, indent=1))
    tags = [{"text": t, "fromFrame": round(map_time(segs, c, st) * FPS)} for c, st, t in NAME_TAGS]
    cuts = [s["outFrame"] for s in segs]
    (OUT / "meta.json").write_text(json.dumps(
        {"fps": FPS, "frames": total, "cuts": cuts,
         "clips": [s["clip"] for s in segs], "nameTags": tags}, indent=1))
    if "--solo-subs" not in sys.argv:
        render(segs)


if __name__ == "__main__":
    main()
