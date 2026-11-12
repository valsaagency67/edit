import React from "react";
import { CineData, CineVideo } from "./Cine";
import raw from "./pepo2.json";

// IVA a la canasta familiar en la «ley de rescate» de Abelardo (carpeta de Drive «Pepo 2»,
// scripts/build_pepo2.py): mismo estilo «cinematográfico» de Pepo 3 (Cine.tsx), color tal como viene.
const data = raw as unknown as CineData;
export const PEPO2_FPS = data.fps;
export const pepo2Duration = Math.round(data.duration * data.fps);
export const Pepo2: React.FC = () => <CineVideo data={data} dir="pepo2" />;
