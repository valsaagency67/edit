"""Genera la voz en off de cada escena de src/Gta6/script.json.

Salida:
  public/gta6/voice/<id>.mp3     audio de cada escena
  src/Gta6/voice.json            duración y tiempos palabra por palabra

Uso:  python3 scripts/gta6_voice.py
Requiere: pip install edge-tts ; ffprobe en el PATH.
"""

import asyncio
import json
import os
import subprocess
import sys

import certifi

# En entornos con proxy TLS propio, usar su bundle de CA si existe.
_CA = os.environ.get("TTS_CA_BUNDLE", "/root/.ccr/ca-bundle.crt")
if os.path.exists(_CA):
    certifi.where = lambda: _CA

import edge_tts  # noqa: E402
import edge_tts.communicate as _comm  # noqa: E402

_comm.certifi = certifi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, "src", "Gta6", "script.json")
OUT_DIR = os.path.join(ROOT, "public", "gta6", "voice")
OUT_JSON = os.path.join(ROOT, "src", "Gta6", "voice.json")


def duration_ms(path: str) -> int:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path]
    )
    return int(float(out) * 1000)


async def synth(text: str, voice: str, rate: str, path: str):
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 10_000  # 100ns -> ms
                words.append({
                    "text": chunk["text"],
                    "startMs": round(start),
                    "endMs": round(start + chunk["duration"] / 10_000),
                })
    return words


async def main():
    with open(SCRIPT, encoding="utf-8") as f:
        script = json.load(f)
    os.makedirs(OUT_DIR, exist_ok=True)
    result = {}
    for scene in script["scenes"]:
        path = os.path.join(OUT_DIR, f"{scene['id']}.mp3")
        words = await synth(scene["text"], script["voice"], script["rate"], path)
        result[scene["id"]] = {"durationMs": duration_ms(path), "words": words}
        print(f"{scene['id']:>8}: {result[scene['id']]['durationMs']} ms, {len(words)} palabras")
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
