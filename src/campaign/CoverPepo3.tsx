import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del caso dramatizado de la tarjeta vaciada (Pepo 3, 1080x1920): Juan Felipe de cerca en la mesa (cuadro
// de la toma «consejo», ya más claro; public/pepo3/portada-fondo.jpg, no versionado), oscurecido arriba y abajo
// para el titular, con la bandera y la firma. Todo dentro del recorte 4:5 (y 285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const NAVY = "#0B1736";
const SHADOW = "0 6px 22px rgba(0,0,0,0.75)";

export const CoverPepo3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
    <Img src={staticFile("pepo3/portada-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(5,10,25,0.85) 0%, rgba(5,10,25,0.15) 32%, rgba(5,10,25,0) 50%, rgba(5,10,25,0.35) 64%, rgba(5,10,25,0.92) 82%)",
      }}
    />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 64,
        fontFamily: Anton,
        fontSize: 28,
        color: RED,
        textShadow: "0 2px 6px rgba(0,0,0,0.6)",
      }}
    >
      Juan Felipe Castaño
    </div>

    {/* Arriba: la pregunta */}
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 300, textAlign: "center" }}>
      <div
        style={{
          background: YELLOW,
          color: NAVY,
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 2,
          padding: "8px 22px",
          textTransform: "uppercase",
          transform: "rotate(-2deg)",
        }}
      >
        Derechos del consumidor financiero
      </div>
      <div style={{ fontFamily: Bebas, fontSize: 150, lineHeight: 0.92, color: "white", marginTop: 18, textShadow: SHADOW }}>
        ¿TE VACIARON
        <br />
        LA TARJETA?
      </div>
    </AbsoluteFill>

    {/* Abajo: la respuesta */}
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1300, textAlign: "center" }}>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 120,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "8px 30px 0",
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        ASÍ LE RECLAMAS AL BANCO
      </div>
      <div style={{ fontFamily: Bebas, fontSize: 64, color: YELLOW, marginTop: 22, textShadow: SHADOW }}>
        PASO A PASO
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
