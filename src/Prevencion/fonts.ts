import { continueRender, delayRender } from "remotion";
import antonUrl from "@fontsource/anton/files/anton-latin-400-normal.woff2";
import montserratUrl from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff2";

// TheBoldFont (la de la plantilla) no trae Í, Ñ ni ¡, por eso usamos
// Anton (subtítulos/títulos) y Montserrat Black (chips). Ambas OFL.
export const DISPLAY_FONT = "Anton";
export const UI_FONT = "Montserrat";

let loading: Promise<void> | null = null;

export const loadPrevencionFonts = () => {
  if (loading) {
    return loading;
  }
  const handle = delayRender("Cargando fuentes");
  const faces = [
    new FontFace(DISPLAY_FONT, `url('${antonUrl}') format('woff2')`),
    new FontFace(UI_FONT, `url('${montserratUrl}') format('woff2')`, {
      weight: "900",
    }),
  ];
  loading = Promise.all(faces.map((f) => f.load())).then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  });
  return loading;
};
