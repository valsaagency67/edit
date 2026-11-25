// Portada del Blog 1 (1080x1920), mismo estilo que el video: foto a pantalla
// completa + título serif. El texto queda dentro de la zona central 4:5
// (y 285-1635) para que no se corte en la cuadrícula de Instagram.
import React, { useState } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { loadMiniVlogFonts, SANS, SERIF } from "./MiniVlog";

export const coverSchema = z.object({
  /** Fotograma en public/ (extraído con ffmpeg del intermedio, ver PROYECTO.md). */
  image: z.string(),
});

export const Blog1Cover: React.FC<z.infer<typeof coverSchema>> = ({
  image,
}) => {
  useState(() => loadMiniVlogFonts());
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Img
        src={staticFile(image)}
        style={{
          width: 1080,
          height: 1920,
          filter: "brightness(1.08) contrast(1.06) saturate(1.1)",
        }}
      />
      {/* degradado para que el texto se lea sobre la calle */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 76%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          top: 1290,
          alignItems: "center",
          color: "white",
          textAlign: "center",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          blog 1
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 190,
            lineHeight: 0.9,
            marginTop: 18,
          }}
        >
          mini vlog
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 86,
            lineHeight: 1,
            marginTop: 10,
          }}
        >
          de un día con nosotros
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
