# Estilo — Video Vigilante (Juan Felipe Castaño)

No hay video de referencia: este estilo lo definió el editor a partir de lo que funciona en
Reels/TikTok político y de lo que el cliente aprobó en el borrador 1. Todo lo que no viene
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
- **Solo la voz original** del micrófono de solapa, volumen 1.0.
- **Sin efectos de sonido**: el cliente rechazó el whoosh, la campanita de transición y los clics en palabras ("suenan a Roblox"). `scripts/make_sfx.py` queda por si se quieren reintroducir.
- **Música de fondo** compuesta por `scripts/make_music.py` (síntesis propia, sin licencias), a **−30 LUFS** (≈ 9 dB bajo la voz), **sin graves** (paso alto 120 Hz, 24 dB/oct). Versión 2: el cliente rechazó el zumbido grave y pidió algo más agudo y amigable, con drama solo en momentos clave.
  - Vigilante (drama): cuerdas agudas en trémolo 11 Hz (La-Do-Mi-Fa) que crecen + pizzicato a 132 bpm.
  - IMG_1696–1706 (base amigable): arpegio tipo piano/marimba La m – Fa – Do – Sol a 100 bpm en corcheas + colchón de cuerdas suave.
  - IMG_1710 (clímax): arpegio en semicorcheas Fa → Sol + cuerdas en trémolo que suben.
  - IMG_1713 (suspenso): acorde agudo sostenido en trémolo, sin arpegio.
  - Cierre: arpegio brillante en Do mayor a 112 bpm.
