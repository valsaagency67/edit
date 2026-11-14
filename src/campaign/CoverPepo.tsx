import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Portada del video de cultura política (Pepo1, 1080x1920), sin Juan Felipe (lo pidió el cliente): las imágenes
// del propio video (marcha liberal, Gaitán, «El liberalismo pide paz», la retoma del Palacio) regadas por el
// cuadro, con borde blanco y rotadas; el titular va en una banda azul noche en el centro. Fotos en
// public/pepo/fotos/cover-*.jpg (no versionadas: son de prensa). Todo dentro del recorte 4:5 (285–1635).
const RED = "#E30613";
const YELLOW = "#FCD116";
const NAVY = "#0B1736";
const SHADOW = "0 6px 22px rgba(0,0,0,0.6)";

const Foto: React.FC<{
  src: string;
  left: number;
  top: number;
  width: number;
  rotate: number;
}> = ({ src, left, top, width, rotate }) => (
  <Img
    src={staticFile(`pepo/fotos/${src}`)}
    style={{
      position: "absolute",
      left,
      top,
      width,
      border: "8px solid white",
      boxShadow: "0 14px 36px rgba(0,0,0,0.6)",
      transform: `rotate(${rotate}deg)`,
    }}
  />
);

export const CoverPepo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 40%, #1F3B8C 0%, ${NAVY} 60%, #050B1D 100%)`,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Bandera height={18} />
    </div>

    {/* Firma, arriba a la izquierda (como en los videos) */}
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 64,
        fontFamily: Anton,
        fontSize: 28,
        color: RED,
        textShadow: "0 2px 6px rgba(0,0,0,0.5)",
      }}
    >
      Juan Felipe Castaño
    </div>

    {/* Bloque rojo detrás de la foto de Gaitán (regado, como un recorte de tabloide) */}
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 300,
        width: 470,
        height: 320,
        background: RED,
        transform: "rotate(4deg)",
      }}
    />

    {/* Imágenes del video, regadas */}
    <Foto src="cover-marcha.jpg" left={50} top={300} width={440} rotate={-5} />
    <Foto src="cover-gaitan.jpg" left={590} top={330} width={400} rotate={5} />
    <Foto src="cover-liberalismo.jpg" left={60} top={1235} width={400} rotate={4} />
    <Foto src="cover-palacio.jpg" left={540} top={1260} width={480} rotate={-4} />

    {/* Banda azul con el titular */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 700,
        height: 490,
        background: "rgba(11,23,54,0.92)",
        borderTop: `6px solid ${YELLOW}`,
        borderBottom: `6px solid ${RED}`,
      }}
    />
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: 722,
        textAlign: "center",
      }}
    >
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
        Cultura política
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 130,
          lineHeight: 0.92,
          color: "white",
          marginTop: 18,
          textShadow: SHADOW,
        }}
      >
        HABLAMOS MÁS
        <br />
        DE POLÍTICA
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 100,
          lineHeight: 0.95,
          color: "white",
          background: RED,
          padding: "6px 28px 0",
          marginTop: 14,
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        Y ENTENDEMOS MENOS
      </div>
    </AbsoluteFill>

    {/* Pie: la consigna del video */}
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", top: 1610, textAlign: "center" }}
    >
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 72,
          lineHeight: 1,
          color: YELLOW,
          textShadow: SHADOW,
        }}
      >
        SER CRÍTICOS ES RECUPERAR LA POLÍTICA
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
