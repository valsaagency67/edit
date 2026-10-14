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
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=2,zscale=t=bt709:m=bt709:r=tv")


def main():
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    out = sys.argv[2]
    segs = data["timeline"]
    if not segs:
        sys.exit("La lista está vacía.")
    for s in segs:
        if not os.path.exists(f"{ROOT}/media/raw/{s['clip']}.MOV"):
            sys.exit(f"Falta el original: {ROOT}/media/raw/{s['clip']}.MOV")
    # Una toma a la vez (con 6 tomas abiertas a la vez el filtro HDR en float agotaba la memoria y
    # ffmpeg moría con SIGKILL) y luego se unen sin recodificar: todas salen con los mismos parámetros.
    tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(out)))
    parts = []
    for i, s in enumerate(segs):
        part = os.path.join(tmp, f"{i:03d}.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s["in"]), "-t", str(round(s["out"] - s["in"], 3)),
                        "-i", f"{ROOT}/media/raw/{s['clip']}.MOV",
                        "-vf", f"fps=30,zscale=w=1080:h=1920:f=lanczos,{TONEMAP},format=yuv420p,setsar=1",
                        "-af", "aresample=48000", "-c:v", "libx264", "-preset", "slow", "-crf", "14",
                        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
                        "-color_trc", "bt709", "-c:a", "aac", "-b:a", "320k", "-ac", "2",
                        # Cuadros exactos (duración redondeada a 1/30 s) para que la base y la voz cuadren.
                        "-frames:v", str(round((s["out"] - s["in"]) * 30)), part], check=True, cwd=ROOT)
        parts.append(part)
    lst = os.path.join(tmp, "partes.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
                    "-movflags", "+faststart", out], check=True, cwd=ROOT)
    for p in parts + [lst]:
        os.remove(p)
    os.rmdir(tmp)
    print("listo", out)


if __name__ == "__main__":
    main()
