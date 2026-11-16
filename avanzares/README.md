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

## Créditos

Fuente: Montserrat (SIL Open Font License).
