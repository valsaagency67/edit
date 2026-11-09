#!/usr/bin/env bash
# Videos de la señora (evento en Apolo): uno por cada grabacion, cortos, con
# calidad mejorada, audio con voz mas clara y subtitulos.
# Requiere media/senora/raw/VID-20261108-WA0014.mp4 y WA0016.mp4 (ignorados por git).
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=media/senora/raw; WORK=media/senora/work; OUT=out; FPS=30
mkdir -p "$WORK" "$OUT"
VF="hqdn3d=2:1.5:4:3,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0,eq=contrast=1.03:saturation=1.03,fps=$FPS,format=yuv420p"
# Voz mas clara: sin retumbe (graves), menos "barro" (300 Hz), mas presencia (2.8 kHz),
# agudos menos chillones, volumen parejo. (La supresion de ruido fuerte se probo y
# deformaba la voz, porque el fondo es publico hablando y eco del parlante.)
AF="highpass=f=110,equalizer=f=300:t=q:w=1:g=-3,equalizer=f=2800:t=q:w=1.2:g=4,equalizer=f=8000:t=q:w=1:g=-3,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=200:makeup=1.5"

declare -A NAME=( [VID-20261108-WA0014.mp4]=Senora_1_Reflexologia [VID-20261108-WA0016.mp4]=Senora_2_Trivia_Apolo )
for SRC in VID-20261108-WA0014.mp4 VID-20261108-WA0016.mp4; do
  N=${NAME[$SRC]}; : > "$WORK/$N.v.txt"; : > "$WORK/$N.a.txt"
  python3 -c "
import json
for i,s in enumerate(json.load(open('senora/cortes.json'))['segmentos']):
    if s['file']=='$SRC': print(i, s['in'], s['out'])
" | while read -r i a b; do
    k=$(printf %02d $i); d=$(awk -v a=$a -v b=$b 'BEGIN{printf "%.3f", b-a}')
    [ -f "$WORK/v_$k.mp4" ] || ffmpeg -v error -y -ss $a -i "$RAW/$SRC" -t $d -an -vf "$VF" \
        -c:v libx264 -preset slow -crf 14 "$WORK/v_$k.mp4" < /dev/null
    ffmpeg -v error -y -ss $a -i "$RAW/$SRC" -t $d -vn -ac 1 -ar 48000 \
        -af "afade=t=in:d=0.04,areverse,afade=t=in:d=0.06,areverse,$AF" "$WORK/a_$k.wav" < /dev/null
    echo "file '$(pwd)/$WORK/v_$k.mp4'" >> "$WORK/$N.v.txt"
    echo "file '$(pwd)/$WORK/a_$k.wav'" >> "$WORK/$N.a.txt"
  done
  python3 senora/make_subs.py senora/cortes.json "$WORK/$N.ass" "$SRC"
  T=$(awk '{gsub(/file |'"'"'/,""); print}' "$WORK/$N.v.txt" | xargs -I{} ffprobe -v error -show_entries format=duration -of csv=p=0 {} | awk '{s+=$1} END{printf "%.3f", s}')
  ffmpeg -v error -y -f concat -safe 0 -i "$WORK/$N.v.txt" -f concat -safe 0 -i "$WORK/$N.a.txt" \
    -vf "subtitles=$WORK/$N.ass,fade=t=in:d=0.3,fade=t=out:st=$(awk -v t=$T 'BEGIN{print t-0.4}'):d=0.4,format=yuv420p" \
    -af "loudnorm=I=-14:TP=-1.5:LRA=8,afade=t=out:st=$(awk -v t=$T 'BEGIN{print t-0.4}'):d=0.4,aresample=48000" -ac 2 \
    -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 256k -shortest \
    -movflags +faststart "$OUT/$N.mp4"
  ffmpeg -v error -y -i "$OUT/$N.mp4" -c:v libx264 -preset slow -crf 22 -maxrate 4M -bufsize 8M \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$OUT/${N}_WhatsApp.mp4"
  echo "Listo: $OUT/$N.mp4 ($T s)"
done
