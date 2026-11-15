"""Video de eventos de Apolo: 3 clips con camara rapida en las partes sin voz,
transiciones, subtitulos palabra por palabra, logo en transparencia, musica
original y cierre animado con el logo.  Uso: python3 eventos/build.py"""
import json, os, subprocess
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
RAW, W = "media/nuevo/raw", "media/nuevo/work"
os.makedirs(W, exist_ok=True); os.makedirs("out", exist_ok=True)
E = json.load(open("eventos/edit.json")); FPS = 30; T = E["dur_transicion"]
VF = "scale=1080:1920:flags=lanczos,eq=contrast=1.03:saturation=1.05"
AV = "highpass=f=90,equalizer=f=300:t=q:w=1:g=-2,equalizer=f=3000:t=q:w=1.2:g=3,loudnorm=I=-14:TP=-1.5:LRA=8"
def run(a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)

def ts(t):
    h, r = divmod(max(t, 0), 3600); m, s = divmod(r, 60); return f"{int(h)}:{int(m):02d}:{s:05.2f}"

clip_files, durs, words_out = [], [], []
for ci, c in enumerate(E["clips"]):
    parts, t_out, maps = [], 0.0, []
    for pi, (a, b, sp) in enumerate(c["piezas"]):
        p = f"{W}/c{ci}_p{pi}.mp4"; d = (b - a) / sp
        vf = f"{VF},setpts=(PTS-STARTPTS)/{sp},fps={FPS}"
        if sp == 1:
            run(["-ss", str(a), "-t", str(b - a), "-i", f"{RAW}/{c['file']}", "-vf", vf,
                 "-af", f"{AV},afade=t=in:d=0.03,areverse,afade=t=in:d=0.05,areverse,aresample=48000",
                 "-ac", "2", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-c:a", "pcm_s16le", p.replace(".mp4", ".mov")])
        else:   # camara rapida: sin voz (la cubre la musica)
            run(["-ss", str(a), "-t", str(b - a), "-i", f"{RAW}/{c['file']}", "-f", "lavfi", "-t", f"{d:.3f}",
                 "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a", "-vf", vf, "-t", f"{d:.3f}",
                 "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-c:a", "pcm_s16le", p.replace(".mp4", ".mov")])
        parts.append(p.replace(".mp4", ".mov")); maps.append((a, b, sp, t_out)); t_out += d
    lst = f"{W}/c{ci}.txt"; open(lst, "w").write("".join(f"file '{os.path.abspath(x)}'\n" for x in parts))
    cf = f"{W}/c{ci}.mov"; run(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", cf])
    real = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", cf], capture_output=True, text=True).stdout)
    clip_files.append(cf); durs.append(real)
    for w, s, e in c["palabras"]:
        for a, b, sp, to in maps:
            if a <= s < b: words_out.append((ci, w, to + (s - a) / sp, to + (min(e, b) - a) / sp))

starts = [0.0]
for d in durs[:-1]: starts.append(starts[-1] + d - T)
end_start = starts[-1] + durs[-1] - T
total = end_start + E["cierre"]

# subtitulos palabra por palabra (paginas de hasta 3 palabras, palabra activa dorada)
GOLD = "&H004AB8E8&"
ev = []
for ci in range(len(E["clips"])):
    ws = [(w, s + starts[ci], e + starts[ci]) for c2, w, s, e in words_out if c2 == ci]
    pages, cur = [], []
    for w in ws:
        if cur and (len(cur) >= 3 or len(" ".join(x[0] for x in cur + [w])) > 16): pages.append(cur); cur = []
        cur.append(w)
        if w[0][-1] in ".,": pages.append(cur); cur = []
    if cur: pages.append(cur)
    for i, p in enumerate(pages):
        nxt = pages[i + 1][0][1] if i + 1 < len(pages) else p[-1][2] + 0.5
        end = min(p[-1][2] + 0.3, nxt)
        for j, w in enumerate(p):
            we = p[j + 1][1] if j + 1 < len(p) else end
            txt = " ".join(("{\\c%s\\fscx112\\fscy112}%s{\\c&H00FFFFFF&\\fscx100\\fscy100}" % (GOLD, x[0].upper())) if k == j else x[0].upper() for k, x in enumerate(p))
            pop = "{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}" if j == 0 else ""
            ev.append(f"Dialogue: 0,{ts(w[1])},{ts(we)},Sub,,0,0,0,,{pop}{txt}")
open(f"{W}/subs.ass", "w").write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter ExtraBold,90,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,7,4,2,60,60,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(ev) + "\n")

# cierre animado y musica
if not os.path.exists("media/nuevo/endcard/f_0000.png"):
    subprocess.run(["python3", "eventos/end_card.py", "media/cover/logo_alpha.png", "media/nuevo/endcard", str(E["cierre"]), str(FPS)], check=True)
run(["-framerate", str(FPS), "-i", "media/nuevo/endcard/f_%04d.png", "-f", "lavfi", "-t", str(E["cierre"]), "-i", "anullsrc=r=48000:cl=stereo",
     "-map", "0:v", "-map", "1:a", "-t", str(E["cierre"]), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", f"{W}/end.mov"])
subprocess.run(["python3", "apolo/make_music.py", f"{total:.3f}", f"{end_start:.3f}", f"{W}/musica.wav"], check=True)

# composicion final
ins = []
for f in clip_files + [f"{W}/end.mov"]: ins += ["-i", f]
ins += ["-i", "media/cover/logo_alpha.png", "-i", f"{W}/musica.wav"]
n = len(clip_files) + 1; LOGO, MUS = n, n + 1
fc = [f"[{i}:v]fps={FPS},settb=1/{FPS},setsar=1,format=yuv420p[n{i}]" for i in range(n)]
prev, off = "[n0]", 0.0
for i in range(1, n):
    off = (starts[i] if i < len(starts) else end_start)
    fc.append(f"{prev}[n{i}]xfade=transition={E['transiciones'][i-1]}:duration={T}:offset={off:.3f}[x{i}]"); prev = f"[x{i}]"
fc.append(f"[{LOGO}:v]scale=170:-1,format=rgba,colorchannelmixer=aa=0.45[wm]")
fc.append(f"{prev}[wm]overlay=W-w-42:150:enable='lt(t,{end_start:.3f})',subtitles={W}/subs.ass,format=yuv420p[v]")
voz = []
for i in range(n - 1):
    fc.append(f"[{i}:a]adelay={int(starts[i]*1000)}|{int(starts[i]*1000)},apad=whole_dur={total:.3f}[a{i}]"); voz.append(f"[a{i}]")
fc.append(f"{''.join(voz)}amix=inputs={len(voz)}:normalize=0,asplit[voz][sc]")
fc.append(f"[{MUS}:a]highpass=f=50,volume=-5dB,volume=4dB:enable='gte(t,{end_start:.3f})'[mus]")
fc.append("[mus][sc]sidechaincompress=threshold=0.04:ratio=3:attack=15:release=300[musd]")
fc.append(f"[voz][musd]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95,afade=t=out:st={total-0.6:.3f}:d=0.6[a]")
run(ins + ["-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
           "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "out/Apolo_Eventos.mp4"])
run(["-i", "out/Apolo_Eventos.mp4", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "5M", "-bufsize", "10M",
     "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "out/Apolo_Eventos_WhatsApp.mp4"])
print(f"Listo: out/Apolo_Eventos.mp4 ({total:.1f} s); clips en {[round(s,2) for s in starts]}, cierre en {end_start:.2f}")
