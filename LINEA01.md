# Línea 01 — videos y carruseles de ropa

Material en Drive: carpeta "Linea nia"
(https://drive.google.com/drive/folders/1IMwJnSN8J4NM4B8OUVV0jY2PIpoD2lO5).
Todo el material del cliente vive en `media/` y `public/linea01/` (ignorados por git).

Reglas: a **todos** los videos se les quita el audio original (van `muted`);
el sonido es solo música. Render final 1080x1920, H.264 `--crf=16`, audio 320 kbps.

## Piezas (composiciones en la carpeta `Linea01` del Studio)

| Composición | Qué es | Estado |
|---|---|---|
| `Carrusel-<outfit>-<n>` | Láminas 1080x1350 para carrusel de Instagram, una por foto | Listo (`out/carrusel/`) |
| `ReelFotos` | Reel vertical con todas las fotos y transiciones animadas | Listo, sin música |
| `TransicionOutfits` | Cambio de outfit con los videos, en corte seco al ritmo del TikTok de referencia `ssstik ...161` (cortes en 0.77, 1.77, 2.9, 3.8 s) y con su audio | Listo (`out/linea01-transicion-outfits.mp4`) |
| `VideoDedos` | IMG_0684.MOV (empieza moviendo los dedos), solo con el audio del TikTok `ssstik ...939` (8.7 s), arrancando en 0.5 s para que la mano se aparte en el mismo beat | Listo (`out/linea01-video-dedos.mp4`) |
| `GiroParedBlanca` | Pared blanca: se da vuelta con el vinotinto (IMG_0685, desde 2.067 s) y termina el giro con el blanco/rojo (IMG_0688, desde 1.2 s). Corte a mitad del giro en el golpe de 1.73 s del audio `ssstik ...161` | Listo (`out/linea01-giro-pared-blanca.mp4`) |

## Outfits (fotos)

- `jeanCeleste`: body celeste + jean bota ancha — IMG_0578, 0589, 0596, 0605, 0606
- `vinotintoCafe`: top vinotinto + leggins café — IMG_0669, 0674
- `rojoBlanco`: top blanco/rojo + leggins rojo — IMG_0689, 0694, 0698, 0701
- Los 6 DNG (IMG_0557, 0564, 0565, 0569, 0631, 0635) están en `media/raw/fotos_dng/`, sin usar todavía.

## Videos

Bajados con `gdown <id> -O media/raw/IMG_xxxx.MOV`. Todos son HEVC SDR, verticales (4K 60 fps salvo
0595 1080p y 0676 1440x1920 30 fps).

| Video | Contenido | Uso |
|---|---|---|
| IMG_0595 | celeste + jean, parque | Transición, desde 2.0 s |
| IMG_0552 | amarillo + jean, parque | Transición, desde 8.0 s |
| IMG_0553 | rojo + jean, parque | Transición, desde 2.5 s |
| IMG_0676 | vinotinto + café, parque | Transición, desde 0 s |
| IMG_0703 | blanco/rojo + leggins rojo, parque | Transición, desde 2.5 s (plano final) |
| IMG_0550 | amarillo, primer plano de perfil | Sin usar |
| IMG_0684 | dedos a cámara, vinotinto + café | `VideoDedos` |
| IMG_0685, IMG_0688 | pared blanca | `GiroParedBlanca` |

Los tramos se recortan desde el original a `public/linea01/clips/*.mp4` (1080x1920, H.264 crf 12,
30 fps, sin audio), con un crop por clip para que ella quede del mismo tamaño y en el mismo lugar
en cada cambio de outfit:

| Clip | Crop sobre el original (rotado) |
|---|---|
| IMG_0595 | `crop=978:1740:100:147` |
| IMG_0552 | `crop=1566:2784:456:672` |
| IMG_0553 | `crop=1568:2786:95:698` |
| IMG_0676 | `crop=864:1536:288:376` |
| IMG_0703 | sin crop |
| IMG_0684 | sin crop, 9.5 s completos |
| IMG_0685 | sin crop, desde 2.067 s |
| IMG_0688 | sin crop, desde 1.2 s |

Audios de referencia: `ffmpeg -i ref.mp4 -vn -c:a pcm_s16le public/linea01/audio/ref_XXX.wav`.

## Render

```console
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion still Carrusel-jeanCeleste-1 out/carrusel/jeanCeleste-1.jpg --image-format=jpeg --jpeg-quality=95 --browser-executable=$B
npx remotion render TransicionOutfits out/transicion.mp4 --codec=h264 --crf=16 --audio-bitrate=320k --browser-executable=$B
```

Los audios de referencia salen de ssstik a ~33 kbps; para publicar, lo ideal es
subir el video sin audio y elegir el mismo sonido dentro de TikTok/Instagram.
