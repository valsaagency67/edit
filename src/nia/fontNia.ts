import { continueRender, delayRender, staticFile } from "remotion";

// Bootzy TM (Type Mania), la letra que eligió el cliente para el video de Nia. Es una fuente comercial
// que mandó el cliente: está en public/fonts/BootzyTM.ttf pero no se versiona (ver .gitignore).
export const Bootzy = "Bootzy";

const handle = delayRender("Cargando Bootzy");
const face = new FontFace(Bootzy, `url('${staticFile("fonts/BootzyTM.ttf")}') format('truetype')`);
face
  .load()
  .then(() => {
    document.fonts.add(face);
    continueRender(handle);
  })
  .catch((err) => {
    console.error("No se pudo cargar Bootzy", err);
    continueRender(handle);
  });
