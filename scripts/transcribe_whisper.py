#!/usr/bin/env python3
"""Transcribe media/audio/*.wav con Whisper large-v3-turbo (sherpa-onnx, CPU) en español,
con tiempos por palabra. El texto sale de Whisper; los tiempos, de Parakeet TDT v3
(NVIDIA, multilingüe), alineando ambas transcripciones palabra a palabra
(el Whisper ONNX publicado no exporta las salidas de atención que dan tiempos). Escribe public/subs/<clip>.json en formato Caption de
@remotion/captions y TRANSCRIPCIONES.md legible.

Modelos: whisper-models/sherpa-onnx-whisper-turbo y
sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 (GitHub Releases de k2-fsa/sherpa-onnx;
huggingface.co está bloqueado en este entorno).
Uso: python3 scripts/transcribe_whisper.py [IMG_1697 IMG_1696 ...]
"""
import difflib
import json
import re
import unicodedata
import os
import sys
import wave

import numpy as np
import sherpa_onnx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.join(ROOT, "whisper-models", "sherpa-onnx-whisper-turbo")
PARAKEET = os.path.join(ROOT, "whisper-models", "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")
SR = 16000
MAX_CHUNK_S = 28  # Whisper procesa ventanas de 30 s


def load_wav(path):
    with wave.open(path) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def chunks(samples):
    """Corta en ventanas <= 28 s, eligiendo el punto más silencioso entre 18 y 28 s."""
    hop = SR // 100
    energy = np.sqrt(np.convolve(samples ** 2, np.ones(hop) / hop, mode="same"))[::hop]
    start = 0
    n = len(samples)
    while start < n:
        if n - start <= MAX_CHUNK_S * SR:
            yield start, n
            return
        lo, hi = (start + 18 * SR) // hop, (start + MAX_CHUNK_S * SR) // hop
        cut = (lo + int(np.argmin(energy[lo:hi]))) * hop
        yield start, cut
        start = cut


def whisper_rec():
    f = lambda name: os.path.join(MODEL, name)
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f("turbo-encoder.int8.onnx"),
        decoder=f("turbo-decoder.int8.onnx"),
        tokens=f("turbo-tokens.txt"),
        language="es",
        task="transcribe",
        num_threads=os.cpu_count() or 4,
    )


def parakeet_rec():
    f = lambda name: os.path.join(PARAKEET, name)
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f("encoder.int8.onnx"),
        decoder=f("decoder.int8.onnx"),
        joiner=f("joiner.int8.onnx"),
        tokens=f("tokens.txt"),
        model_type="nemo_transducer",
        num_threads=os.cpu_count() or 4,
    )


def decode(rec, audio):
    s = rec.create_stream()
    s.accept_waveform(SR, audio)
    rec.decode_stream(s)
    return s.result


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def timed_words(result, offset_s):
    """Palabras de Parakeet con inicio (los tokens SentencePiece empiezan palabra con '▁')."""
    words = []
    for tok, ts in zip(result.tokens, result.timestamps):
        if tok.startswith("▁") or tok.startswith(" ") or not words:
            words.append({"text": tok.lstrip("▁ "), "start": offset_s + ts})
        else:
            words[-1]["text"] += tok
    return words


def align(whisper_text, ref, chunk_start, chunk_end):
    """Asigna a cada palabra de Whisper el inicio de la palabra equivalente de Parakeet;
    las que no coinciden se interpolan entre sus vecinas."""
    ww = whisper_text.split()
    starts = [None] * len(ww)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in ww], b=[norm(r["text"]) for r in ref], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            starts[blk.a + k] = ref[blk.b + k]["start"]
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "replace" and a2 - a1 == b2 - b1:
            for k in range(a2 - a1):
                starts[a1 + k] = ref[b1 + k]["start"]
    # Interpolar huecos.
    known = [(i, t) for i, t in enumerate(starts) if t is not None]
    if not known:
        known = [(0, chunk_start)]
    for i in range(len(ww)):
        if starts[i] is None:
            prev = max([k for k in known if k[0] < i], default=(-1, chunk_start), key=lambda k: k[0])
            nxt = min([k for k in known if k[0] > i], default=(len(ww), chunk_end), key=lambda k: k[0])
            starts[i] = prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / (nxt[0] - prev[0])
    words = [{"text": " " + w, "start": t} for w, t in zip(ww, starts)]
    # Fin de cada palabra: hasta la siguiente, máximo 0.8 s; la última, hasta el final hablado de Parakeet.
    last_end = (ref[-1]["start"] + 0.5) if ref else chunk_end
    for i, w in enumerate(words):
        nxt = words[i + 1]["start"] if i + 1 < len(words) else min(last_end, chunk_end)
        w["end"] = max(w["start"] + 0.08, min(nxt, w["start"] + 0.8))
    return words


def main():
    wrec, prec = whisper_rec(), parakeet_rec()
    audio_dir = os.path.join(ROOT, "media", "audio")
    subs_dir = os.path.join(ROOT, "public", "subs")
    os.makedirs(subs_dir, exist_ok=True)
    names = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(audio_dir) if f.endswith(".wav"))
    md = ["# Transcripciones", "", "Whisper large-v3-turbo, español, tiempos por palabra (segundos del archivo original).", ""]
    for name in names:
        samples = load_wav(os.path.join(audio_dir, name + ".wav"))
        words = []
        for a, b in chunks(samples):
            text = decode(wrec, samples[a:b]).text
            ref = timed_words(decode(prec, samples[a:b]), a / SR)
            words += align(text, ref, a / SR, b / SR)
        captions = [
            {"text": w["text"], "startMs": round(w["start"] * 1000), "endMs": round(w["end"] * 1000),
             "timestampMs": round(w["start"] * 1000), "confidence": None}
            for w in words
        ]
        json.dump(captions, open(os.path.join(subs_dir, name + ".json"), "w"), ensure_ascii=False, indent=1)
        md += [f"## {name}", ""]
        line = []
        for i, w in enumerate(words):
            line.append(w)
            gap = words[i + 1]["start"] - w["end"] if i + 1 < len(words) else 9
            if w["text"].strip()[-1:] in ".?!" or gap > 0.6:
                md.append(f"- `{line[0]['start']:6.2f}–{line[-1]['end']:6.2f}` {''.join(x['text'] for x in line).strip()}")
                line = []
        md.append("")
        print(name, len(words), "palabras", flush=True)
    open(os.path.join(ROOT, "TRANSCRIPCIONES.md"), "w").write("\n".join(md))


if __name__ == "__main__":
    main()
