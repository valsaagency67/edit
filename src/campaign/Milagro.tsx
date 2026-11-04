import React from "react";
import raw from "./milagro.json";
import { TomasData, TomasVideo } from "./Tomas";

// Video de Juan Felipe sobre el Fondo Milagro (reconstrucción tras el terremoto del 10 de agosto): nueve tomas
// selfie (scripts/build_milagro.py, tiempos en milagro.json). La cara llega hasta y≈1380, así que los
// subtítulos van sobre la barbilla y la camiseta (y=1330; el cliente los vio muy abajo en y=1420; con fondo oscuro porque a veces caen sobre la pared blanca) y
// las tarjetas debajo, a la altura del pecho (milagro.config.json); las fotos de apoyo, arriba (centro y=760).

export const MILAGRO_FPS = raw.fps;
export const milagroDuration = Math.round(raw.duration * raw.fps);

export const Milagro: React.FC = () => (
  <TomasVideo
    data={raw as TomasData}
    dir="jf4"
    captionTop={1330}
    captionBox
    photoCenter={760}
  />
);
