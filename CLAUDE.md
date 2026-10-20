# Videos de Juan Felipe Castaño (Palmira) — reglas fijas del cliente

Estas reglas valen para TODOS los videos de Juan Felipe (no para los de otros clientes, ver «Nia» abajo), salvo que el cliente pida otra cosa para uno
en particular. Detalles de estilo con valores concretos en `estilo.md`; implementación de referencia en
`src/campaign/CampaignVideo.tsx` (video de campaña) y `src/campaign/Peticion.tsx` (video de la petición).

## Siempre
- **Barra de duración arriba**: 42 px, fondo `rgba(0,0,0,0.35)`, avance con el degradado de los 5 colores
  de la marca (`#F39200 #1D3E9E #E30613 #0A9A48 #5B2C8F`). Componente `Progress`.
- **Firma**: «Juan Felipe Castaño» en Anton 28 px rojo `#E30613`, sin recuadro, con la barra de 5 colores
  debajo; arriba a la izquierda (top 300, left 64).
- **Que hable de seguido**: cortes en las pausas (decididos por el audio, no por la transcripción, cuyos
  tiempos vienen corridos ~0.2 s) y voz un poco acelerada (1.07x; la introducción puede ir más rápida).
  Verificar con Whisper que ningún corte se come una palabra.
- **Introducción**: muy corta (≈3 s, máximo 4) y lo más dramática posible.
- **Subtítulos**: Montserrat 600, 64 px, blancos con sombra, top 1160; frases cortas por sentido;
  amarillo `#FFE600` para las palabras de acusación o datos clave.
- **Colores de campaña**: rojo y azul en tarjetas y gráficos.
- **Sin zooms ni sacudidas**. Transiciones: corte, destello breve en cambio de clip, desenfoque en
  entradas/salidas de gráficos. Las animaciones terminan dentro de su tiempo.
- **Gráficos sin tapar la cara**: tarjetas a la altura del pecho (ancladas abajo en y=1120).
- **Música**: propia para cada pieza (no reutilizar la de otro video), con muestras reales
  (tonejs-instruments, CC-BY 3.0, crédito en `CREDITOS.md`) y BAJA: ~17 dB bajo la voz.
- **Voz**: cadena de `scripts/enhance_voice.py`, cada toma a -16 LUFS. Mezcla final ≈ -14 LUFS, pico -1 dBFS.
- **Foley** alineado con lo que pasa en pantalla (clic por subtítulo, golpes en tarjetas, etc.).
- **Evidencia**: cuando hay documentos (correos, radicados), mostrarlos recortados con resaltador y el dato
  clave en grande; difuminar cédula y datos personales.
- **Privacidad y legal**: pixelar caras de terceros (p. ej. el vigilante); no difamar a nadie.
- **Entregas**: mandar siempre una versión ligera para revisar en el celular (540x960, < 15 MB) y la de
  redes (1080x1920, < 30 MB). El master queda en `out/`.

## Datos que ya se corrigieron
- Es el **POT** (Plan de Ordenamiento Territorial), no «FOT» como sale en la transcripción de IMG_1740.
- El correo de la Alcaldía con el radicado 20260525051 es del 8 de octubre de 2026 (él dice «9 de octubre»).

# Videos de Nia — reglas propias (NO usar las de Juan Felipe)
- Proyecto «La filosofía se vive en la calle» (carpeta de Drive «Nia»). Voz en off grabada aparte; los
  videos son tomas selfie caminando, sin audio.
- **Colorimetría pastel**, más suave que la de campaña: lila `#CDB8F0`, lavanda `#9C82D4`, amarillo
  mantequilla `#FFE9A8`, rosa `#F6C9DA`, crema `#FFF8EC`, ciruela `#3E2F5B` (texto sobre bloques claros).
  Gradación del video: negros levantados, menos contraste y saturación, sombras lila, luces cálidas.
  Propuesta de referencia en `src/nia/NiaEstilo.tsx` (composición NIA-Estilo).
- Sin firma ni colores de Juan Felipe. Barra de duración con degradado lila → rosa → amarillo.
- **Tipografía Bootzy TM** (la eligió el cliente) en casi todo: subtítulos, textos grandes, globos. Solo las
  frases cursivas de acompañamiento y la firma «Nia» van en Playfair. Es comercial: `public/fonts/BootzyTM.ttf`
  no se versiona; no trae «¿ ¡ …» (se arman girando «? !», componente `BZ`).
- **Efectos de sonido**: solo los del video de referencia del cliente (`public/nia/sfx/ref-*.wav`): clic en
  textos, magic reveal al revelar imágenes, whoosh en acercamientos, obturador en transiciones. Nada sintetizado.
