import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";

// Portada del video «¿Dónde acudir cuando te vulneran tus derechos?» (1080x1920). Fondo: IMG_0744
// (toma del DM, frente al guadual) a los 2.3 s, mirando a cámara con la boca cerrada. La cara queda
// arriba y el texto sobre el pecho, todo dentro del recorte 4:5 de la cuadrícula de Instagram
// (y 285–1635): la pregunta en azul, DERECHOS en Bebas sobre rojo (colores de campaña).
const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const CoverDerechos: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img src={staticFile("cover/derechos-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.6) 56%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.85) 100%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1000, textAlign: "center" }}>
      <div
        style={{
          background: BLUE,
          color: "white",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: 2,
          padding: "10px 26px",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        ¿No sabes dónde acudir?
      </div>
      <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 66, color: "white", textShadow: SHADOW }}>
        Si te <span style={{ color: YELLOW }}>vulneran</span> tus
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 230,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "0 36px",
          marginTop: 12,
        }}
      >
        DERECHOS
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1500 }}>
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
