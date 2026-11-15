# Apolo — video de eventos (IMG_0384, IMG_0387, IMG_0389)

Salida: `out/Apolo_Eventos.mp4` (17 s, 1080x1920) y `out/Apolo_Eventos_WhatsApp.mp4`.

- `edit.json`: piezas de cada clip con su velocidad (x2–x4 = cámara rápida en el
  "ya" del inicio, la decoración y las luces) y las palabras de los subtítulos.
- `build.py`: corta, acelera, une con transiciones, subtítulos palabra por palabra
  (palabra activa en dorado), logo semitransparente en la esquina, música original
  (`apolo/make_music.py`, baja sola cuando hablan) y cierre animado.
- `end_card.py`: cierre con el logo (fondo carbón, destellos dorados, zoom y brillo).

Los videos fuente van en `media/nuevo/raw/` (ignorado por git).
