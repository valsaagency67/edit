import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video del fallo del Museo Nacional (1080x1920). Fondo: el final de IMG_3993 (cierre, «es una
// guerra contra la cultura»), cuando se queda serio mirando a cámara, recortado a 9:16 con la gradación
// del video. La toma es tan cerrada que la imagen sube 150 px para dejar el texto sobre el cuello y la
// camiseta (la boca queda libre); todo dentro del recorte 4:5 de la cuadrícula de Instagram (y 285–1635).
const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const CoverMuseo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img
      src={staticFile("cover/museo-fondo.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: "translateY(-150px)" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.65) 64%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,1) 92%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1230, textAlign: "center" }}>
      <div
        style={{
          background: BLUE,
          color: "white",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 42,
          letterSpacing: 2,
          padding: "10px 26px",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Museo Nacional · 63 piezas
      </div>
      <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 62, color: "white", textShadow: SHADOW }}>
        No es una guerra <span style={{ color: YELLOW }}>cultural</span>:
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 116,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "4px 30px 0",
          marginTop: 10,
        }}
      >
        ES CONTRA LA CULTURA
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1560 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 7 }}>
        <div style={{ fontFamily: Anton, fontSize: 50, lineHeight: 1, color: "white", textShadow: SHADOW }}>
          Juan Felipe Castaño
        </div>
        <Bandera height={7} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
