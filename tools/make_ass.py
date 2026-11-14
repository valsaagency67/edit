import json, re
W,H=2160,3840
segs=json.load(open('media/work/transcript.json'))
words=[]
for s in segs:
    for x in s['words']:
        t=re.sub(r'[¡!¿?.,;:]','',x['w']).strip()
        if t: words.append((t.upper(),x['s'],x['e']))
# agrupar en frases cortas (máx 3 palabras / 20 letras)
chunks=[];cur=[]
for w in words:
    if cur and (len(cur)>=3 or sum(len(c[0])+1 for c in cur)+len(w[0])>20): chunks.append(cur);cur=[]
    cur.append(w)
if cur: chunks.append(cur)
from PIL import ImageFont
FONT_PATH='public/theboldfont.ttf'; MAXW=1880  # ancho útil (de 2160) para no tocar los bordes
def fit_size(texts,start=190):
    size=start
    while size>60:
        f=ImageFont.truetype(FONT_PATH,size)
        if max(f.getlength(t) for t in texts)<=MAXW: return size
        size-=4
    return size
SIZE=fit_size([" ".join(w[0] for w in c) for c in chunks])
def ts(t):
    h=int(t//3600);m=int(t%3600//60);s=t%60
    return f"{h}:{m:02d}:{s:05.2f}"
hdr=f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Sub,The Bold Font,{SIZE},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,2,0,1,14,5,2,120,120,1050,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
ev=[]
for ci,c in enumerate(chunks):
    for i,(t,s,e) in enumerate(c):
        start=s if i>0 else max(s-0.05,0)
        end=c[i+1][1] if i+1<len(c) else (chunks[ci+1][0][1] if ci+1<len(chunks) and chunks[ci+1][0][1]-e<0.4 else e+0.25)
        txt=" ".join(("{\\c&H00D7FF&}"+w[0]+"{\\c&HFFFFFF&}") if j==i else w[0] for j,w in enumerate(c))
        ev.append(f"Dialogue: 0,{ts(start)},{ts(end)},Sub,,0,0,0,,{{\\an2\\pos({W//2},{H-1050})}}{txt}")
open('media/work/subs.ass','w').write(hdr+"\n".join(ev)+"\n")
print("\n".join(" ".join(w[0] for w in c) for c in chunks))
