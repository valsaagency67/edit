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
| `TransicionOutfits` | Cambio de outfit en corte seco al ritmo del TikTok de referencia `ssstik ...161` (cortes en 0.77, 1.77, 2.9, 3.8, 4.5 s) | Armado con fotos de relleno; faltan los .MOV |
| `VideoDedos` | IMG_0684.MOV (empieza moviendo los dedos, top vinotinto), solo con el audio del TikTok `ssstik ...939` (8.7 s) | Armado; falta el .MOV |
| — | Los 2 videos en pared blanca | Aparte, se definen después |

## Outfits (fotos)

- `jeanCeleste`: body celeste + jean bota ancha — IMG_0578, 0589, 0596, 0605, 0606
- `vinotintoCafe`: top vinotinto + leggins café — IMG_0669, 0674
- `rojoBlanco`: top blanco/rojo + leggins rojo — IMG_0689, 0694, 0698, 0701
- Los 6 DNG (IMG_0557, 0564, 0565, 0569, 0631, 0635) pesan más de 10 MB y no bajan por la API.

## Videos en Drive (pendientes de descarga)

IMG_0550, 0552, 0553, 0595, 0676, 0684, 0685, 0688, 0703 (.MOV, 25–200 MB).
IMG_0684 = video de los dedos (id 1odjbyqzBmgskGby-iz6agJ5LLmgaoN9Z). Los otros van a la transición de outfits,
menos los 2 de pared blanca (por identificar).
La red del entorno bloquea `drive.google.com` / `drive.usercontent.google.com`
y la API de Drive solo entrega archivos de hasta 10 MB.

## Render

```console
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion still Carrusel-jeanCeleste-1 out/carrusel/jeanCeleste-1.jpg --image-format=jpeg --jpeg-quality=95 --browser-executable=$B
npx remotion render TransicionOutfits out/transicion.mp4 --codec=h264 --crf=16 --audio-bitrate=320k --browser-executable=$B
```

Los audios de referencia salen de ssstik a ~33 kbps; para publicar, lo ideal es
subir el video sin audio y elegir el mismo sonido dentro de TikTok/Instagram.
