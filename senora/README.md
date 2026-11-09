# Video de la señora — evento en Apolo

Fuente: carpeta de Drive "Apolo" (VID-20261108-WA0014 y WA0016; WA0042 es otro
video, del cantante, y no se usa). Resultado: `out/Senora_evento_Apolo.mp4`, 80 s,
1080x1920, con subtítulos.

- `cortes.json`: los 14 cortes (inicio/fin en el video original) y el texto de los
  subtítulos. Solo se subtitulan frases claras; el ruido del público no.
- `make_subs.py`: genera los subtítulos (máx. 2 líneas de ~15 caracteres).
- `build.sh`: corta, reduce ruido y bloques de WhatsApp, escala a 1080x1920 con
  nitidez suave, normaliza el audio y quema los subtítulos.
