import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video «¿Dónde acudir cuando te vulneran tus derechos?» (1080x1920). Fondo: IMG_0743
// (toma de «escuchar») a 1.14 s: contrapicado, de pie, cielo detrás y la gradería amarilla, azul y roja
// (el cliente pidió una foto más imponente que la del guadual). La cara queda arriba y el texto abajo,
// todo dentro del recorte 4:5 de la cuadrícula de Instagram (y 285–1635): la pregunta en azul,
// DERECHOS en Bebas sobre rojo y la firma con la bandera de Colombia.
const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.6)";

export const CoverDerechos: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img
      src={staticFile("cover/derechos-fondo.jpg")}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scale(1.22)",
        transformOrigin: "50% 0%",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 54%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.85) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 1000,
        textAlign: "center",
      }}
    >
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
      <div
        style={{
          fontFamily: Montserrat,
          fontWeight: 600,
          fontSize: 66,
          color: "white",
          textShadow: SHADOW,
        }}
      >
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
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", top: 1500 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: Anton,
            fontSize: 64,
            lineHeight: 1,
            color: "white",
            textShadow: SHADOW,
          }}
        >
          Juan Felipe Castaño
        </div>
        <Bandera height={8} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
