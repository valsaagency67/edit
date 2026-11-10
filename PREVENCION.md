# Video — Prevención de la violencia contra la mujer

Composición de Remotion `PrevencionViolencia` (1080x1920, 30 fps, ~57 s).
Código en `src/Prevencion/`, clips en `public/psa/`.

## Orden de los clips

| # | Archivo | Lo que se dice |
|---|---|---|
| 1 | `01-intro-caso.mov` | "A continuación te voy a presentar un caso que se dio aquí en Colombia de abuso contra la mujer." |
| — | *(caso real, opcional)* | Se inserta aquí si se pasa `casoSrc`. |
| 2 | `02-no-son-normales.mov` | "Sufrir alguno de estos casos, estas problemáticas no son normales y no es algo que debes dejar pasar." |
| 3 | `03-tipos.mov` | "¿Sabías que estos casos no solamente se ven mediante lo físico, sino que se pueden ver como psicológico, económico y sexual?" |
| 4 | `04-manifestaciones.mov` | "Se pueden manifestar mediante insultos, golpes, humillaciones y control de la persona. ¡No permitas eso!" |
| 5 | `05-prevenir.mov` | "¿Cómo podemos prevenir? Reconociendo las señales de alerta, promoviendo el respeto y la igualdad y promoviendo relaciones libres de violencia." |
| 6 | `06-sin-miedo.mov` | "Recuerda que las mujeres no deben vivir con miedo. Si conoces a alguien que sufre esto, apóyalo, oriéntalo, ayúdalo." |
| 7 | `07-linea-atencion.mov` | "Mira, esta es una línea de atención y que te protegerán, porque recuerda, no estás sola, y recuerda que la violencia se reconoce y se denuncia." |
| 8 | `08-cierre.mov` | "El respeto protege, la indiferencia no." |
| — | Cierre gráfico | Eslogan + "La violencia se reconoce y se denuncia" (+ número si existe). |

Los clips 2–6 siguen el orden en que se enviaron.

## Edición

- Subtítulos palabra por palabra (transcritos con Whisper y corregidos a mano
  en `src/Prevencion/data.ts`), palabra activa en amarillo.
- Cortes con zoom + desenfoque + destello y *whoosh*; alternancia de plano
  abierto/cerrado; golpes de zoom en palabras clave.
- Título de sección al inicio de cada clip, chips de palabras clave
  (tipos de violencia, manifestaciones, prevención, apóyalo/oriéntalo/ayúdalo),
  sellos con sacudida ("NO SON NORMALES", "¡NO PERMITAS ESO!", "NO ESTÁS SOLA").
- Barra de progreso arriba.
- Audio de los clips: filtro paso alto, reducción de ruido y normalización a
  -14 LUFS (el video no se recomprimió al copiarlo). Efectos de sonido
  generados con ffmpeg (`public/sfx/`), sin licencias de terceros.
- Fuentes: Anton y Montserrat Black (OFL). La fuente de la plantilla
  (TheBoldFont) no tiene Í, Ñ ni ¡.

## Pendiente

- **Número de la línea de atención**: no se dice en los clips. Mientras esté
  vacío, la tarjeta muestra `[NÚMERO]` en rojo. Prop `lineaAtencion`.
- **Video del caso real** que anuncia el clip 1: ponerlo en `public/` y pasar
  `casoSrc` (ruta relativa a `public/`).
- Música de fondo con licencia (opcional).
- Los clips recibidos son 720x1280. Con los originales del celular (1080p o
  4K) el render final se vería más nítido.

## Render

```console
npx remotion render src/index.ts PrevencionViolencia out/prevencion-violencia.mp4 \
  --codec=h264 --crf=16 --audio-bitrate=320k \
  --props='{"lineaAtencion":"","casoSrc":"","casoSeconds":0}'
```
