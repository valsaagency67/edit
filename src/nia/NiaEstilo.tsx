import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Bebas, Montserrat, Playfair } from "../campaign/font";

// Propuesta de estilo para el video de Nia («La filosofía se vive en la calle»): colorimetría
// pastel (lila, amarillo mantequilla, rosa) en vez de los colores de campaña de Juan Felipe.
// Dos cuadros de muestra: el gancho con la frase inicial y un subtítulo normal.

export const NIA = {
  lila: "#CDB8F0",
  lavanda: "#9C82D4",
  amarillo: "#FFE9A8",
  rosa: "#F6C9DA",
  crema: "#FFF8EC",
  ciruela: "#3E2F5B",
};
const GRAD = `linear-gradient(90deg, ${NIA.lila}, ${NIA.rosa}, ${NIA.amarillo})`;
const SHADOW = "0 3px 14px rgba(62,47,91,0.55), 0 0 2px rgba(62,47,91,0.6)";

const Barra: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 42, background: "rgba(255,248,236,0.28)" }}>
    <div style={{ width: `${p * 100}%`, height: "100%", background: GRAD, borderRadius: "0 21px 21px 0" }} />
  </div>
);

const Firma: React.FC = () => (
  <div style={{ position: "absolute", top: 300, left: 64 }}>
    <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 44, color: NIA.crema, textShadow: SHADOW }}>Nia</div>
    <div style={{ width: 96, height: 6, borderRadius: 3, background: GRAD, marginTop: 4 }} />
  </div>
);

const Gancho: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 1080, textAlign: "center" }}>
    <div
      style={{
        fontFamily: Bebas,
        fontSize: 190,
        lineHeight: 0.95,
        color: NIA.ciruela,
        background: NIA.amarillo,
        padding: "8px 38px 0",
        borderRadius: 28,
        boxShadow: "0 10px 40px rgba(62,47,91,0.25)",
      }}
    >
      LA FILOSOFÍA
    </div>
    <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 92, color: NIA.crema, textShadow: SHADOW, marginTop: 22 }}>
      no empieza en un <span style={{ color: NIA.lila }}>libro</span>
    </div>
  </AbsoluteFill>
);

const Subtitulo: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", top: 1160 }}>
    <div
      style={{
        maxWidth: 940,
        fontFamily: Montserrat,
        fontWeight: 600,
        fontSize: 64,
        lineHeight: 1.2,
        color: "white",
        textAlign: "center",
        textShadow: SHADOW,
      }}
    >
      cuando cuestionas una <span style={{ color: NIA.amarillo }}>injusticia</span>
    </div>
  </AbsoluteFill>
);

export const NiaEstilo: React.FC<{ variante: "gancho" | "subtitulo" }> = ({ variante }) => (
  <AbsoluteFill style={{ backgroundColor: NIA.ciruela }}>
    <Img src={staticFile(variante === "gancho" ? "nia/estilo-v1.png" : "nia/estilo-v2.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    {variante === "gancho" ? <Gancho /> : <Subtitulo />}
    <Firma />
    <Barra p={variante === "gancho" ? 0.06 : 0.3} />
  </AbsoluteFill>
);
