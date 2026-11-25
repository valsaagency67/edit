// Portada tipo collage del Blog 1 (1080x1920): fotogramas de lo que pasó en
// el día, en orden. Arriba la mañana en el gym, en el centro el título y abajo
// la tarde/noche. El título queda dentro de la zona 4:5 (y 285-1635) que se ve
// en la cuadrícula de Instagram.
// Los fotogramas se sacan con ffmpeg a public/blog1/collage/ (ver PROYECTO.md).
import React, { useState } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadMiniVlogFonts, SANS, SERIF } from "./MiniVlog";

type Tile = { image: string; label: string; position?: string };

const TOP: Tile[] = [
  { image: "C084-6.77.png", label: "el gym", position: "60% 40%" },
  { image: "C090-24.70.png", label: "entreno", position: "50% 40%" },
  { image: "C094-95.47.png", label: "valery", position: "45% 55%" },
];
const BOTTOM: Tile[] = [
  { image: "C105-2.00.png", label: "pochoclo", position: "45% 55%" },
  { image: "C113-0.57.png", label: "pochoclo en el gym", position: "55% 55%" },
  { image: "C116-8.70.png", label: "apolo gastro bar", position: "82% 50%" },
];

const GAP = 6;
const TILE_W = (1080 - GAP * 2) / 3;
const TILE_H = 700;
const BAND_TOP = TILE_H + GAP;
const BAND_H = 1920 - 2 * (TILE_H + GAP);

const Row: React.FC<{ tiles: Tile[]; top: number }> = ({ tiles, top }) => (
  <>
    {tiles.map((t, i) => (
      <div
        key={t.image}
        style={{
          position: "absolute",
          top,
          left: i * (TILE_W + GAP),
          width: TILE_W,
          height: TILE_H,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(`blog1/collage/${t.image}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: t.position ?? "50% 50%",
            filter: "brightness(1.12) contrast(1.06) saturate(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 16,
            bottom: 22,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 30,
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {t.label}
        </div>
      </div>
    ))}
  </>
);

export const Blog1Collage: React.FC = () => {
  useState(() => loadMiniVlogFonts());
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0f" }}>
      <Row tiles={TOP} top={0} />
      <div
        style={{
          position: "absolute",
          top: BAND_TOP,
          left: 0,
          width: 1080,
          height: BAND_H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          blog 1
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 200,
            lineHeight: 0.9,
            marginTop: 14,
          }}
        >
          mini vlog
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 84,
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          de un día con nosotros
        </div>
      </div>
      <Row tiles={BOTTOM} top={1920 - TILE_H} />
    </AbsoluteFill>
  );
};
