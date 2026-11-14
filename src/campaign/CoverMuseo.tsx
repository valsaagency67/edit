import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video del fallo del Museo Nacional (1080x1920), pedida «referente al museo, con colores
// vivos, muy libertaria» y sin la cara de Juan Felipe (scripts/make_portada_museo.py): toda la portada es la
// sala de la exposición en color vivo, ampliada para que la bandera arcoíris quede grande en el centro;
// arriba «LA MEMORIA NO SE BORRA» y abajo la firma. Todo lo importante queda dentro del recorte 4:5 de la
// cuadrícula de Instagram (y 285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const SHADOW = "0 6px 22px rgba(0,0,0,0.65), 0 0 4px rgba(0,0,0,0.6)";

export const CoverMuseo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
    {/* Sala del museo ampliada 1.3x: la bandera arcoíris queda centrada, entre el titular y la firma. */}
    <Img
      src={staticFile("jf3/fotos/museo-expo.jpg")}
      style={{
        position: "absolute",
        width: 1404,
        height: 2496,
        left: -230,
        top: -260,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.55) 24%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.65) 84%, rgba(0,0,0,0.85) 100%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 300, textAlign: "center" }}>
      <div
        style={{
          background: YELLOW,
          color: "#141414",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: 2,
          padding: "10px 24px",
          textTransform: "uppercase",
          transform: "rotate(-2deg)",
          marginBottom: 18,
        }}
      >
        Museo Nacional · 63 piezas
      </div>
      <div style={{ fontFamily: Bebas, fontSize: 200, lineHeight: 0.92, color: "white", textShadow: SHADOW }}>
        LA MEMORIA
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 200,
          lineHeight: 0.92,
          color: "white",
          background: RED,
          padding: "10px 34px 0",
          marginTop: 10,
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        NO SE BORRA
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1520 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
        <div style={{ fontFamily: Anton, fontSize: 60, lineHeight: 1, color: "white", textShadow: SHADOW }}>
          Juan Felipe Castaño
        </div>
        <Bandera height={8} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
