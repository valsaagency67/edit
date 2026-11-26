import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

// Si luego llega el brand book de FacturApp, solo hay que cambiar este archivo.
export const theme = {
  bg: "#090D12",
  bg2: "#0E161C",
  teal: "#86E3CC",
  tealDeep: "#4F6F67",
  tealSoft: "rgba(134,227,204,0.14)",
  text: "#EAFBF8",
  muted: "#7FA6A6",
  danger: "#FF5C6C",
  amber: "#FFB547",
  paper: "#F3F3EF",
  ink: "#1A2328",
  whatsapp: "#25D366",
};

// Fuentes locales (public/facturapp) para que el render no dependa de la red.
const face = (family: string, file: string, weight: string) => {
  const f = new FontFace(
    family,
    `url('${staticFile(file)}') format('truetype')`,
    { weight },
  );
  const handle = delayRender(`font ${family} ${weight}`);
  f.load()
    .then(() => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((e) => cancelRender(e));
};
["400", "500", "600", "700"].forEach((w) =>
  face("Jost", `facturapp/Jost-${w}.ttf`, w),
);
["500", "700"].forEach((w) =>
  face("JetBrains Mono", `facturapp/JBMono-${w}.ttf`, w),
);

export const FONT = "Jost, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
