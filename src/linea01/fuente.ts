import { continueRender, delayRender, staticFile } from "remotion";

// Montserrat (OFL) empaquetada en public/fonts para no depender de Google Fonts al renderizar.
export const fontFamily = "Montserrat";

const pesos = ["300", "600"] as const;

const espera = delayRender("Cargando Montserrat");
Promise.all(
  pesos.map((peso) => {
    const font = new FontFace(
      fontFamily,
      `url('${staticFile(`fonts/montserrat-latin-${peso}-normal.woff2`)}') format('woff2')`,
      { weight: peso },
    );
    return font.load().then(() => document.fonts.add(font));
  }),
).then(() => continueRender(espera));
