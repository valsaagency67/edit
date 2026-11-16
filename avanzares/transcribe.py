import sys, json, glob, os
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
out = {}
for w in sorted(glob.glob(sys.argv[1] + "/*.wav")):
    import wave, numpy as np; wf = wave.open(w); a = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32)/32768
    segs, _ = m.transcribe(a, language="es", word_timestamps=True, vad_filter=False, beam_size=5,
        initial_prompt="Entrevista sobre los productos de Avanzares Sorprendentes.")
    words = []
    for s in segs:
        print(os.path.basename(w), f"[{s.start:.2f}-{s.end:.2f}]", s.text, flush=True)
        for x in s.words:
            words.append({"text": x.word, "start": round(x.start,3), "end": round(x.end,3), "p": round(x.probability,2)})
    out[os.path.basename(w)[:-4]] = words
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
