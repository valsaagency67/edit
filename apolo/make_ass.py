"""Genera subtitulos ASS palabra por palabra (estilo Reels/TikTok).
Uso: python3 make_ass.py subtitulos.json duraciones.txt salida.ass"""
import json, sys

GOLD = "&H004AB8E8&"   # dorado del logo (#E8B84A) en formato ASS (BGR)
MAX_WORDS, MAX_CHARS = 3, 16

def ts(t):
    t = max(t, 0)
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"

def pages(words):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= MAX_WORDS or len(" ".join(x[0] for x in cur + [w])) > MAX_CHARS):
            out.append(cur); cur = []
        cur.append(w)
        if w[0][-1] in ".,!?":
            out.append(cur); cur = []
    if cur: out.append(cur)
    return out

data = json.load(open(sys.argv[1]))
durs = [float(x) for x in open(sys.argv[2]).read().split()]
header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter ExtraBold,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,7,4,2,60,60,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines, offset = [], 0.0
for clip, dur in zip(data["clips"], durs):
    cin = clip.get("in", 0.0)
    pg = pages([[w, s - cin, e - cin] for w, s, e in clip["words"]])
    for i, p in enumerate(pg):
        nxt = pg[i + 1][0][1] if i + 1 < len(pg) else dur
        end = min(p[-1][2] + 0.35, nxt, dur)
        for j, w in enumerate(p):
            ws = w[1] if j else p[0][1]
            we = p[j + 1][1] if j + 1 < len(p) else end
            txt = []
            for k, x in enumerate(p):
                word = x[0].upper()
                if k == j:
                    word = "{\\c%s\\fscx112\\fscy112}%s{\\c&H00FFFFFF&\\fscx100\\fscy100}" % (GOLD, word)
                txt.append(word)
            pop = "{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}" if j == 0 else ""
            lines.append(f"Dialogue: 0,{ts(offset+ws)},{ts(offset+we)},Sub,,0,0,0,,{pop}{' '.join(txt)}")
    offset += dur
open(sys.argv[3], "w").write(header + "\n".join(lines) + "\n")
print(f"{len(lines)} eventos, duracion clips {offset:.2f}s")
