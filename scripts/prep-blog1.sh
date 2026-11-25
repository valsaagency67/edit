#!/usr/bin/env bash
# Convierte los clips completos de los originales (iPhone + Blackmagic Cam,
# Apple Log 10-bit HEVC 4K) a intermedios graduados a Rec.709 para Remotion.
#  - Verticales   -> 1080x1920
#  - Horizontales -> 3414x1920 (permite recortar 9:16 sin reescalar hacia arriba)
# Cada intermedio empieza en <inicio> del original: ese desfase está en
# src/Blog1/clips.ts (CLIP_OFFSETS) y debe coincidir con la tabla de abajo.
# Uso: scripts/prep-blog1.sh [carpeta_originales] [lut.cube] [carpeta_salida]
set -euo pipefail
SRC=${1:-media/raw/blog1}; LUT=${2:-scripts/applelog_709.cube}; OUT=${3:-public/blog1}
mkdir -p "$OUT"
# id  inicio  fin (segundos del original)
RANGES="
C074 0 4.10
C075 0 12.93
C076 0 32.54
C084 0 35.63
C087 0 21.97
C090 0 35.88
C094 0 142.15
C099 0 42.77
C105 0 3.73
C110 0 17.45
C113 0 15.73
C115 0 15.80
C116 0 12.97
"
echo "$RANGES" | while read -r id a b; do
  [ -z "$id" ] && continue
  [ -f "$OUT/$id.mp4" ] && continue
  f=$(ls "$SRC"/*_"$id".mov)
  rot=$(ffprobe -v error -select_streams v:0 -show_entries stream_side_data=rotation -of csv=p=0 "$f" | head -1)
  read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$f" | head -1 | tr x ' ')
  if [ "${rot#-}" = "90" ]; then t=$w; w=$h; h=$t; fi   # dimensiones como se ven
  if [ "$h" -gt "$w" ]; then size="1080:1920"; else size="3414:1920"; fi
  ffmpeg -nostdin -v error -y -ss "$a" -to "$b" -i "$f" -map 0:v:0 -map 0:a:0 \
    -vf "scale=$size:flags=lanczos,format=rgb48le,lut3d=$LUT:interp=tetrahedral,format=yuv420p" \
    -c:v libx264 -preset fast -crf 14 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:a aac -b:a 320k -movflags +faststart "$OUT/$id.tmp.mp4"
  mv "$OUT/$id.tmp.mp4" "$OUT/$id.mp4"
  echo "ok $id ($size)"
done
