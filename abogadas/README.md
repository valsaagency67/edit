# Videos de consultoría — Enso Jurídicos

Videos verticales (pensión, cartera vencida y sucesión) editados con `build.py` (FFmpeg + libass, sin Remotion).

```
python3 abogadas/build.py abogadas/pension.config.json   # → out/abogadas/pension.mp4 y pension-celular.mp4
python3 abogadas/build.py abogadas/cartera.config.json   # → out/abogadas/cartera.mp4 y cartera-celular.mp4
python3 abogadas/build.py abogadas/sucesion.config.json  # → out/abogadas/sucesion.mp4 y sucesion-celular.mp4
```
(`--draft` para un borrador rápido). Originales en `media/abogadas/` (no versionados).

## Ediciones (las que pidió el cliente en el otro chat)
- **Efectos de sonido del video de referencia del cliente** («Usá estos 4 efectos de sonido…»), **sin el
  primero («faaahh»)**: `sfx/click.wav`, `magic.wav`, `whoosh.wav`, `shutter.wav` (los mismos que se sacaron
  para el video de Nia). Segunda versión: el cliente pidió **menos sonidos en los textos**, así que los
  subtítulos ya no suenan y quedan ~10 efectos por video, más bajos: un clic suave por texto grande (en
  las listas, solo el primer ítem), whoosh al entrar a una toma de apoyo o en un zoom sin otro sonido
  cerca, obturador + destello en los cambios de tema, magic reveal solo en la marca, clic en el sello.
- **Tomas de apoyo** (`apoyo.py`, pedidas por el cliente). No hay material de archivo (los bancos de video
  están bloqueados en este entorno y no hay nada en el Drive), así que son gráficos animados en azul noche y
  dorado: reloj de arena, semanas cotizadas, documento con lupa, facturas con sello «VENCIDA», curva de
  liquidez y escudo. Se configuran en `inserts` de cada `*.config.json`. En «Enso Jurídicos» el cliente
  pidió seguir con el video normal (sin el acercamiento a la biblioteca, `Bookshelf` quedó sin usar).
- **Cortes en todas las pausas** (silencios > 0.22 s detectados en el audio, margen 0.05/0.10 s).
  Verificado con Whisper sobre el resultado: no se pierde ninguna palabra.
- **Subtítulos palabra por palabra**: Montserrat ExtraBold 86 px, mayúsculas, blancos con contorno negro,
  palabra activa en dorado `#F2C14E`, bloques de máx. 3 palabras, centro en y = 1400 (debajo de la cara).
- **Textos grandes** en cajas azul noche `#13294B` (Montserrat Black), arriba de la cabeza (y ≈ 560), dentro
  del recorte 4:5 de Instagram. Solo frases que se dicen en el video.
- **Zoom** sobre la cara (1.18–1.25×): seco en los cortes, suave (0.25 s) dentro de una toma.
- **Voz**: RNNoise (`models/rnnoise-std.rnnn`), EQ de presencia, compresor; mezcla final -14 LUFS, pico -1 dBFS.
- Formato: 1080x1920, 30 fps, H.264 CRF 16, AAC 320 kbps. El de pensión viene en 576x1024 y se escala.

## Sucesión
- Primer plano tipo selfie (720x1280): subtítulos en y = 1460 y textos grandes a la altura del pecho
  (`cap_y`, `big_y`, `y` por texto) para no tapar la cara.
- **Primera frase ampliada a 1.5×** (`zoom_start`): el cliente pidió que no se viera la axila en los bordes.
- Tomas de apoyo propias: árbol de herederos, adjudicación (documento con lupa), notaría (firma y sello),
  mazo judicial y escudo («merecen protección»).

## Por confirmar con el cliente
- Nombre de la firma: Whisper lo oye «Enso Jurídicos» (una vez «Enzo»). Si se escribe distinto (p. ej. «Ensō»),
  cambiar `lines` en los dos `*.config.json`.

Fuentes: Montserrat y Anton (SIL OFL, `fonts/OFL-*.txt`); Montserrat instanciada a pesos fijos desde la variable.
