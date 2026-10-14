#!/usr/bin/env bash
# Audio 16 kHz mono para Whisper. Uso: scripts/extract-audio.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p media/audio
for p in media/raw/*.MOV; do
  n=$(basename "${p%.*}")
  [ -s "media/audio/$n.wav" ] || ffmpeg -v error -y -i "$p" -map 0:a:0 -ac 1 -ar 16000 "media/audio/$n.wav"
done
