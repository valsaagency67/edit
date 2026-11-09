# Videos de la señora — evento en Apolo

Fuente: carpeta de Drive "Apolo". Dos videos separados, uno por grabación
(WA0042 es del cantante y no se usa):

- `out/Senora_1_Reflexologia.mp4` (35 s) — de VID-20261108-WA0014
- `out/Senora_2_Trivia_Apolo.mp4` (45 s, con música de fondo original; termina en la celebración del ganador) — de VID-20261108-WA0016
- Versiones livianas `*_WhatsApp.mp4` para enviar por WhatsApp.

Archivos:
- `cortes.json`: cortes (inicio/fin en el original) y texto de subtítulos.
- `make_subs.py`: subtítulos (máx. 2 líneas de ~15 caracteres).
- `build.sh`: corta, mejora la imagen (menos ruido/bloques, 1080x1920, nitidez),
  da claridad a la voz con ecualización y quema los subtítulos.
- `denoise.py`: supresión de ruido con RNNoise. Se probó y NO se usa: el fondo es
  público hablando y eco del parlante, y al quitarlo la voz se deformaba.
