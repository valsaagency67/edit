#!/usr/bin/env bash
# Limpia el audio de un clip sin recomprimir el video.
# Uso: tools/limpiar-audio.sh entrada.mov salida.mov
# Cadena: corte de graves (retumbo/viento) -> RNNoise (reducción de ruido
# neuronal, modelo general de voz "somnolent-hogwash" de
# GregorR/rnnoise-models) -> FFT denoise residual -> EQ de presencia ->
# compresión -> normalización a -14 LUFS (TikTok/Reels).
# Sin compuerta: se comía las consonantes suaves ("Sufrir", "¿Sabías").
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
in="$1"; out="$2"
af="aresample=48000,aformat=channel_layouts=mono"
af+=",highpass=f=110:poles=2,highpass=f=110:poles=2"
af+=",arnndn=m=${here}/rnnoise/sh.rnnn"
af+=",afftdn=nr=10:nf=-50:tn=1"
af+=",equalizer=f=300:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3"
af+=",acompressor=threshold=0.08:ratio=3:attack=10:release=150:makeup=2"
af+=",loudnorm=I=-14:TP=-1.5:LRA=7"
ffmpeg -v error -y -i "$in" -map 0:v:0 -map 0:a:0 -c:v copy \
  -af "$af" -ar 48000 -ac 2 -c:a aac -b:a 320k -movflags +faststart "$out"
