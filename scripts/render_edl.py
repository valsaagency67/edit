#!/usr/bin/env python3
"""Renderiza una lista de edición del editor de petición desde los ORIGINALES (media/raw).

Entrada: un JSON con la lista exportada por el editor (campo "timeline": clip, in, out).
Salida: out/<nombre>.mp4 a 1080x1920, 30 fps, H.264 CRF 14, AAC 320 kbps, con la
conversión HDR (HLG) -> SDR BT.709 de scripts/hdr.sh.

Uso: python3 scripts/render_edl.py lista.json out/peticion.mp4
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=2,zscale=t=bt709:m=bt709:r=tv")


def main():
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    out = sys.argv[2]
    segs = data["timeline"]
    if not segs:
        sys.exit("La lista está vacía.")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for s in segs:
        src = f"{ROOT}/media/raw/{s['clip']}.MOV"
        if not os.path.exists(src):
            sys.exit(f"Falta el original: {src}")
        cmd += ["-ss", str(s["in"]), "-t", str(round(s["out"] - s["in"], 3)), "-i", src]
    parts = []
    for i in range(len(segs)):
        parts.append(f"[{i}:v]fps=30,zscale=w=1080:h=1920:f=lanczos,{TONEMAP},format=yuv420p,setsar=1,setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[{i}:a]aresample=48000,asetpts=PTS-STARTPTS[a{i}]")
    inputs = "".join(f"[v{i}][a{i}]" for i in range(len(segs)))
    parts.append(f"{inputs}concat=n={len(segs)}:v=1:a=1[vo][ao]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[vo]", "-map", "[ao]",
            "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
            "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True, cwd=ROOT)
    print("listo", out)


if __name__ == "__main__":
    main()
