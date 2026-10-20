#!/usr/bin/env python3
"""Video de Nia («La filosofía se vive en la calle»): voz, video base, música y foley para
src/nia/Nia.tsx, a partir de scripts/nia.config.json.

- Voz en off (media/nia/<id>.bin, audios del Drive): cadena de enhance_voice.py a -16 LUFS, pausas
  recortadas por el AUDIO (umbral adaptativo entre ruido y voz; se dejan `keep` s de aire) y voz
  acelerada (`speed`, el gancho más rápido). Tiempos por palabra con Parakeet sobre la toma ya
  procesada, texto del guión tal como lo dice ella (align de transcribe_whisper).
- Videos (720x1280, sin audio): escalados a 1080x1920, 30 fps, con la gradación pastel.
- Escenas 'silent' (sin voz grabada): duración fija, solo texto en pantalla.
Salidas: public/nia/{voz,musica,foley}.wav, public/nia/{v1,v2}.mp4, src/nia/nia.json.

Uso: python3 scripts/build_nia.py
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
import make_music as mm  # noqa: E402
from enhance_voice import CHAIN  # noqa: E402

CFG = json.load(open(f"{ROOT}/scripts/nia.config.json", encoding="utf-8"))
MEDIA = f"{ROOT}/media/nia"
OUT = f"{ROOT}/public/nia"
TMP = f"{ROOT}/out/nia/tmp"
SR = 48000
FPS = CFG["fps"]
# Gradación pastel (ver CLAUDE.md, sección Nia): negros levantados, menos contraste y saturación,
# sombras lila y luces cálidas.
GRADE = ("eq=saturation=0.82:contrast=0.9:brightness=0.025,"
         "curves=r='0/0.07 0.5/0.52 1/0.97':g='0/0.05 0.5/0.5 1/0.96':b='0/0.10 0.5/0.52 1/0.95',"
         "colorbalance=rs=0.02:bs=0.05:rh=0.03:gh=0.02:bh=-0.02")


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


VF = f"scale=1080:1920:flags=lanczos,unsharp=5:5:0.3,fps={FPS},{GRADE},format=yuv420p"
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-movflags", "+faststart"]


def frames(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v",
                          "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return int(out.strip())


def videos():
    """Tomas sin cortar (las de apoyo), escaladas a 1080x1920 con la gradación pastel."""
    clips = {}
    for key, vid in CFG["videos"].items():
        dst = f"{OUT}/{key}.mp4"
        if not os.path.exists(dst):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{MEDIA}/{vid}.bin", "-an", "-vf", VF, *ENC, dst],
                           check=True)
            print("video:", dst)
        clips[key] = frames(dst)
    return clips


def cut_video(vid, ranges, speed, dst):
    """Toma a cámara cortada con los mismos tramos que su voz y a la misma velocidad (queda en sincronía
    con voz.wav)."""
    parts = "".join(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[p{i}];" for i, (a, b) in enumerate(ranges))
    concat = "".join(f"[p{i}]" for i in range(len(ranges))) + f"concat=n={len(ranges)}:v=1:a=0[c];"
    graph = parts + concat + f"[c]setpts=PTS/{speed},{VF}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{MEDIA}/{vid}.bin", "-filter_complex", graph,
                    "-map", "[v]", "-an", *ENC, dst], check=True)


def enhanced(take):
    path = f"{TMP}/{take}-voz.wav"
    if not os.path.exists(path):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{MEDIA}/{take}.bin", "-af", CHAIN,
                        "-ar", str(SR), "-ac", "1", path], check=True)
    return read_wav(path)


def cut_pauses(x):
    """Quita las pausas largas (decididas por el audio) y deja `keep` s de aire en cada una.
    Devuelve el audio recortado y los tramos conservados (en s, relativos a x) para cortar el video igual."""
    p = CFG["pause"]
    hop = int(0.01 * SR)
    n = len(x) // hop
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, 1)) + 1e-9)
    floor, speech = np.percentile(db, 10), np.percentile(db, 90)
    loud = db >= floor + p["threshold"] * (speech - floor)
    idx = np.nonzero(loud)[0]
    first, last = max(0, idx[0] - 4), min(n, idx[-1] + 6)  # 40 ms antes, 60 ms después
    keep, k, t = [], first, first
    while k < last:
        if not loud[k]:
            j = k
            while j < last and not loud[j]:
                j += 1
            if (j - k) * 0.01 >= p["minSilence"]:
                half = int(p["keep"] / 2 / 0.01)
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


def tempo(x, speed, name):
    src, dst = f"{TMP}/{name}-cut.wav", f"{TMP}/{name}-final.wav"
    write_wav(src, x)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"atempo={speed}", dst], check=True)
    return read_wav(dst)


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


def build():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(TMP, exist_ok=True)
    clips = videos()
    t = 0.0
    voice, scenes = [], []
    for sc in CFG["scenes"]:
        # take: voz en off grabada aparte; camera: toma a cámara con su propio audio.
        src = sc.get("take") or (CFG["videos"][sc["camera"]] if "camera" in sc else None)
        if src:
            raw = enhanced(src)
            # Lo que haya antes de la primera palabra (murmullos, ruido) se descarta: la toma empieza
            # 0.3 s antes de la primera palabra que reconoce Parakeet (sus tiempos vienen corridos ~0.2 s).
            first = words_for(raw, sc["text"])[0]["s"]
            off = max(0.0, first - 0.3)
            cut, ranges = cut_pauses(raw[int(off * SR):])
            speed = sc.get("speed", CFG["speed"])
            x = tempo(cut, speed, sc["key"])
            if "camera" in sc:
                dst = f"{OUT}/{sc['key']}.mp4"
                cut_video(src, [(off + a, off + b) for a, b in ranges], speed, dst)
                clips[sc["key"]] = frames(dst)
            words = words_for(x, sc["text"])
            dur = len(x) / SR
            voice.append((t, x))
        else:
            words, dur = [], sc["dur"]
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
            n = len(ph.split())
            caps.append({"text": ph, "start": round(t + words[k]["s"], 3)})
            k += n
        for i, c in enumerate(caps):
            c["end"] = caps[i + 1]["start"] if i + 1 < len(caps) else round(t + dur, 3)
        scenes.append({"key": sc["key"], "start": round(t, 3), "end": round(end, 3),
                       "silent": sc.get("silent"), "text": sc.get("text"),
                       "words": [{**w, "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words],
                       "shots": shots, "captions": caps})
        print(f"{sc['key']:11s} {t:6.2f} -> {end:6.2f}  ({dur:.2f} s)")
        t = end + (CFG["gap"] if src else 0.0)
    # La última toma de cada escena se estira hasta la siguiente escena (sin negro en los huecos).
    for a, b in zip(scenes, scenes[1:]):
        a["shots"][-1]["end"] = b["start"]
    total = scenes[-1]["end"] + 0.4
    scenes[-1]["shots"][-1]["end"] = round(total, 3)
    buf = np.zeros(int(total * SR) + SR)
    for st, x in voice:
        mf.place(buf, x, st)
    write_wav(f"{OUT}/voz.wav", buf)
    data = {"fps": FPS, "duration": round(total, 3), "clips": clips, "scenes": scenes}
    json.dump(data, open(f"{ROOT}/src/nia/nia.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return data


def musica(data):
    """Piano y chelo en Sol mayor, 84 bpm, I-V-vi-IV (Sol - Re - Mim - Do): arpegios suaves de piano,
    chelo sostenido que entra en «Sócrates» y crece hacia el final. Muestras reales (CC-BY 3.0)."""
    bpm = 84
    beat = 60 / bpm
    total = data["duration"]
    buf = np.zeros(int((total + 3) * SR))
    prog = [("G2", ["G3", "B3", "D4", "G4", "D4", "B3"]), ("D2", ["D3", "Fs3", "A3", "D4", "A3", "Fs3"]),
            ("E2", ["E3", "G3", "B3", "E4", "B3", "G3"]), ("C2", ["C3", "E3", "G3", "C4", "G3", "E3"])]
    starts = {s["key"]: s["start"] for s in data["scenes"]}
    t, bar = 0.0, 0
    while t < total + 1.5:
        root, arp = prog[bar % 4]
        grow = 0.75 + 0.5 * min(1, t / total)
        mm.place(buf, mm.note("piano", root, 4 * beat + 1, 0.30 * grow, release=1.0), t)
        for i, n in enumerate(arp):
            n = mm.up_octave(n) if t >= starts["hoy"] else n
            mm.place(buf, mm.note("piano", n, 1.6, 0.16 * grow, release=0.8), t + i * beat * 2 / 3)
        if t >= starts["socrates"] - 0.1:
            mm.place(buf, mm.note("cello", root.replace("2", "3"), 4 * beat + 0.4, 0.22 * grow,
                                  attack=0.5, release=0.9), t)
        t += 4 * beat
        bar += 1
    buf = mm.reverb(buf, 2.4, 0.3)
    fade = int(2.0 * SR)
    end = int((total + 0.8) * SR)
    buf[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
    buf[end:] = 0
    tmp = f"{TMP}/musica-raw.wav"
    write_wav(tmp, buf / max(1e-9, np.abs(buf).max()) * 0.8, 2)
    # ~17 dB bajo la voz (-16 LUFS).
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-33:TP=-9:LRA=11",
                    "-ar", str(SR), f"{OUT}/musica.wav"], check=True)


def sample(name):
    """Efecto grabado (Ion.Sound, licencia MIT; ver CREDITOS.md)."""
    return read_wav(f"{OUT}/sfx/{name}.wav")


def magic_reveal(gain=0.5):
    """«Magic reveal»: arpegio rápido ascendente de piano agudo (muestras reales) con brillo de ruido
    agudo que titila, y reverb larga."""
    n = int(1.8 * SR)
    x = np.zeros(n)
    for i, note in enumerate(["E5", "Gs5", "B5", "E6", "Gs6", "B6", "E7"]):
        mm.place(x, mm.note("piano", note, 1.4, 0.22 + 0.04 * i, release=0.9), 0.045 * i)
    t = np.arange(n) / SR
    shimmer = mf.band(np.random.default_rng(3).standard_normal(n), 6000, 14000)
    shimmer *= np.clip(t / 0.25, 0, 1) * np.exp(-t / 0.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t)) * 0.08
    y = mm.reverb(x + shimmer, 1.8, 0.35).mean(1)
    return y / np.abs(y).max() * gain


def big_whoosh(gain=0.4, dur=0.55):
    """Whoosh grande: ruido con un pasabanda que sube y baja (efecto Doppler) y envolvente con pico al centro."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = np.random.default_rng(5).standard_normal(n)
    out = np.zeros(n)
    hop = 1024
    for k in range(0, n, hop):
        c = 400 + 4200 * np.sin(np.pi * min(1, k / n)) ** 2
        seg = mf.band(noise[max(0, k - 2048): k + hop], c * 0.6, min(c * 1.6, 20000))[-min(hop, n - k):]
        out[k: k + len(seg)] = seg
    env = np.sin(np.pi * t / dur) ** 2.5
    return out * env / np.abs(out * env).max() * gain


def foley(data):
    """Los 4 efectos de la referencia del cliente (sin el «faaahh»):
    - clic para remarcar textos: cada subtítulo y cada palabra grande;
    - «magic reveal» para revelar algo: LA FILOSOFÍA, CALLE, ¿POR QUÉ?, Sócrates, VERDADES, CUESTIONARLO;
    - whoosh en los cambios de toma dentro de una escena;
    - obturador de cámara en los cambios de escena (con el destello de la imagen)."""
    buf = np.zeros(int((data["duration"] + 2) * SR))
    click, shutter, magic, whoosh = sample("click"), sample("shutter"), magic_reveal(), big_whoosh()
    reveal = {"gancho": ["filosofía"], "socrates": ["sócrates"], "porque": ["por"], "cierre": ["cuestionarlo."]}
    big = {"injusticia": ["tanto"], "ojo": ["ojo,", "atreverse"], "gancho": ["libro."]}
    for i, sc in enumerate(data["scenes"]):
        if i:
            mf.place(buf, shutter * 0.55, sc["start"] - 0.03)
        for c in sc["captions"]:
            mf.place(buf, click * 0.35, c["start"])
        for s in sc["shots"][1:]:
            if s.get("porque") or s.get("card"):
                mf.place(buf, magic, s["start"] - 0.05)
            else:
                mf.place(buf, whoosh, s["start"] - 0.3)
        for w in sc["words"]:
            if w["t"].lower() in reveal.get(sc["key"], []):
                mf.place(buf, magic, w["s"] - 0.05)
            if w["t"].lower() in big.get(sc["key"], []):
                mf.place(buf, click * 0.6, w["s"])
        if sc["key"] == "calle":
            mf.place(buf, magic, sc["start"] + 0.5)
    write_wav(f"{OUT}/foley.wav", buf / max(1e-9, np.abs(buf).max()) * 10 ** (-3 / 20), 2)


if __name__ == "__main__":
    d = build()
    musica(d)
    foley(d)
    print("listo:", d["duration"], "s")
