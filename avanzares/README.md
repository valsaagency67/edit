# Huroban Sabores Sorprendentes — video de opiniones de clientes

(La carpeta se llama `avanzares` por el nombre de trabajo inicial; la marca correcta es **Sabores Sorprendentes**.)

Video vertical 1080x1920 (Reels/TikTok), ~61 s: intro con la pregunta y luego solo las respuestas (sin las preguntas),
con cortes entre respuestas y subtítulos palabra por palabra. **Sin música**: la canción se agrega directamente en Instagram.
El último clip (IMG_0321) va completo, solo sin la pregunta.

## Material (Google Drive, Mi unidad)

| Archivo | Contenido | ID |
|---|---|---|
| IMG_0309.MOV | Intro: "Vamos a preguntarle a algunos clientes..." | 19sNsHGXd2JrJaLmxBkatNRPUm-jKdTmZ |
| IMG_0312.MOV | Chico de camiseta amarilla + Cristian | 1p2ia_8kUFqMRvAD-qsGDRZRVibsWW4EC |
| IMG_0314.MOV | Valentina | 1o3pnKt-w71FNkR2LaLgGdYB74KC2bbFO |
| IMG_0319.MOV | Chico de gorra | 1jhgiVWpbf-ADnTklEo4IDfrZl_dXJOHV |
| IMG_0321.MOV | Pareja (va de último, completo) | 1WnqlMWYlcCb4vb3jMVjM0WnuMvSSHs6h |

## Cómo regenerar

```bash
# 1. Descargar los videos a media/raw/ (gdown <id> -O media/raw/IMG_XXXX.MOV)
# 2. Cortes + subtítulos (genera public/avanzares/montaje.mp4, captions.json, meta.json)
python3 avanzares/build.py            # --solo-subs para regenerar solo subtítulos
# 3. Render final
npx remotion render SaboresSorprendentes out/Sabores_Sorprendentes.mp4 --crf=14 --x264-preset=slow --jpeg-quality=100 --audio-bitrate=320k
```

- `transcripcion_whisper.json`: transcripción automática (faster-whisper large-v3, español)
  generada con `transcribe.py`. Las correcciones de palabras están en `build.py` (`REPLACE`).
- Composición: `src/Avanzares/index.tsx`.
- Portada (1080x1920): `src/Avanzares/Portada.tsx`. Usa cuadros del montaje:
  ```bash
  for p in "300 amarillo" "760 valentina" "1000 gorra" "1450 pareja"; do set -- $p
    ffmpeg -y -i public/avanzares/montaje.mp4 -vf "select='eq(n\,$1)'" -frames:v 1 -fps_mode vfr public/avanzares/portada/$2.png; done
  npx remotion still PortadaSaboresSorprendentes out/Portada_Huroban_Sabores_Sorprendentes.png
  ```
- 5 portadas alternativas: `src/Avanzares/Portadas.tsx` (composiciones `PortadaOpcion1`…`PortadaOpcion5`).
  Usan cuadros 4K de los originales en `public/avanzares/portadas/` (stand: IMG_0321 0.6 s;
  productos_mesa: recorte de IMG_0321 21.9 s) y `logo_rojo.png` / `logo_blanco.png`.
  Opción 2 usa `pareja_sonrie.png` (IMG_0321 en 0 s, ambos sonriendo), mejorada con:
  `ffmpeg -ss 0 -i media/raw/IMG_0321.MOV -frames:v 1 -vf "crop=1350:2400:395:437,hqdn3d=1.2:1.2:0:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6:5:5:0,eq=contrast=1.07:saturation=1.12:brightness=0.015:gamma=1.04,colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02" public/avanzares/portadas/pareja_sonrie.png`

## Créditos

Fuente: Montserrat (SIL Open Font License).
