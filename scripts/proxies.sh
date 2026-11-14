#!/usr/bin/env bash
# Proxies livianos SOLO para previsualizar en Remotion Studio (540x960, 30 fps).
# Nunca se usan en el render final. Uso: scripts/proxies.sh [IMG_XXXX.MOV ...]
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/hdr.sh
mkdir -p public/proxy
files=("$@"); [ ${#files[@]} -eq 0 ] && files=($(cd "$RAW_DIR" && ls *.MOV))
for f in "${files[@]}"; do
  out="public/proxy/${f%.*}.mp4"
  [ -s "$out" ] && { echo "ya existe $out"; continue; }
  echo "proxy $f"
  ffmpeg -v error -y -i "$RAW_DIR/$f" -map 0:v:0 -map 0:a:0 \
    -vf "fps=30,zscale=w=540:h=960:f=bicubic,$TONEMAP,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 26 -g 15 -c:a aac -b:a 128k -ar 48000 \
    -movflags +faststart "$out.tmp.mp4"
  mv "$out.tmp.mp4" "$out"
done
