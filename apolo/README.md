# Apolo Karaoke Gastro Bar — video de inauguración

Cuatro clips (IMG_1825, 1827, 1829, 1830, carpeta de Drive "A") recortados para
que arranquen justo al hablar (`in`/`out` en `subtitulos.json`), subtítulos
palabra por palabra (blanco con la palabra activa en dorado de la marca) y un
cierre de 3.5 s con el logo.

- `subtitulos.json`: texto revisado y tiempos de cada palabra (transcrito con
  Whisper small en español y corregido a mano: "cócteles", "Altamira").
- `make_ass.py`: genera los subtítulos ASS.
- `make_music.py`: música original generada por código (ukelele, bajo, palmas,
  campanitas; Do mayor, 118 bpm), sin derechos de autor. El "ta-da" cae al entrar el logo.
- `build.sh`: convierte HDR (HLG) 4K 120 fps a SDR 1080x1920 30 fps, normaliza
  el audio, quema los subtítulos, mezcla la música (baja sola cuando hablan) y
  añade el logo (`media/logo.jpg`).

Salida: `out/Apolo_Gastrobar_subtitulado.mp4` (H.264 CRF 16, AAC 320 kbps).
Para corregir un subtítulo: editar `subtitulos.json` y volver a ejecutar `apolo/build.sh`.
