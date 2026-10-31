import React from "react";
import raw from "./museo.json";
import { TomasData, TomasVideo } from "./Tomas";

// Video de Juan Felipe sobre el fallo que ordena al Museo Nacional devolver las 63 piezas: doce tomas
// selfie (scripts/build_museo.py, tiempos en museo.json). Las tomas son tan cerradas que la cara llega
// hasta abajo (y en las abiertas queda baja), así que los subtítulos van arriba, con fondo oscuro para que se lean
// sobre el póster amarillo, en vez de en y=1160; cada tarjeta lleva su propia altura en museo.config.json.

export const MUSEO_FPS = raw.fps;
export const museoDuration = Math.round(raw.duration * raw.fps);

export const Museo: React.FC = () => <TomasVideo data={raw as TomasData} dir="jf3" captionTop={400} captionBox />;
