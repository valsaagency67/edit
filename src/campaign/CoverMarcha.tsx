import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat, Playfair } from "./font";

// Portada del video de la marcha del 14 de octubre (1080x1920). Fondo: IMG_3804 a los 2.6 s
// (puño arriba, pancarta de la Universidad Nacional, multitud frente al CAM). El texto va en el
// cielo, dentro del recorte 4:5 de la cuadrícula de Instagram (y 285–1635), con la misma tipografía
// mezclada del video: CAMBIO en Bebas sobre rojo y «prometieron» en Playfair itálica amarilla.
const RED = "#E30613";
const YELLOW = "#FFE600";
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const CoverMarcha: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img src={staticFile("cover/marcha-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.55) 44%, rgba(0,0,0,0) 58%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.75) 100%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 330, textAlign: "center" }}>
      <div
        style={{
          background: RED,
          color: "white",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 4,
          padding: "8px 20px",
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        14 de octubre · Palmira
      </div>
      <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 68, color: "white", textShadow: SHADOW }}>
        ¿Esto es el
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 250,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "0 36px",
          margin: "8px 0",
        }}
      >
        CAMBIO
      </div>
      <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 64, color: "white", textShadow: SHADOW }}>
        que nos
      </div>
      <div
        style={{
          fontFamily: Playfair,
          fontStyle: "italic",
          fontSize: 140,
          lineHeight: 1.05,
          color: YELLOW,
          textShadow: "0 6px 24px rgba(0,0,0,0.7)",
        }}
      >
        prometieron?
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1480 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
        <div style={{ fontFamily: Anton, fontSize: 64, lineHeight: 1, color: "white", textShadow: SHADOW }}>
          Juan Felipe Castaño
        </div>
        <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
          {BRAND.map((c) => (
            <div key={c} style={{ flex: 1, backgroundColor: c }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
