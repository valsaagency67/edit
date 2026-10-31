"""Armado por escenas de videos hablados a cámara o con voz en off (lo comparten build_nia.py y
build_derechos.py).

Cada escena de la configuración es:
  take    voz en off grabada aparte (archivo en `media`), o
  camera  toma a cámara con su propio audio (clave de `videos` o nombre del original): el video se corta con los mismos
          tramos que su voz y a la misma velocidad, así quedan en sincronía;
  dur     escena sin voz (solo imagen; con `ambient` lleva el sonido ambiente de su toma).
La voz pasa por RNNoise + la cadena de enhance_voice.py a -16 LUFS; las pausas se recortan por el
AUDIO (umbral adaptativo entre ruido y voz; se dejan `pause.keep` s de aire) y se acelera (`speed`).
Tiempos por palabra con Parakeet sobre la toma ya procesada y el texto tal como se dice (align de
transcribe_whisper). Las tomas de imagen (`shots`) y los subtítulos (`phrases`, «*» = resaltado) se
anclan a palabras.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import make_foley as mf  # noqa: E402
from enhance_voice import CHAIN  # noqa: E402

SR = 48000
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-movflags", "+faststart"]
# Reducción de ruido con RNNoise (modelo original de Xiph, BSD) antes de la cadena de voz: las tomas a
# cámara se graban al aire libre. mix=0.85: con el 100 % se comía palabras suaves («ojo» en Nia).
RNNOISE = f"aresample={SR},arnndn=m={ROOT}/scripts/models/rnnoise-std.rnnn:mix=0.85"


def read_wav(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def write_wav(path, x, channels=1):
    x = np.clip(x, -1, 1)
    if channels == 2 and x.ndim == 1:
        x = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def sample(name):
    """Efecto del video de referencia del cliente (public/sfx/ref-*.wav: click, shutter, whoosh, magic;
    ver CREDITOS.md). Son los únicos que quiere en sus videos."""
    return read_wav(f"{ROOT}/public/sfx/ref-{name}.wav")


def frames(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v",
                          "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return int(out.strip())


def cut_pauses(x, pause):
    """Quita las pausas largas (decididas por el audio) y deja `keep` s de aire en cada una.
    Devuelve el audio recortado y los tramos conservados (en s, relativos a x) para cortar el video igual."""
    hop = int(0.01 * SR)
    n = len(x) // hop
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, 1)) + 1e-9)
    floor, speech = np.percentile(db, 10), np.percentile(db, 90)
    # Umbral entre ruido y voz, pero nunca más de 26 dB bajo la voz: si la toma tiene tramos casi mudos
    # el «ruido» sale muy bajo y el aire de la calle contaba como voz (gancho de IMG_0727).
    loud = db >= max(floor + pause["threshold"] * (speech - floor), speech - 26)
    # Ruidos sueltos al principio o al final (un golpe, una moto, una respiración): tramos de menos de
    # 0.3 s separados de la voz por al menos 0.5 s de silencio no cuentan como voz.
    runs, k = [], 0
    while k < n:
        if loud[k]:
            j = k
            while j < n and loud[j]:
                j += 1
            runs.append((k, j))
            k = j
        else:
            k += 1
    while len(runs) > 1 and runs[0][1] - runs[0][0] < 30 and runs[1][0] - runs[0][1] >= 50:
        loud[runs[0][0]:runs[0][1]] = False
        runs.pop(0)
    while len(runs) > 1 and runs[-1][1] - runs[-1][0] < 30 and runs[-1][0] - runs[-2][1] >= 50:
        loud[runs[-1][0]:runs[-1][1]] = False
        runs.pop()
    idx = np.nonzero(loud)[0]
    first, last = max(0, idx[0] - 4), min(n, idx[-1] + 6)  # 40 ms antes, 60 ms después
    keep, k, t = [], first, first
    while k < last:
        if not loud[k]:
            j = k
            while j < last and not loud[j]:
                j += 1
            if (j - k) * 0.01 >= pause["minSilence"]:
                half = int(pause["keep"] / 2 / 0.01)
                keep.append((t, k + half))
                t = j - half
            k = j
        else:
            k += 1
    keep.append((t, last))
    fade = int(0.004 * SR)
    parts = []
    for a, b in keep:
        y = x[a * hop: b * hop].copy()
        y[:fade] *= np.linspace(0, 1, fade)
        y[-fade:] *= np.linspace(1, 0, fade)
        parts.append(y)
    return np.concatenate(parts), [(a * 0.01, b * 0.01) for a, b in keep]


def words_for(x, text):
    import transcribe_whisper as tw
    if not hasattr(words_for, "rec"):
        words_for.rec = tw.parakeet_rec()
    a16 = subprocess.run(["ffmpeg", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-f", "f32le", "-ar", "16000", "-"], input=x.tobytes(), capture_output=True,
                         check=True).stdout
    a16 = np.frombuffer(a16, np.float32)
    ref = tw.timed_words(tw.decode(words_for.rec, a16), 0)
    dur = len(x) / SR
    return [{"t": w["text"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)}
            for w in tw.align(text, ref, 0, dur)]


def find_word(words, at, nth=1):
    import transcribe_whisper as tw
    hits = [w for w in words if tw.norm(w["t"]) == tw.norm(at)]
    return hits[nth - 1]["s"]


class Proyecto:
    """cfg: configuración (fps, speed, pause, gap, videos, scenes); media: carpeta de los originales;
    ext: extensión de los originales; out: carpeta pública; tmp: carpeta de trabajo; grade: filtro de
    color de ffmpeg para las tomas."""

    def __init__(self, cfg, media, ext, out, tmp, grade):
        self.cfg, self.media, self.ext, self.out, self.tmp = cfg, media, ext, out, tmp
        self.fps = cfg["fps"]
        # Llena 1080x1920 sin deformar (las tomas 3:4 se recortan a los lados).
        self.vf = f"scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,unsharp=5:5:0.3,fps={self.fps},{grade},format=yuv420p"

    def src(self, name):
        return f"{self.media}/{name}{self.ext}"

    def videos(self):
        """Tomas sin cortar (las de apoyo), escaladas a 1080x1920 con la gradación."""
        clips = {}
        for key, vid in self.cfg.get("videos", {}).items():
            dst = f"{self.out}/{key}.mp4"
            if not os.path.exists(dst):
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.src(vid), "-an", "-vf", self.vf, *ENC, dst],
                               check=True)
                print("video:", dst)
            clips[key] = frames(dst)
        return clips

    def cut_video(self, vid, ranges, speed, dst):
        """Toma a cámara cortada con los mismos tramos que su voz y a la misma velocidad. Se eligen los
        cuadros con `select` en una sola pasada (con trim+concat por tramo, ffmpeg guardaba en memoria
        todo el video 4K y el proceso moría)."""
        keep = "+".join(f"between(t,{a:.3f},{b - 0.0001:.4f})" for a, b in ranges)
        # fps= antes de select: las tomas de iPhone a «120 fps» son de cuadro variable (~30 reales) y
        # N/FRAME_RATE las acortaba; así el contador de cuadros va a 30 fijos.
        vf = f"fps={self.fps},select='{keep}',setpts=N/{self.fps}/TB,setpts=PTS/{speed},{self.vf}"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.src(vid), "-vf", vf, "-an", *ENC, dst], check=True)

    def enhanced(self, take):
        path = f"{self.tmp}/{take}-voz.wav"
        if not os.path.exists(path):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", self.src(take), "-af", f"{RNNOISE},{CHAIN}",
                            "-ar", str(SR), "-ac", "1", path], check=True)
        return read_wav(path)

    def tempo(self, x, speed, name):
        src, dst = f"{self.tmp}/{name}-cut.wav", f"{self.tmp}/{name}-final.wav"
        write_wav(src, x)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"atempo={speed}", dst], check=True)
        return read_wav(dst)

    def build(self, json_path):
        """Arma voz.wav y las tomas cortadas en `out`, y escribe la línea de tiempo en `json_path`."""
        cfg = self.cfg
        os.makedirs(self.out, exist_ok=True)
        os.makedirs(self.tmp, exist_ok=True)
        clips = self.videos()
        t = 0.0
        voice, scenes = [], []
        for sc in cfg["scenes"]:
            # camera: clave de `videos` o, si no está ahí, el nombre del original.
            src = sc.get("take") or (cfg.get("videos", {}).get(sc["camera"], sc["camera"]) if "camera" in sc else None)
            if src:
                raw = self.enhanced(src)
                # Lo que haya antes de la primera palabra (murmullos, «¿listo?») se descarta: la toma empieza
                # 0.3 s antes de la primera palabra del texto (los tiempos de Parakeet vienen corridos ~0.2 s).
                first = words_for(raw, sc["text"])[0]["s"]
                off = max(0.0, first - 0.3)
                cut, ranges = cut_pauses(raw[int(off * SR):], cfg["pause"])
                speed = sc.get("speed", cfg["speed"])
                x = self.tempo(cut, speed, sc["key"])
                if "camera" in sc:
                    dst = f"{self.out}/{sc['key']}.mp4"
                    self.cut_video(src, [(off + a, off + b) for a, b in ranges], speed, dst)
                    clips[sc["key"]] = frames(dst)
                words = words_for(x, sc["text"])
                dur = len(x) / SR
                voice.append((t, x))
            else:
                words, dur = [], sc["dur"]
                if "ambient" in sc:
                    # Escena sin voz: su propio sonido ambiente, a -26 dB RMS con fundidos, desde el mismo
                    # punto de la toma que se ve.
                    shot = sc["shots"][0]
                    amb = f"{self.tmp}/{sc['key']}-ambiente.wav"
                    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(shot.get("from", 0) + 0.15),
                                    "-t", str(dur + 0.1), "-i", self.src(cfg["videos"][sc["ambient"]]), "-vn",
                                    "-af", f"afade=t=in:d=0.08,afade=t=out:st={dur - 0.2:.2f}:d=0.3",
                                    "-ar", str(SR), "-ac", "1", amb], check=True)
                    y = read_wav(amb)
                    voice.append((t, y * 10 ** (-26 / 20) / max(1e-9, np.sqrt(np.mean(y ** 2)))))
            end = t + dur + sc.get("hold", 0)
            # Tomas de imagen: cada una empieza en una palabra (o al inicio de la escena) y dura hasta la
            # siguiente; la última, hasta el final de la escena.
            shots = []
            for s in sc["shots"]:
                st = t + (find_word(words, s["at"], s.get("nth", 1)) if "at" in s else 0.0)
                shots.append({**{k: v for k, v in s.items() if k not in ("at", "nth")}, "start": round(st, 3)})
            if shots:
                shots[0]["start"] = round(t, 3)
            for i, s in enumerate(shots):
                s["end"] = shots[i + 1]["start"] if i + 1 < len(shots) else round(end, 3)
            # Subtítulos: cada frase desde su primera palabra hasta la siguiente frase.
            caps, k = [], 0
            for ph in sc.get("phrases", []):
                caps.append({"text": ph, "start": round(t + words[k]["s"], 3)})
                k += len(ph.split())
            for i, c in enumerate(caps):
                c["end"] = caps[i + 1]["start"] if i + 1 < len(caps) else round(t + dur, 3)
            # Tarjetas y acercamientos anclados a palabras (tiempos globales).
            cards = [{**{k: v for k, v in c.items() if k not in ("at", "nth", "until", "untilNth")},
                      "start": round(t + find_word(words, c["at"], c.get("nth", 1)), 3),
                      "end": round(t + find_word(words, c["until"], c.get("untilNth", 1)), 3) if "until" in c
                      else round(t + dur, 3)} for c in sc.get("cards", [])]
            zooms = None
            if "zooms" in sc:
                zooms = {"origin": sc["zooms"]["origin"],
                         "at": [{"t": round(t + find_word(words, z["at"], z.get("nth", 1)), 3), "scale": z["scale"]}
                                for z in sc["zooms"]["at"]]}
            scenes.append({"key": sc["key"], "start": round(t, 3), "end": round(end, 3), "zooms": zooms,
                           "silent": sc.get("silent"), "text": sc.get("text"),
                           "words": [{**w, "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words],
                           "shots": shots, "captions": caps, "cards": cards})
            print(f"{sc['key']:11s} {t:6.2f} -> {end:6.2f}  ({dur:.2f} s)")
            t = end + (cfg["gap"] if src else 0.0)
        # La última toma de cada escena se estira hasta la siguiente escena (sin negro en los huecos).
        for a, b in zip(scenes, scenes[1:]):
            a["shots"][-1]["end"] = b["start"]
        total = scenes[-1]["end"] + cfg.get("tail", 0.4)
        scenes[-1]["shots"][-1]["end"] = round(total, 3)
        buf = np.zeros(int(total * SR) + SR)
        for st, x in voice:
            mf.place(buf, x, st)
        write_wav(f"{self.out}/voz.wav", buf)
        # Fotos y videos de apoyo animados (scripts/make_fotos.py y make_socrates.py).
        for sc in scenes:
            for sh in sc["shots"]:
                name = sh.get("full") or sh.get("painting")
                if name:
                    clips[name] = frames(f"{self.out}/broll/{name}{'-anim' if 'full' in sh else ''}.mp4")
        data = {"fps": self.fps, "duration": round(total, 3), "clips": clips, "scenes": scenes}
        json.dump(data, open(json_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return data
