import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";

// Portada del video de la petición (1080x1920), con el mismo diseño de la del video de campaña
// (Cover.tsx). El texto queda dentro del recorte 4:5 que Instagram muestra en la cuadrícula del
// perfil (y 285–1635). Fondo: IMG_1724 a los 17.05 s, frente a la catedral, mirada directa e intensa (elegida por el cliente: ojos abiertos, imponente).
// Gancho: el contraste entre lo que pidió (cifras de seguridad) y lo que recibió (un radicado).
const YELLOW = "#FFE600";
const RED = "#E30613";
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const CoverPeticion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img src={staticFile("cover/peticion-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.88) 100%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 960, textAlign: "center" }}>
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
          marginBottom: 22,
        }}
      >
        Derecho de petición
      </div>
      <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 62, color: "white", textShadow: SHADOW }}>
        Le pedí las cifras de seguridad,
      </div>
      <div
        style={{
          fontFamily: Montserrat,
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 0.98,
          letterSpacing: -1,
          color: "white",
          textShadow: SHADOW,
          maxWidth: 1000,
        }}
      >
        Y SOLO ME DIERON
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 210,
          lineHeight: 0.9,
          whiteSpace: "nowrap",
          color: YELLOW,
          textShadow: "0 6px 24px rgba(0,0,0,0.7)",
          marginTop: 6,
        }}
      >
        UN RADICADO
      </div>
      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
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
