# Video — Prevención de la violencia contra la mujer

Composición de Remotion `PrevencionViolencia` (1080x1920, 30 fps, ~57 s).
Código en `src/Prevencion/`, clips en `public/psa/`.

## Orden de los clips

| # | Archivo | Lo que se dice |
|---|---|---|
| 1 | `01-intro-caso.mov` | "A continuación te voy a presentar un caso que se dio aquí en Colombia de abuso contra la mujer." |
| — | `caso.mov` (nota de noticias, 7 s, sin audio) | Va justo después de la intro; fondo desenfocado y título "Caso en Colombia". |
| 2 | `02-no-son-normales.mov` | "Sufrir alguno de estos casos, estas problemáticas no son normales y no es algo que debes dejar pasar." |
| 3 | `03-tipos.mov` | "(Ya,) es que estos casos no solamente se ven mediante lo físico, sino que se pueden ver como psicológico, económico y sexual?" |
| 4 | `04-manifestaciones.mov` | "Se pueden manifestar mediante insultos, golpes, humillaciones y control de la persona. ¡No permitas eso!" |
| 5 | `05-prevenir.mov` | "¿Cómo podemos prevenir? Reconociendo las señales de alerta, promoviendo el respeto y la igualdad y promoviendo relaciones libres de violencia." |
| 6 | `06-sin-miedo.mov` | "Recuerda que las mujeres no deben vivir con miedo. Si conoces a alguien que sufre esto, apóyalo, oriéntalo, ayúdalo." |
| 7 | `07-linea-atencion.mov` | "Mira, esta es una línea de atención y que te protegerán, porque recuerda, no estás sola, y recuerda que la violencia se reconoce y se denuncia." |
| 8 | `08-cierre.mov` | "El respeto protege, la indiferencia no." |
| — | Cierre gráfico | Eslogan + "La violencia se reconoce y se denuncia" (+ número si existe). |

Los clips 2–6 siguen el orden en que se enviaron.

## Edición

- Recorte de pausas y muletillas: cada clip conserva solo los tramos de
  `keep` en `src/Prevencion/data.ts`. Se quitaron las pausas largas, los "eee"
  del clip de prevención, el "eh" antes de "apóyalo", el murmullo entre
  "casos" y "estas", y el "ya" al inicio del clip de tipos ("…es que estos
  casos"). Cada salto cambia un poco el encuadre para disimular el corte.

- Subtítulos palabra por palabra (transcritos con Whisper y corregidos a mano
  en `src/Prevencion/data.ts`), palabra activa en amarillo.
- Cortes con zoom + desenfoque + destello y *whoosh*; alternancia de plano
  abierto/cerrado; golpes de zoom en palabras clave.
- Título de sección al inicio de cada clip, chips de palabras clave
  (tipos de violencia, manifestaciones, prevención, apóyalo/oriéntalo/ayúdalo),
  sellos con sacudida ("NO SON NORMALES", "¡NO PERMITAS ESO!", "NO ESTÁS SOLA").
- Barra de progreso arriba.
- Audio de los clips limpiado con `tools/limpiar-audio.sh` (el video no se
  recomprime): corte de graves (retumbo/viento), reducción de ruido neuronal
  RNNoise (modelo `sh`), reducción residual, EQ de presencia, compresión y
  normalización a -14 LUFS. La voz pasó de estar ~10 dB por encima del ruido de
  fondo a ~29 dB. Se probaron otros modelos y una compuerta, pero se comían
  consonantes ("Sufrir", "¿Sabías"); se dejó la opción que mejor conserva la voz.
  Micro-fundidos de audio en cada corte.
- Efectos de sonido generados con ffmpeg (`public/sfx/`), sin licencias de
  terceros.
- Fuentes: Anton y Montserrat Black (OFL). La fuente de la plantilla
  (TheBoldFont) no tiene Í, Ñ ni ¡.

## Material de apoyo ya incluido

- **Video del caso** (`public/psa/caso.mov`, 512x480, sin audio, trae marca de
  agua "clideo.com"): después de "A continuación te voy a presentar un caso…".
  Si hay una versión sin marca y de mayor resolución, reemplazar el archivo.
- **Imágenes** (`public/psa/violencia-1.jpg`, `violencia-2.jpg`): en el clip 2
  (chico de camiseta negra, ≈ seg. 12: "Sufrir alguno de estos casos,
  estas problemáticas no son normales…"), a pantalla completa mientras su voz
  sigue. Se configuran en `broll` de `src/Prevencion/data.ts`.

## Pendiente

- **Líneas de atención**: ya cargadas con lo que envió el cliente:
  Colombia **155** y Emergencias **123** (valores por defecto de
  `lineasAtencion` en `src/Root.tsx`; se pueden cambiar o añadir otras con
  `{ "nombre": "...", "numero": "..." }`). En el clip 7 cada línea sale como
  su propia tarjeta, pegada a la punta del dedo cuando él señala en el aire
  (la 1.ª a la derecha, la 2.ª a la izquierda; ajustable en `pointers` de
  `src/Prevencion/data.ts`, x/y = punta del dedo como fracción del cuadro).
  En el clip 7 solo salen las dos primeras líneas; en el cierre salen todas,
  junto con
  "No estás sola. La violencia se previene, se reconoce y se denuncia."
- Música de fondo con licencia (opcional).
- Los clips recibidos son 720x1280. Con los originales del celular (1080p o
  4K) el render final se vería más nítido.

## Render

`casoSeconds` se calcula solo.

Para limpiar el audio de un clip nuevo:

```console
tools/limpiar-audio.sh entrada.mov public/psa/salida.mov
```

```console
npx remotion render src/index.ts PrevencionViolencia out/prevencion-violencia.mp4 \
  --codec=h264 --crf=16 --audio-bitrate=320k \
  --props='{"lineasAtencion":[{"nombre":"Colombia","numero":"155"},{"nombre":"Emergencias","numero":"123"}],"casoSrc":"psa/caso.mp4","casoSeconds":0}'
```
