import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video de cultura política (Pepo1, 1080x1920): fondo azul noche con la bandera arriba y abajo,
// titular en Bebas (blanco, con bloque rojo), a Juan Felipe recortado del cuadro en que queda serio
// (public/cover/pepo-jf.png, rembg birefnet-portrait) y la firma. Todo dentro del recorte 4:5 (285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const NAVY = "#0B1736";
const SHADOW = "0 6px 22px rgba(0,0,0,0.6)";

export const CoverPepo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 30% 60%, #1F3B8C 0%, ${NAVY} 55%, #050B1D 100%)`,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>

    {/* Firma, arriba a la izquierda (como en los videos) */}
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 64,
        fontFamily: Anton,
        fontSize: 28,
        color: RED,
        textShadow: "0 2px 6px rgba(0,0,0,0.5)",
      }}
    >
      Juan Felipe Castaño
    </div>

    {/* Juan Felipe recortado, a la derecha y abajo del titular */}
    <Img
      src={staticFile("cover/pepo-jf.png")}
      style={{
        position: "absolute",
        left: 170,
        top: 760,
        width: 840,
        filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.6))",
      }}
    />

    {/* Titular */}
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 300,
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: YELLOW,
          color: NAVY,
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 2,
          padding: "8px 22px",
          textTransform: "uppercase",
          transform: "rotate(-2deg)",
        }}
      >
        Cultura política
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 170,
          lineHeight: 0.92,
          color: "white",
          marginTop: 22,
          textShadow: SHADOW,
        }}
      >
        HABLAMOS MÁS
        <br />
        DE POLÍTICA
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 128,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "8px 30px 0",
          marginTop: 18,
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        Y ENTENDEMOS MENOS
      </div>
    </AbsoluteFill>

    {/* Pie: la consigna del video */}
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", top: 1560, textAlign: "center" }}
    >
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 76,
          lineHeight: 1,
          color: YELLOW,
          textShadow: SHADOW,
        }}
      >
        SER CRÍTICOS ES RECUPERAR LA POLÍTICA
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
