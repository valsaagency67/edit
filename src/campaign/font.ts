import { continueRender, delayRender, staticFile } from "remotion";

// Anton (SIL OFL, ver public/fonts/anton-OFL.txt): condensada y gruesa como el
// banner de campaña, y con Ñ/Á/Í/¿/¡ (TheBoldFont no trae la Ñ).
export const Anton = "Anton";

const handle = delayRender("Cargando fuente Anton");
const face = new FontFace(
  Anton,
  `url('${staticFile("fonts/anton-latin-400-normal.woff2")}') format('woff2')`,
);
face
  .load()
  .then(() => {
    document.fonts.add(face);
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
