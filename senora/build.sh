#!/usr/bin/env bash
# Video de la señora (evento en Apolo): 90 s maximo, calidad mejorada y subtitulos.
# Requiere media/senora/raw/VID-20261108-WA0014.mp4 y WA0016.mp4 (ignorados por git).
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=media/senora/raw; WORK=media/senora/work; OUT=out; FPS=30
mkdir -p "$WORK" "$OUT"
# Mejora: reduccion de ruido/bloques de WhatsApp, escalado a 1080x1920, nitidez suave
VF="hqdn3d=2:1.5:4:3,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0,eq=contrast=1.03:saturation=1.03,fps=$FPS,format=yuv420p"
AF="highpass=f=80,afftdn=nf=-28,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000"
: > "$WORK/lista.txt"
python3 -c "
import json
for i,s in enumerate(json.load(open('senora/cortes.json'))['segmentos']): print(i, s['file'], s['in'], s['out'])
" | while read -r i f a b; do
  o="$WORK/seg_$(printf %02d $i).mp4"
  d=$(awk -v a=$a -v b=$b 'BEGIN{printf "%.3f", b-a}')
  ffmpeg -v error -y -ss $a -i "$RAW/$f" -t $d -vf "$VF" \
    -af "afade=t=in:d=0.04,areverse,afade=t=in:d=0.06,areverse,$AF" \
    -c:v libx264 -preset slow -crf 14 -c:a aac -b:a 256k -ac 2 "$o" < /dev/null
  echo "file '$(pwd)/$o'" >> "$WORK/lista.txt"
done
python3 senora/make_subs.py senora/cortes.json "$WORK/subs.ass"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/lista.txt" \
  -vf "subtitles=$WORK/subs.ass,format=yuv420p" -af "loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000" \
  -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 256k \
  -movflags +faststart "$OUT/Senora_evento_Apolo.mp4"
echo "Listo: $OUT/Senora_evento_Apolo.mp4"
