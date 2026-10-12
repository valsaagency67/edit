# Estilo — Video Vigilante (Juan Felipe Castaño)

No hay video de referencia: este estilo lo definió el editor a partir de lo que funciona en
Reels/TikTok político y de lo que el cliente aprobó en el borrador 1. Todo lo que no viene
del cliente ni del material está marcado como [SUPOSICIÓN].

Formato: 1080x1920, 60 fps, H.264 CRF 14, AAC 320 kbps.

## Ritmo de cortes
- Se elimina **todo silencio > 0.30 s** (detección a −35 dB). Margen: 0.05 s antes y 0.05 s después de cada tramo de voz.
- Cada corte alterna encuadre: plano abierto **1.00×** ↔ punch-in **1.16×** (origen vertical 35 %).
- Ningún plano dura más de **2.2 s** sin cambio de encuadre: si un tramo de voz es más largo, se parte en el silencio más corto o, si no hay, en la mitad, alternando 1.00×/1.10×. [SUPOSICIÓN]
- Empuje continuo dentro de cada plano: +4.5 % de escala a lo largo del plano.
- Pop de entrada en cada jump cut: +6 % de escala que se asienta con resorte (damping 14, stiffness 180) en ~10 frames.
- Duración objetivo: **< 50 s**. [SUPOSICIÓN]

## Subtítulos (lo más importante)
- Fuente **Anton**, MAYÚSCULAS, **88 px**, separación entre palabras 40 px, interlineado 1.0, relleno blanco `#FFFFFF`, contorno negro **14 px** (`paint-order: stroke`), sombra `0 6px 0 rgba(0,0,0,.55)`.
- Posición: centrado horizontal, **centro a y = 1220 px** (64 % de la altura): debajo de la cara y encima de la interfaz de TikTok/Reels (franja inferior de 380 px libre).
- Bloques de **máximo 3 palabras / 16 caracteres**; corte de bloque también en puntuación (`. , ? !`) o pausa > 0.25 s.
- Sincronización **palabra por palabra** (Whisper + tiempos de Parakeet). La palabra que suena se pinta **amarillo `#FFE600`** y escala a **1.08×**.
- Palabras clave del discurso en **caja roja `#E30613` con texto blanco** (radio 10 px, padding 4×14 px): PRESUPUESTO, PLATA, CONCEJAL, PEPO, SESQUI, CONTROL, POLÍTICO, DEBER, LEGAL, CONSTITUCIONAL, ALCALDÍA, PÚBLICO, DERECHO, AÑOS.
- Animación de entrada del bloque: escala 0.70 → 1.00 y subida de 24 px con resorte (damping 12) en ~8 frames. Sin animación de salida (corte seco al siguiente bloque).

## Textos en pantalla
- Banner fijo superior (centro y = 200 px): "Juan Felipe Castaño" en Anton 74 px rojo `#E30613` sobre caja blanca 92 % y barra de 5 colores (`#F39200 #1D3E9E #E30613 #0A9A48 #5B2C8F`). Del perfil/banner del cliente.
- Gancho 0–2.6 s: "¿NO PODEMOS ESTAR AQUÍ?" en caja amarilla, Anton 80 px, rotación −3°, **debajo de los subtítulos (borde superior y = 1390 px)**: arriba taparía la cara.
- Credenciales (del perfil de Instagram): "ABOGADO JAVERIANO" al entrar el primer monólogo, "LIDERAZGO SOCIAL EN PALMIRA" en el tercero; caja roja, 60 px, rotación 2°, misma zona que el gancho.
- Cierre 3.5 s: fondo rojo radial, nombre + barra de colores, "¡Súmate a construir una Palmira mejor!" y "SÍGUELO @juanfelipecastano_col" pulsando.

## B-roll / imágenes
- No hay material de apoyo del tema (las fotos IMG_1718–1720 son de otra escena). Se usan **tarjetas gráficas a pantalla completa de 1.1 s** sobre la voz, disparadas por la palabra exacta: [SUPOSICIÓN]
  - "presupuesto" (IMG_1696) → "¿Y EL PRESUPUESTO?" + ícono de billete.
  - "plata" (IMG_1702) → "¿NO HAY PLATA?" + ícono de billetera vacía.
  - "deteriorándose" (IMG_1704) → "AÑOS DE DETERIORO" + ícono de puente agrietado.
  - "control político" (IMG_1706) → "CONTROL POLÍTICO" + ícono de lupa.
  - "constitucional" (IMG_1710) → "DEBER LEGAL Y CONSTITUCIONAL" + ícono de balanza (del ⚖ del perfil).
- Tarjeta: fondo `#141414` con viñeta roja, ícono SVG blanco 360 px, texto Anton 96 px; entra con zoom 1.3 → 1.0 en 8 frames + whoosh.
- Si el cliente envía fotos del puente del Sesqui, reemplazan a la tarjeta de "AÑOS DE DETERIORO".

## Transiciones
- Entre clips: flash blanco 85 % → 0 en 9 frames + sacudida 22 px que decae en 14 frames + whoosh (entra 10 frames antes del corte).
- Jump cuts dentro de un clip: corte seco con pop de zoom (sin flash).

## Zooms
- 1.00× / 1.16× alternados por corte; 1.10× en las divisiones de planos largos.
- Golpe de zoom +8 % en 6 frames sobre cada palabra clave en caja roja. [SUPOSICIÓN]

## Color
- Originales HDR HLG → SDR BT.709 (tonemap hable, desat 2) vía LUT 3D.
- **Clip del vigilante (IMG_1697, 1.0–6.1 s): escala de grises**, contraste 1.15. Pedido del cliente.
- Cara del vigilante **difuminada** (blur 28 px que sigue su cara): en el material Juan Felipe le promete "te voy a pixelear".
- Resto sin gradación extra. [SUPOSICIÓN]

## Sonido
- Voz original del micrófono de solapa, volumen 1.0.
- Whoosh (ruido rosa filtrado, 0.45 s) a 0.55 en cambios de clip y tarjetas; pop (seno 180 Hz, 0.18 s) a 0.6 en textos.
- Sin música (no hay música con licencia). [SUPOSICIÓN]
