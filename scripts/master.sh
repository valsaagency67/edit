#!/usr/bin/env bash
# Master de calidad máxima para el render final, generado directo del original:
# rotación + HDR->SDR + escalado lanczos 4K->1080x1920, 60 fps CFR,
# ProRes 422 HQ 10-bit + audio PCM 48 kHz (sin pérdida generacional visible).
# Uso: scripts/master.sh IMG_XXXX.MOV [inicio_s duración_s]
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/hdr.sh
f="$1"; ss="${2:-}"; dur="${3:-}"
mkdir -p public/master
seek=(); [ -n "$ss" ] && seek+=(-ss "$ss"); [ -n "$dur" ] && seek+=(-t "$dur")
out="public/master/${f%.*}${ss:+_${ss}s}.mov"
ffmpeg -v error -stats -y "${seek[@]}" -i "$RAW_DIR/$f" -map 0:v:0 -map 0:a:0 \
  -vf "fps=60,zscale=w=1080:h=1920:f=lanczos,$TONEMAP,format=yuv422p10le" \
  -c:v prores_ks -profile:v 3 -vendor apl0 -c:a pcm_s16le -ar 48000 "$out"
echo "$out"
