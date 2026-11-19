"""Video promocional IMG_0563 (Huroban en el centro de Palmira).

Recorta el clip, limpia y sube el audio (grabado al aire libre, muy bajo) y
genera los subtítulos palabra por palabra.

Uso:  python3 avanzares/promo_build.py
Salida: public/avanzares/promo/{montaje.mp4, captions.json, meta.json}
Requiere: media/raw/IMG_0563.MOV y avanzares/promo_transcripcion.json
"""

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "media" / "raw" / "IMG_0563.MOV"
OUT = ROOT / "public" / "avanzares" / "promo"
FPS = 30

START, END = 0.62, 15.85  # justo antes de "Si estás..." hasta después de "perder."

KEYWORDS = {
    "palmira", "huroban", "sabores", "sorprendentes", "teatro", "materón",
    "hoy", "mañana", "probar", "perder",
}

# Momentos para los textos en pantalla (palabra que los dispara).
MARKERS = {
    "palmira": "Palmira,",
    "venir": "tienes",
    "teatro": "Teatro",
    "solo": "solamente",
    "hoy": "hoy",
    "perder": "así",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    words = json.loads((ROOT / "avanzares" / "promo_transcripcion.json").read_text())["IMG_0563"]
    frames = round((END - START) * FPS)
    caps, marks = [], {}
    for w in words:
        txt = w["text"].strip()
        s, e = w["start"] - START, w["end"] - START
        if e <= 0 or s >= END - START:
            continue
        caps.append({
            "text": " " + txt,
            "startMs": round(max(s, 0) * 1000),
            "endMs": round(e * 1000),
            "timestampMs": None,
            "confidence": w["p"],
            "keyword": txt.lower().strip(",.¿?¡!") in KEYWORDS,
        })
        for k, word in MARKERS.items():
            if txt == word and k not in marks:
                marks[k] = round(max(s, 0) * FPS)
    for a, b in zip(caps, caps[1:]):
        a["endMs"] = min(a["endMs"], b["startMs"])
    (OUT / "captions.json").write_text(json.dumps(caps, ensure_ascii=False, indent=1))
    (OUT / "meta.json").write_text(json.dumps({"fps": FPS, "frames": frames, "marks": marks}, indent=1))
    print(f"Duración: {frames / FPS:.2f} s, marcas: {marks}")

    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-ss", f"{START}", "-i", str(SRC),
        "-t", f"{frames / FPS:.4f}", "-map", "0:v:0", "-map", "0:a:0",
        "-vf", "scale=1080:1920:flags=lanczos,fps=30,format=yuv420p,setsar=1",
        "-frames:v", str(frames),
        # Audio grabado al aire libre: quitar zumbidos graves y ruido de fondo,
        # comprimir un poco y llevarlo al mismo volumen de los otros videos.
        "-af", "highpass=f=100,afftdn=nf=-35:nr=12,"
               "acompressor=threshold=-26dB:ratio=3:attack=5:release=90:makeup=2,"
               "loudnorm=I=-15:TP=-1.5:LRA=7,aformat=sample_rates=48000:channel_layouts=stereo,"
               "afade=t=in:d=0.05",
        "-c:v", "libx264", "-preset", "medium", "-crf", "10",
        "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart",
        str(OUT / "montaje.mp4")], check=True)


if __name__ == "__main__":
    main()
