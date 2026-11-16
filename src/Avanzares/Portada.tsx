import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// Portada del Reel (1080x1920). Lo importante (logo, título y fotos) queda
// dentro de la zona central 1080x1350 que Instagram muestra en la cuadrícula.

const fontFamily = "Montserrat";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/montserrat-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});

const RED = "#AE2C36";
const RED_DARK = "#7E1C25";
const WHITE = "#FFFFFF";

const PHOTOS: { src: string; pos: string; rot: number }[] = [
  { src: "avanzares/portada/amarillo.png", pos: "50% 22%", rot: -3 },
  { src: "avanzares/portada/valentina.png", pos: "50% 22%", rot: 2.5 },
  { src: "avanzares/portada/gorra.png", pos: "50% 18%", rot: 2 },
  { src: "avanzares/portada/pareja.png", pos: "50% 26%", rot: -2.5 },
];

const Photo: React.FC<{ src: string; pos: string; rot: number }> = ({
  src,
  pos,
  rot,
}) => (
  <div
    style={{
      width: 380,
      height: 380,
      background: WHITE,
      padding: 10,
      borderRadius: 26,
      transform: `rotate(${rot}deg)`,
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
    }}
  >
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: pos,
        borderRadius: 18,
      }}
    />
  </div>
);

export const Portada: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, ${RED} 0%, ${RED} 45%, ${RED_DARK} 100%)`,
        fontFamily,
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <Img
        src={staticFile("avanzares/logo_blanco.png")}
        style={{ position: "absolute", top: 290, width: 340 }}
      />

      {/* Título */}
      <div
        style={{
          position: "absolute",
          top: 590,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: WHITE,
            fontWeight: 900,
            fontSize: 84,
            lineHeight: 1,
            letterSpacing: 1,
          }}
        >
          ¿Qué opinan
        </div>
        <div
          style={{
            marginTop: 12,
            background: WHITE,
            color: RED,
            fontWeight: 900,
            fontSize: 70,
            lineHeight: 1,
            padding: "14px 30px",
            borderRadius: 18,
            transform: "rotate(-1.5deg)",
          }}
        >
          nuestros clientes?
        </div>
      </div>

      {/* Fotos */}
      <div
        style={{
          position: "absolute",
          top: 830,
          display: "grid",
          gridTemplateColumns: "380px 380px",
          gap: 30,
        }}
      >
        {PHOTOS.map((p) => (
          <Photo key={p.src} {...p} />
        ))}
      </div>

      {/* Productos (solo se ve en pantalla completa) */}
      <div
        style={{
          position: "absolute",
          top: 1720,
          color: WHITE,
          fontWeight: 700,
          fontSize: 29,
          letterSpacing: 1,
          textTransform: "uppercase",
          opacity: 0.9,
        }}
      >
        Arequipes · Cremas de whisky · Vino · Conservas
      </div>
    </AbsoluteFill>
  );
};
