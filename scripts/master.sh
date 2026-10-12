#!/usr/bin/env bash
# Master de calidad máxima para el render final, generado directo del original:
# rotación + escalado lanczos 4K->1080x1920 + HDR(HLG)->SDR BT.709 + 60 fps CFR,
# ProRes 422 HQ 10-bit + audio PCM 48 kHz (sin pérdida generacional visible).
# El HDR->SDR usa media/lut/hlg2sdr_hable.png: la misma conversión de
# scripts/hdr.sh horneada en una LUT 3D (40 dB PSNR vs. el filtro directo, ~2x más rápido).
# Uso: scripts/master.sh IMG_XXXX.MOV [inicio_s duración_s]
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/hdr.sh
LUT=media/lut/hlg2sdr_hable.png
if [ ! -s "$LUT" ]; then
  mkdir -p media/lut
  ffmpeg -v error -y -f lavfi -i haldclutsrc=level=8 -frames:v 1 -vf \
    "format=gbrp16le,setparams=color_trc=arib-std-b67:color_primaries=bt2020:colorspace=gbr:range=pc,zscale=m=2020_ncl:r=limited,format=yuv444p16le,setparams=colorspace=bt2020nc:range=tv,$TONEMAP,format=gbrp16le" \
    -pix_fmt rgb48be "$LUT"
fi
f="$1"; ss="${2:-}"; dur="${3:-}"
mkdir -p public/master
seek=(); [ -n "$ss" ] && seek+=(-ss "$ss"); [ -n "$dur" ] && seek+=(-t "$dur")
out="public/master/${f%.*}${ss:+_${ss}s}.mov"
SWS="accurate_rnd+full_chroma_int"
ffmpeg -v error -stats -y "${seek[@]}" -i "$RAW_DIR/$f" -i "$LUT" -filter_complex \
  "[0:v]fps=60,scale=1080:1920:flags=lanczos+$SWS:in_color_matrix=bt2020:in_range=tv:out_range=pc,format=rgb48le[v];[1:v]format=rgb48le[l];[v][l]haldclut=interp=tetrahedral,scale=out_color_matrix=bt709:out_range=tv:flags=$SWS,format=yuv422p10le,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv[o]" \
  -map "[o]" -map 0:a:0 -c:v prores_aw -profile:v 3 -vendor apl0 -c:a pcm_s16le -ar 48000 "$out.tmp.mov"
mv "$out.tmp.mov" "$out"
echo "$out"
