# Huroban Sabores Sorprendentes — video de opiniones de clientes

(La carpeta se llama `avanzares` por el nombre de trabajo inicial; la marca correcta es **Sabores Sorprendentes**.)

Video vertical 1080x1920 (Reels/TikTok), ~44 s: intro con la pregunta y luego solo las respuestas (sin las preguntas), con cortes entre
respuestas, subtítulos palabra por palabra y música urbana de fondo.

## Material (Google Drive, Mi unidad)

| Archivo | Contenido | ID |
|---|---|---|
| IMG_0309.MOV | Intro: "Vamos a preguntarle a algunos clientes..." | 19sNsHGXd2JrJaLmxBkatNRPUm-jKdTmZ |
| IMG_0312.MOV | Chico de camiseta amarilla + Cristian | 1p2ia_8kUFqMRvAD-qsGDRZRVibsWW4EC |
| IMG_0314.MOV | Valentina | 1o3pnKt-w71FNkR2LaLgGdYB74KC2bbFO |
| IMG_0319.MOV | Chico de gorra | 1jhgiVWpbf-ADnTklEo4IDfrZl_dXJOHV |

## Cómo regenerar

```bash
# 1. Descargar los videos a media/raw/ (gdown <id> -O media/raw/IMG_XXXX.MOV)
# 2. Música a public/avanzares/musica.mp3:
curl -o public/avanzares/musica.mp3 https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/e9XxUl5gCqTzMRIREXHtMtc0aiIovSbftnvKUUUu.mp3
# 3. Cortes + subtítulos (genera public/avanzares/montaje.mp4, captions.json, meta.json)
python3 avanzares/build.py            # --solo-subs para regenerar solo subtítulos
# 4. Render final
npx remotion render SaboresSorprendentes out/Sabores_Sorprendentes.mp4 --crf=14 --x264-preset=slow --jpeg-quality=100 --audio-bitrate=320k
```

- `transcripcion_whisper.json`: transcripción automática (faster-whisper large-v3, español)
  generada con `transcribe.py`. Las correcciones de palabras están en `build.py` (`REPLACE`).
- Composición: `src/Avanzares/index.tsx`.

## Créditos (poner en la descripción de la publicación)

Música: "Escapada" de Beat Mekanik — licencia CC BY 4.0
(https://freemusicarchive.org/music/beat-mekanik/single/escapada).
Fuente: Montserrat (SIL Open Font License).
