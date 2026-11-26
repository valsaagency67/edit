# Genera la voz (es-MX) de cada línea del guion con edge-tts y la ajusta a su ventana de tiempo.
import asyncio, certifi, os, subprocess, sys, re
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts

OUT, RAW = sys.argv[1], sys.argv[2]
VOICE = "es-MX-DaliaNeural"
caps = re.findall(r"from:\s*([\d.]+),\s*to:\s*([\d.]+),\s*text:\s*\n?\s*\"([^\"]+)\"", open("src/FacturApp/Captions.tsx").read())
# Pronunciación hablada (la letra del subtítulo no cambia)
SPOKEN = {}
async def main():
    for i, (a, b, t) in enumerate(caps):
        t = t.replace("*", "")
        t = SPOKEN.get(t, t).replace("FacturApp", "Factur App").replace("Oxxo", "Oxo").replace("WhatsApp", "Guatsap").replace("$100", "100 pesos").replace("$30", "30 pesos").replace("IA", "I A")
        raw = f"{RAW}/vo-{i:02d}.mp3"
        await edge_tts.Communicate(t, VOICE, rate={1: "+14%", 2: "+14%", 3: "+14%"}.get(i, "+8%"), proxy=os.environ["HTTPS_PROXY"]).save(raw)
        nxt = float(caps[i + 1][0]) if i + 1 < len(caps) else 40.0
        window = min(nxt - float(a) - 0.1, 40.0 - float(a))
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]))
        tempo = max(1.0, dur / window)
        if tempo >= 1.2: print("AVISO: línea", i, "requiere x%.2f" % tempo)
        af = f"atempo={tempo:.3f}," if tempo > 1.0 else ""
        subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", af + "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-b:a", "192k", f"{OUT}/vo-{i:02d}.mp3"])
        print(i, f"{dur:.2f}s dentro de {window:.2f}s", f"tempo x{tempo:.2f}")
asyncio.run(main())
