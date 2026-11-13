# Conversión HDR (HLG/Dolby Vision del iPhone) -> SDR BT.709.
# ffmpeg aplica la rotación del metadato automáticamente.
TONEMAP="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=2,zscale=t=bt709:m=bt709:r=tv"
RAW_DIR="media/raw"
