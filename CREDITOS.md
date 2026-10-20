# Créditos

## Música de fondo (`public/music/suspenso.wav`)

Compuesta para este video con `scripts/make_music.py` usando muestras de instrumentos de
**tonejs-instruments** de Nicholaus Brosowsky (violín, chelo, contrabajo y piano), con licencia
[CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). Las muestras vienen de fuentes de dominio
público editadas por el autor.

La licencia pide dar crédito. Texto sugerido para la descripción del post:

> Música: muestras de "tonejs-instruments" de Nicholaus Brosowsky (CC BY 3.0).

## Fuentes tipográficas

Anton, Montserrat, Bebas Neue y Playfair Display, licencia SIL Open Font License
(ver `public/fonts/*-OFL.txt`).

## Efectos de sonido

`public/sfx/click.wav`: sintetizado para este proyecto (`scripts/make_sfx.py`).

## Video de la petición (`out/peticion-completa.mp4`)

- **Música** (`public/policia/peticion-drama.wav`): pieza propia, distinta de la del video de campaña
  (piano en Fa menor con violín, sin chelo), compuesta con `scripts/build_peticion.py` con muestras
  de **tonejs-instruments** de Nicholaus Brosowsky (CC BY 3.0). Mismo texto de crédito que arriba.
  `public/policia/dramatico.wav` (pieza corta de la censura, `scripts/make_drama.py`) usa las mismas muestras.
- **Foley** (`public/policia/peticion-foley.wav` y `public/policia/foley.wav`): sintetizado para este
  proyecto (`scripts/make_foley.py`, `scripts/build_peticion.py`); no usa grabaciones de terceros.
- **Íconos** de las tarjetas: dibujados a mano en SVG para este proyecto (`src/campaign/Peticion.tsx`).

## Video de Nia (`out/nia.mp4`)

- **Música** (`public/nia/musica.wav`): pieza propia en Sol mayor (piano y chelo), compuesta con
  `scripts/build_nia.py` con muestras de **tonejs-instruments** de Nicholaus Brosowsky (CC BY 3.0).
- **Efectos de sonido** (`public/nia/sfx/ref-*.wav`: clic, magic reveal, whoosh y obturador): sacados del
  video de referencia que mandó el cliente («Usa estos 4 efectos de sonido…»), separando la voz con el
  modelo UVR-MDX-NET-Inst_HQ_3 (sherpa-onnx) y filtrando los graves que quedaban de la voz.
- **Reducción de ruido** de la voz: filtro `arnndn` de FFmpeg con el modelo original de RNNoise
  (Xiph.Org, licencia BSD-3), `scripts/models/rnnoise-std.rnnn` (tomado de richardpl/arnndn-models).
- **Pintura**: «La muerte de Sócrates», Jacques-Louis David (1787), dominio público; animada en
  `scripts/make_socrates.py`.
- **Fotos y video de apoyo** (protesta, Nestlé, pobreza, discusión, barrio, universidad, transporte):
  enviados por el cliente (`media/nia/broll`, no versionados); los derechos son de sus autores.
