import React from "react";
import raw from "./derechos.json";
import { TomasData, TomasVideo } from "./Tomas";

// Video de Juan Felipe «¿Dónde acudir cuando te vulneran tus derechos?»: cinco tomas a cámara
// (scripts/build_derechos.py, tiempos en derechos.json).

export const DERECHOS_FPS = raw.fps;
export const derechosDuration = Math.round(raw.duration * raw.fps);

export const Derechos: React.FC = () => <TomasVideo data={raw as TomasData} dir="jf2" />;
