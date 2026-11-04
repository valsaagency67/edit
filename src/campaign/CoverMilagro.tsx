import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video del Fondo Milagro (1080x1920), pedida «alusiva al fondo, sin la cara de Juan, con el señor
// de la llave de cartón y Abelardo de la Espriella, con nuestros colores»: fondo azul noche con la bandera,
// la foto de la llave (inclinada, borde blanco) y Abelardo recortado (de la imagen de referencia del
// carrusel del IVA), detrás de la foto para que su brazo no la tape. Fotos en public/jf4/fotos/ (no versionadas). Todo dentro del recorte 4:5 (y 285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const NAVY = "#0B1736";
const SHADOW = "0 6px 22px rgba(0,0,0,0.6)";

export const CoverMilagro: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 70% 40%, #1F3B8C 0%, ${NAVY} 55%, #050B1D 100%)`,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>

    {/* Titular */}
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 300,
        textAlign: "center",
      }}
    >
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
        Terremoto del 10 de agosto
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 160,
          lineHeight: 0.92,
          color: "white",
          marginTop: 16,
          textShadow: SHADOW,
        }}
      >
        ¿Y LA PLATA DEL
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 170,
          lineHeight: 0.92,
          color: "white",
          background: RED,
          padding: "10px 34px 0",
          marginTop: 8,
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        FONDO MILAGRO?
      </div>
    </AbsoluteFill>

    {/* Abelardo de la Espriella */}
    <div style={{ position: "absolute", right: -40, top: 860, width: 560 }}>
      <Img
        src={staticFile("jf4/fotos/portada-abelardo.png")}
        style={{
          width: "100%",
          maskImage: "linear-gradient(180deg, black 62%, transparent 86%)",
          WebkitMaskImage:
            "linear-gradient(180deg, black 62%, transparent 86%)",
          filter: "drop-shadow(0 0 26px rgba(227,6,19,0.5))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 150,
          top: -10,
          background: YELLOW,
          color: NAVY,
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 21,
          padding: "6px 12px",
          textTransform: "uppercase",
          transform: "rotate(-3deg)",
        }}
      >
        Abelardo de la Espriella
      </div>
    </div>

    {/* El señor con la llave de cartón */}
    <Img
      src={staticFile("jf4/fotos/portada-llave.jpg")}
      style={{
        position: "absolute",
        left: 50,
        top: 760,
        width: 640,
        border: "10px solid white",
        boxShadow: "0 16px 44px rgba(0,0,0,0.6)",
        transform: "rotate(-4deg)",
      }}
    />

    {/* Cifra y pregunta */}
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 1300,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <div
          style={{
            fontFamily: Bebas,
            fontSize: 110,
            lineHeight: 0.95,
            color: NAVY,
            background: YELLOW,
            padding: "8px 24px 0",
            transform: "rotate(-2deg)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          $1 BILLÓN
        </div>
        <div
          style={{
            fontFamily: Bebas,
            fontSize: 110,
            lineHeight: 0.95,
            color: "white",
            textShadow: SHADOW,
          }}
        >
          ¿Y LAS CASAS?
        </div>
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
            fontSize: 56,
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
