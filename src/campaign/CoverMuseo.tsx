import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video del fallo del Museo Nacional (1080x1920), pedida «referente al museo, con colores
// vivos, muy libertaria» (scripts/make_portada_museo.py): de fondo la sala de la exposición con la
// bandera arcoíris y los afiches, en color vivo; Juan Felipe recortado, serio, a la derecha con borde
// blanco y resplandor amarillo; arriba «LA MEMORIA NO SE BORRA» (su frase de cierre). Todo lo importante
// queda dentro del recorte 4:5 de la cuadrícula de Instagram (y 285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const SHADOW = "0 6px 22px rgba(0,0,0,0.65), 0 0 4px rgba(0,0,0,0.6)";

export const CoverMuseo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
    {/* Sala del museo: la bandera arcoíris queda a la izquierda, junto a su cabeza. */}
    <Img
      src={staticFile("jf3/fotos/museo-expo.jpg")}
      style={{
        position: "absolute",
        width: 1350,
        height: 2400,
        left: -270,
        top: -480,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.7) 86%, rgba(0,0,0,0.85) 100%)",
      }}
    />
    {/* Juan Felipe: borde blanco y resplandor amarillo para despegarlo del fondo. */}
    <Img
      src={staticFile("cover/museo-jf.png")}
      style={{
        position: "absolute",
        height: 1150,
        left: 300,
        bottom: 0,
        // El cuadro original cortaba el hombro izquierdo en recto: el pecho se desvanece hacia abajo.
        maskImage: "linear-gradient(180deg, black 60%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(180deg, black 60%, transparent 80%)",
        filter:
          "drop-shadow(0 0 0 white) drop-shadow(5px 0 0 white) drop-shadow(-5px 0 0 white) drop-shadow(0 -5px 0 white) drop-shadow(0 0 40px rgba(252,209,22,0.85))",
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
    <AbsoluteFill style={{ justifyContent: "flex-start", top: 1500, left: 60 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 7, alignSelf: "flex-start" }}>
        <div style={{ fontFamily: Anton, fontSize: 54, lineHeight: 1, color: "white", textShadow: SHADOW }}>
          Juan Felipe Castaño
        </div>
        <Bandera height={8} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
