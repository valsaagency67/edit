import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video del IVA en la «ley de rescate» (Pepo 2, 1080x1920): fondo azul noche con la bandera, Abelardo
// recortado con el puño en alto (foto del cliente, public/pepo2/fotos/abelardo.png, no versionada) y el titular de
// la promesa: «prometió no subir impuestos» / «y le pone IVA a la canasta familiar» (el cliente cambió «la sal»). Todo dentro del recorte 4:5 (285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const NAVY = "#0B1736";
const SHADOW = "0 6px 22px rgba(0,0,0,0.6)";

export const CoverPepo2: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 45%, #1F3B8C 0%, ${NAVY} 58%, #050B1D 100%)`,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", top: 64, left: 64, fontFamily: Anton, fontSize: 28, color: RED }}>
      Juan Felipe Castaño
    </div>

    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 300, textAlign: "center" }}>
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
        Ley de rescate de Abelardo
      </div>
      <div style={{ fontFamily: Bebas, fontSize: 132, lineHeight: 0.92, color: "white", marginTop: 18, textShadow: SHADOW }}>
        PROMETIÓ NO
        <br />
        SUBIR IMPUESTOS
      </div>
    </AbsoluteFill>

    {/* Abelardo recortado, con el puño en alto */}
    {/* Nómina del fondo (captura que mandó el cliente, public/pepo2/fotos/nomina.jpg): a la derecha, inclinada como
        un documento, detrás de Abelardo pero sin taparle la cara. */}
    <div
      style={{
        position: "absolute",
        right: 24,
        top: 720,
        width: 500,
        transform: "rotate(4deg)",
        background: "white",
        padding: 10,
        boxShadow: "0 18px 44px rgba(0,0,0,0.6)",
      }}
    >
      <Img src={staticFile("pepo2/fotos/nomina.jpg")} style={{ width: "100%", display: "block" }} />
      <div
        style={{
          position: "absolute",
          left: -20,
          bottom: -34,
          background: YELLOW,
          color: NAVY,
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 30,
          padding: "6px 16px",
          transform: "rotate(-4deg)",
          whiteSpace: "nowrap",
        }}
      >
        Salarios de hasta $39 millones
      </div>
    </div>
    <Img
      src={staticFile("pepo2/fotos/abelardo.png")}
      style={{
        position: "absolute",
        left: 0,
        top: 690,
        width: 600,
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
      }}
    />

    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1290, textAlign: "center" }}>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 112,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "8px 30px 0",
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        Y LE PONE IVA A LA
        <br />
        CANASTA FAMILIAR
      </div>
      <div style={{ fontFamily: "'Noto Color Emoji'", fontSize: 120, marginTop: 10 }}>🛒</div>
    </AbsoluteFill>
  </AbsoluteFill>
);
