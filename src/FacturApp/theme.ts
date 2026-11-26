import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

// Si luego llega el brand book de FacturApp, solo hay que cambiar este archivo.
export const theme = {
  bg: "#03080D",
  bg2: "#071722",
  teal: "#19F2D8",
  tealDeep: "#00A99D",
  tealSoft: "rgba(25,242,216,0.14)",
  text: "#FFFFFF",
  muted: "#7FA6A6",
  danger: "#FF5C6C",
  amber: "#FFB547",
  paper: "#F7F7F5",
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
["500", "600", "700", "800"].forEach((w) =>
  face("Sora", `facturapp/Sora-${w}.ttf`, w),
);
["500", "700"].forEach((w) =>
  face("JetBrains Mono", `facturapp/JBMono-${w}.ttf`, w),
);

export const FONT = "Sora, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
