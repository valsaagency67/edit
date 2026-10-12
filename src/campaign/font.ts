import { continueRender, delayRender, staticFile } from "remotion";

// Fuentes locales (SIL OFL, ver public/fonts/*-OFL.txt).
// - Anton: firma "Juan Felipe Castaño", tarjetas y cierre.
// - Montserrat: subtítulo base (600), palabras anchas (900), selección (700 itálica).
// - Bebas Neue: palabras condensadas grandes ("VANDALIZACIÓN").
// - Playfair Display itálica: serif fina ("incómodas").
export const Anton = "Anton";
export const Montserrat = "Montserrat";
export const Bebas = "Bebas Neue";
export const Playfair = "Playfair Display";

const faces: [string, string, FontFaceDescriptors][] = [
  [Anton, "anton-latin-400-normal.woff2", {}],
  [Montserrat, "montserrat-latin-500-normal.woff2", { weight: "500" }],
  [Montserrat, "montserrat-latin-600-normal.woff2", { weight: "600" }],
  [Montserrat, "montserrat-latin-800-normal.woff2", { weight: "800" }],
  [Montserrat, "montserrat-latin-900-normal.woff2", { weight: "900" }],
  [
    Montserrat,
    "montserrat-latin-700-italic.woff2",
    { weight: "700", style: "italic" },
  ],
  [Bebas, "bebas-neue-latin-400-normal.woff2", {}],
  [
    Playfair,
    "playfair-display-latin-400-italic.woff2",
    { weight: "400", style: "italic" },
  ],
];

const handle = delayRender("Cargando fuentes");
Promise.all(
  faces.map(([family, file, desc]) => {
    const face = new FontFace(
      family,
      `url('${staticFile(`fonts/${file}`)}') format('woff2')`,
      desc,
    );
    return face.load().then(() => document.fonts.add(face));
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
