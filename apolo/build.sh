#!/usr/bin/env bash
# Video Apolo Karaoke Gastro Bar: 4 clips + subtitulos + cierre con logo.
# Requiere: media/raw/IMG_18{25,27,29,30}.MOV y media/logo.jpg (ignorados por git).
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=media/raw; WORK=media/work; OUT=out
FPS=30; LOGO_DUR=3.5; XF=0.5
mkdir -p "$WORK" "$OUT"
CLIPS=(IMG_1825 IMG_1827 IMG_1829 IMG_1830)

# 1) HDR (HLG) 4K 120fps -> SDR 1080x1920 30fps, audio normalizado
TONEMAP="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,scale=1080:1920:flags=lanczos,eq=saturation=1.06:contrast=1.02,fps=$FPS,format=yuv420p"
: > "$WORK/duraciones.txt"; : > "$WORK/lista.txt"
for c in "${CLIPS[@]}"; do
  read -r IN TOUT < <(python3 -c "import json,sys; c=[x for x in json.load(open('apolo/subtitulos.json'))['clips'] if x['file']=='$c.MOV'][0]; print(c['in'], c['out'])")
  if [ ! -f "$WORK/$c.mp4" ] || [ "$(cat "$WORK/$c.cut" 2>/dev/null)" != "$IN $TOUT" ]; then
    DUR=$(awk -v a=$IN -v b=$TOUT 'BEGIN{printf "%.3f", b-a}')
    ffmpeg -v error -y -ss $IN -i "$RAW/$c.MOV" -t $DUR -map 0:v:0 -map 0:a:0 -vf "$TONEMAP" \
      -c:v libx264 -preset slow -crf 12 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      -af "afade=t=in:d=0.03,areverse,afade=t=in:d=0.03,areverse,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 320k -ac 2 "$WORK/$c.tmp.mp4"
    mv "$WORK/$c.tmp.mp4" "$WORK/$c.mp4"; echo "$IN $TOUT" > "$WORK/$c.cut"
  fi
  ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$WORK/$c.mp4" \
    | awk -v f=$FPS '{printf "%.4f\n", $1/f}' >> "$WORK/duraciones.txt"
  echo "file '$(pwd)/$WORK/$c.mp4'" >> "$WORK/lista.txt"
done

# 2) Subtitulos
python3 apolo/make_ass.py apolo/subtitulos.json "$WORK/duraciones.txt" "$WORK/subs.ass"
TOTAL=$(awk '{s+=$1} END {printf "%.4f", s}' "$WORK/duraciones.txt")
XOFF=$(awk -v t=$TOTAL -v x=$XF 'BEGIN{printf "%.4f", t-x}')

# 3) Union de clips + subtitulos + cierre con logo (fundido)
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/lista.txt" \
  -loop 1 -framerate $FPS -t $LOGO_DUR -i media/logo.jpg \
  -f lavfi -t $LOGO_DUR -i anullsrc=r=48000:cl=stereo \
  -filter_complex "
    [0:v]subtitles=$WORK/subs.ass,fps=$FPS,settb=1/$FPS,setsar=1,format=yuv420p[main];
    [1:v]scale=1080:-2:flags=lanczos,setsar=1,split=3[lg][lt][lb];
    [lt]crop=iw:6:0:0,scale=1080:410[top];
    [lb]crop=iw:6:0:ih-6,scale=1080:ih*0+490[bot];
    [top][lg][bot]vstack=3,crop=1080:1920:0:0,
        scale=w='trunc(1080*(1+0.05*t/$LOGO_DUR)/2)*2':h=-2:eval=frame,crop=1080:1920,
        fps=$FPS,settb=1/$FPS,setsar=1,format=yuv420p[end];
    [main][end]xfade=transition=fade:duration=$XF:offset=$XOFF[v];
    [0:a][2:a]acrossfade=d=$XF:c1=tri:c2=tri[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -movflags +faststart "$OUT/Apolo_Gastrobar_subtitulado.mp4"
echo "Listo: $OUT/Apolo_Gastrobar_subtitulado.mp4"
