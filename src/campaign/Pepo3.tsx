import React from "react";
import { CineData, CineVideo } from "./Cine";
import raw from "./pepo3.json";

// Caso dramatizado de la tarjeta de crédito vaciada (carpeta de Drive «Pepo 3», scripts/build_pepo3.py): de
// corrido como una entrevista real, sin cambiar el color, estilo «cinematográfico» (Cine.tsx).
const data = raw as unknown as CineData;
export const PEPO3_FPS = data.fps;
export const pepo3Duration = Math.round(data.duration * data.fps);
export const Pepo3: React.FC = () => <CineVideo data={data} dir="pepo3" />;
