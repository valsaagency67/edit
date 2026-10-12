import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";

// Portada 1080x1920. El bloque de texto queda dentro del recorte 4:5 que Instagram
// muestra en la cuadrícula del perfil (y 285–1635). Fondo: IMG_1713 a los 0.5 s (expresión seria, pedido del cliente).
const YELLOW = "#FFE600";
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img
      src={staticFile("cover/fondo.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.85) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 1020,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: Montserrat,
          fontWeight: 600,
          fontSize: 58,
          color: "white",
          textShadow: SHADOW,
        }}
      >
        Concejal,
      </div>
      <div
        style={{
          fontFamily: Montserrat,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 0.98,
          whiteSpace: "nowrap",
          letterSpacing: -1,
          color: "white",
          textShadow: SHADOW,
          maxWidth: 1000,
        }}
      >
        HACER CONTROL POLÍTICO
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
        NO ES UN SHOW
      </div>
      <div
        style={{
          marginTop: 34,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: Anton,
            fontSize: 56,
            lineHeight: 1,
            color: "white",
            textShadow: SHADOW,
          }}
        >
          Juan Felipe Castaño
        </div>
        <div
          style={{
            display: "flex",
            height: 7,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {BRAND.map((c) => (
            <div key={c} style={{ flex: 1, backgroundColor: c }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
