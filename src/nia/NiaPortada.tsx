import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Playfair } from "../campaign/font";
import { Bootzy } from "./fontNia";
import { Bloque, BZ, GRAD, Serif, SHADOW } from "./Nia";
import { NIA } from "./NiaEstilo";

// Portada del video de Nia: ella con el libro de Arendt mirando a cámara (toma V6 a 2.1 s, con la misma
// gradación del video) y el título abajo, sobre los jeans, para no tapar la cara ni el libro. El texto
// cabe en el recorte 4:5 de la cuadrícula de Instagram (y entre 285 y 1635).
export const NiaPortada: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NIA.ciruela }}>
    <Img src={staticFile("nia/portada-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(40,26,64,0.55) 72%, rgba(40,26,64,0.75) 100%)" }}
    />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1122, textAlign: "center" }}>
      <Bloque size={110}>LA FILOSOFÍA</Bloque>
      <div style={{ marginTop: -8 }}>
        <Serif size={70}>no empieza en un libro,</Serif>
      </div>
      <div
        style={{
          fontFamily: Bootzy,
          fontSize: 84,
          lineHeight: 1,
          marginTop: 8,
          color: NIA.crema,
          textShadow: `0 5px 0 ${NIA.lavanda}, ${SHADOW}`,
        }}
      >
        <BZ t="EMPIEZA EN LA" />
      </div>
      <div style={{ marginTop: 10 }}>
        <Bloque size={132}>CALLE</Bloque>
      </div>
    </AbsoluteFill>
    <div style={{ position: "absolute", top: 300, left: 64 }}>
      <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 56, color: NIA.crema, textShadow: SHADOW }}>Nia</div>
      <div style={{ width: 120, height: 7, borderRadius: 4, background: GRAD, marginTop: 4 }} />
    </div>
  </AbsoluteFill>
);
