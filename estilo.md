# Estilo — Video Vigilante (Juan Felipe Castaño)

Referencia: un video de Duvalier Sánchez que subió el cliente (`media/ref/referencia1.mp4`, 152 s,
576x1024, 30 fps), analizado con fotogramas cada 2 s, detección de cambios de plano y análisis de audio
(ver "Análisis de la referencia" al final). El resto del estilo viene de lo que el cliente fue aprobando. Todo lo que no viene
del cliente ni del material está marcado como [SUPOSICIÓN].

Formato: 1080x1920, 60 fps, H.264 CRF 14, AAC 320 kbps.

## Ritmo de cortes
- Se elimina **todo silencio > 0.30 s** (detección a −35 dB). Margen: 0.05 s antes y 0.05 s después de cada tramo de voz.
- **Encuadre fijo, sin zooms** (el cliente pidió quitar los zooms que entran y salen). El ritmo lo dan los jump cuts.
- Ningún plano dura más de **2.2 s**: los tramos largos se parten entre palabras (jump cut). [SUPOSICIÓN]
- Duración objetivo: **< 50 s**. [SUPOSICIÓN]

## Subtítulos (lo más importante)
- Fuente **Anton**, MAYÚSCULAS, **88 px**, separación entre palabras 40 px, interlineado 1.0, relleno blanco `#FFFFFF`, contorno negro **14 px** (`paint-order: stroke`), sombra `0 6px 0 rgba(0,0,0,.55)`.
- Posición: centrado horizontal, **centro a y = 1220 px** (64 % de la altura): debajo de la cara y encima de la interfaz de TikTok/Reels (franja inferior de 380 px libre).
- Bloques de **máximo 3 palabras / 16 caracteres**; corte de bloque también en puntuación (`. , ? !`) o pausa > 0.25 s.
- Sincronización **palabra por palabra** (Whisper + tiempos de Parakeet). La palabra que suena se pinta **amarillo `#FFE600`** y escala a **1.08×**.
- Palabras clave del discurso en **caja roja `#E30613` con texto blanco** (radio 10 px, padding 4×14 px): PRESUPUESTO, PLATA, CONCEJAL, PEPO, SESQUI, CONTROL, POLÍTICO, DEBER, LEGAL, CONSTITUCIONAL, ALCALDÍA, PÚBLICO, DERECHO, AÑOS.
- Animación de entrada del bloque: escala 0.70 → 1.00 y subida de 24 px con resorte (damping 12) en ~8 frames. Sin animación de salida (corte seco al siguiente bloque).

## Textos en pantalla
- **Barra de progreso** arriba de borde a borde: **42 px** de alto (el cliente la pidió 3× más grande), degradado con los 5 colores de campaña sobre fondo negro 35 %.
- Firma fija **arriba a la izquierda** (x = 64, y = 300 px), **sin recuadro** (pedido del cliente): "Juan Felipe Castaño" en Anton **28 px** rojo `#E30613` con halo blanco suave y sombra, y barra de 5 colores de 4 px (`#F39200 #1D3E9E #E30613 #0A9A48 #5B2C8F`). Dentro del recorte 4:5 de Instagram.
- Gancho 0–2.6 s: "¿NO PODEMOS ESTAR AQUÍ?" en caja amarilla, Anton 80 px, rotación −3°, **debajo de los subtítulos (borde superior y = 1390 px)**: arriba taparía la cara.
- Credenciales (del perfil de Instagram): "ABOGADO JAVERIANO" al entrar el primer monólogo, "LIDERAZGO SOCIAL EN PALMIRA" en el tercero; caja roja, 60 px, rotación 2°, misma zona que el gancho.
- Cierre 3.5 s: fondo rojo radial, nombre + barra de colores, "¡Súmate a construir una Palmira mejor!" y "SÍGUENOS @juanfelipecastano_col" pulsando (pedido del cliente).

## B-roll / imágenes
- No hay material de apoyo del tema (las fotos IMG_1718–1720 son de otra escena). Se usan **tarjetas gráficas a pantalla completa de 1.1 s** sobre la voz, disparadas por la palabra exacta: [SUPOSICIÓN]
  - "presupuesto" (IMG_1696) → "¿Y EL PRESUPUESTO?" + ícono de billete.
  - "plata" (IMG_1702) → "¿NO HAY PLATA?" + ícono de billetera vacía.
  - "deteriorándose" (IMG_1704) → "AÑOS DE DETERIORO" + ícono de puente agrietado.
  - "control político" (IMG_1706) → "CONTROL POLÍTICO" + ícono de lupa.
  - "constitucional" (IMG_1710) → "DEBER LEGAL Y CONSTITUCIONAL" + ícono de balanza (del ⚖ del perfil).
- Tarjeta: fondo `#141414` con viñeta roja, ícono SVG blanco 360 px, texto Anton 96 px; entra con zoom 1.3 → 1.0 en 8 frames.
- Si el cliente envía fotos del puente del Sesqui, reemplazan a la tarjeta de "AÑOS DE DETERIORO".

## Transiciones
- Entre clips: flash blanco 85 % → 0 en 9 frames, **sin sacudida** (pedido del cliente).
- Jump cuts dentro de un clip: corte seco con pop de zoom (sin flash).

## Zooms
- Ninguno sobre el video, y sin sacudidas (pedido del cliente).

## Color
- Originales HDR HLG → SDR BT.709 (tonemap hable, desat 2) vía LUT 3D.
- **Clip del vigilante (IMG_1697, 1.0–6.1 s): escala de grises**, contraste 1.15. Pedido del cliente.
- Cara del vigilante **difuminada** (blur 28 px que sigue su cara): en el material Juan Felipe le promete "te voy a pixelear".
- Resto sin gradación extra. [SUPOSICIÓN]

## Sonido
- **Voz mejorada** (`scripts/enhance_voice.py`): paso alto 80 Hz → reducción de ruido (afftdn) → −2.5 dB en 250 Hz → +3 dB en 3.2 kHz → de-esser → compresor 3:1 → **−16 LUFS por toma** (antes las tomas iban de −29 a −20 LUFS). La referencia de Duvalier mezclada está en −17 LUFS.
- **Música de suspenso** (`scripts/make_music.py` v4) con **muestras reales** de violín, chelo, contrabajo y piano (tonejs-instruments, CC-BY 3.0, ver `CREDITOS.md`): Re menor, 96 bpm, Rem–Sib–Solm–La, reverb de sala 2.2 s, **−30 LUFS** (~14 dB bajo la voz). Vigilante: ostinato de chelo + violín agudo. Base: chelo suave + piano. Dilian/1710: clímax con violines y chelo en octavas. IMG_1713: violín y piano. Cierre: Re mayor. (Las versiones 1–3, sintetizadas, fueron rechazadas.)
- **Clic** (`scripts/make_sfx.py`): "tic" único de ~10 ms, pico 2.1 kHz, centroide 2.7 kHz (medido en la referencia de Duvalier), volumen 0.55, uno por cada línea de la tipografía cinética.

## Subtítulo base (actual)
- Montserrat 600, **64 px**, blanco, sin caja, sombra suave, ancho máx. 940 px, **borde superior a y = 1160 px** (el cliente los pidió más grandes y más arriba). Frases de máx. 6 palabras / 30 caracteres.

## Análisis de la referencia (Duvalier, `media/ref/referencia1.mp4`)
- **Ritmo:** 36 cambios de plano detectados en 152 s (un inserto cada ~4.2 s) más jump cuts dentro del primer plano.
- **Plano principal:** primer plano a cámara, cara en el tercio superior, fondo neutro.
- **Subtítulos:** en minúscula, blancos, sin caja, 4–7 palabras en 1–2 líneas a ~75 % de la altura. Las palabras clave sueltas van en **grande** con otra fuente ("AMENAZA", "ICBF", "DISCRIMINATORIO" en serif cursiva, "sin autoridad").
- **B-roll:** capturas de trinos, noticias y documentos oficiales con el texto clave **resaltado en amarillo**; imágenes de archivo del Senado con banda inferior institucional; un momento en **blanco y negro**; una transición con desenfoque de zoom.
- **Marca:** logo pequeño "DUVALIER" fijo a media altura en el borde derecho; cierre con tarjeta de marca de colores (naranja/verde) y mapa.
- **Audio:** −17.2 LUFS mezclado, LRA 5.8 LU. Música ~9–10 dB bajo la voz, colchón sostenido sin batería, tono mayor (Si/Mi), energía en 120–800 Hz, ~95 bpm.
