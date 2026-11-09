"""Subtitulos ASS por frases (se reparten en paginas de 2-4 palabras).
Uso: python3 make_subs.py cortes.json salida.ass"""
import json, sys

GOLD = "&H004AB8E8&"
def ts(t):
    t = max(t, 0); h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"

def pages(text, max_chars=28):
    """Reparte la frase en el menor numero de lineas parejas (sin palabras sueltas)."""
    words = text.split()
    n = max(1, -(-len(text) // max_chars))
    while True:
        target = len(text) / n
        out, cur = [], []
        for w in words:
            if cur and len(" ".join(cur + [w])) > target + 4 and len(out) < n - 1:
                out.append(cur); cur = []
            cur.append(w)
        out.append(cur)
        if all(len(" ".join(p)) <= max_chars for p in out) or n >= len(words):
            return out
        n += 1

LINE = 15  # caracteres maximos por linea a este tamano de letra

def two_lines(words):
    txt = " ".join(words)
    if len(txt) <= LINE or len(words) == 1:
        return txt
    best = min(range(1, len(words)), key=lambda k: max(len(" ".join(words[:k])), len(" ".join(words[k:]))))
    return " ".join(words[:best]) + "\\N" + " ".join(words[best:])

d = json.load(open(sys.argv[1]))
ev, off = [], 0.0
for seg in d["segmentos"]:
    dur = seg["out"] - seg["in"]
    for s, e, text in seg["subs"]:
        s, e = max(s - seg["in"], 0), min(e - seg["in"], dur)
        pg = pages(text.upper())
        total = sum(len(" ".join(p)) for p in pg)
        t = s
        for p in pg:
            pe = t + (e - s) * len(" ".join(p)) / total
            body = two_lines(p)
            ev.append(f"Dialogue: 0,{ts(off+t)},{ts(off+pe)},Sub,,0,0,0,,{{\\fscx85\\fscy85\\t(0,100,\\fscx100\\fscy100)}}{body}")
            t = pe
    off += dur
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter ExtraBold,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,7,4,2,70,70,520,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(sys.argv[2], "w").write(hdr + "\n".join(ev) + "\n")
print(f"{len(ev)} subtitulos, {off:.1f}s")
