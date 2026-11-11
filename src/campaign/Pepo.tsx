import React from "react";
import raw from "./pepo.json";
import { TomasData, TomasVideo } from "./Tomas";

// Video de Juan Felipe al estilo del video argentino de referencia (cultura política y desinformación por
// saturación; carpeta de Drive «Pepo1»): siete tomas 4K verticales (scripts/build_pepo.py, tiempos en
// pepo.json). Como en la referencia: subtítulos cortos y grandes a dos tercios de la pantalla y reencuadres
// fijos entre frases (plano de pecho, base 1.12, y más cerrado, punch 1.32) para que el cuadro cambie cada ~3 s sin zooms animados.

export const PEPO_FPS = raw.fps;
export const pepoDuration = Math.round(raw.duration * raw.fps);

export const Pepo: React.FC = () => (
  <TomasVideo data={raw as TomasData} dir="pepo" captionTop={1240} base={1.12} punch={1.32} punchOrigin="50% 26%" />
);
