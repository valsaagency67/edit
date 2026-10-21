# Videos de consultoría — Enso Jurídicos

Dos videos verticales (pensión y cartera vencida) editados con `build.py` (FFmpeg + libass, sin Remotion).

```
python3 abogadas/build.py abogadas/pension.config.json   # → out/abogadas/pension.mp4 y pension-celular.mp4
python3 abogadas/build.py abogadas/cartera.config.json   # → out/abogadas/cartera.mp4 y cartera-celular.mp4
```
(`--draft` para un borrador rápido). Originales en `media/abogadas/` (no versionados).

## Ediciones (las que pidió el cliente en el otro chat)
- **Efectos de sonido del video de referencia del cliente** («Usá estos 4 efectos de sonido…»), **sin el
  primero («faaahh»)**: `sfx/click.wav`, `magic.wav`, `whoosh.wav`, `shutter.wav` (los mismos que se sacaron
  para el video de Nia). Uso: clic en cada subtítulo (suave) y en cada texto grande; whoosh en cada
  acercamiento/alejamiento; obturador + destello cálido en los cambios de tema; magic reveal al revelar la
  marca y el cierre.
- **Cortes en todas las pausas** (silencios > 0.22 s detectados en el audio, margen 0.05/0.10 s).
  Verificado con Whisper sobre el resultado: no se pierde ninguna palabra.
- **Subtítulos palabra por palabra**: Montserrat ExtraBold 86 px, mayúsculas, blancos con contorno negro,
  palabra activa en dorado `#F2C14E`, bloques de máx. 3 palabras, centro en y = 1400 (debajo de la cara).
- **Textos grandes** en cajas azul noche `#13294B` (Montserrat Black), arriba de la cabeza (y ≈ 560), dentro
  del recorte 4:5 de Instagram. Solo frases que se dicen en el video.
- **Zoom** sobre la cara (1.18–1.25×): seco en los cortes, suave (0.25 s) dentro de una toma.
- **Voz**: RNNoise (`models/rnnoise-std.rnnn`), EQ de presencia, compresor; mezcla final -14 LUFS, pico -1 dBFS.
- Formato: 1080x1920, 30 fps, H.264 CRF 16, AAC 320 kbps. El de pensión viene en 576x1024 y se escala.

## Por confirmar con el cliente
- Nombre de la firma: Whisper lo oye «Enso Jurídicos» (una vez «Enzo»). Si se escribe distinto (p. ej. «Ensō»),
  cambiar `lines` en los dos `*.config.json`.

Fuentes: Montserrat y Anton (SIL OFL, `fonts/OFL-*.txt`); Montserrat instanciada a pesos fijos desde la variable.
