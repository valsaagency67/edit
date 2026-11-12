import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Montserrat, Playfair } from "./font";
import raw from "./pepo3.json";
import { TomasData, TomasVideo } from "./Tomas";

// Video «cinematográfico» de Juan Felipe (carpeta de Drive «Pepo 3», scripts/build_pepo3.py, tiempos en
// pepo3.json): caso dramatizado de la tarjeta de crédito vaciada. Como el video de referencia que mandó el
// cliente: color de cine (en el armado), subtítulos de una o dos palabras en serifa, y palabras grandes que
// aparecen detrás de Juan Felipe (la palabra y encima su recorte, cuadro a cuadro, dentro del zoom) o delante.

type Big = {
  scene: string;
  text: string;
  layer: "behind" | "front";
  style?: "tag";
  start: number;
  end: number;
  shotStart: number;
  src: string;
};

const data = raw as unknown as TomasData & { big: Big[] };
const FPS = data.fps;
const f = (s: number) => Math.round(s * FPS);
const GOLD = "#E9C46A";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const PEPO3_FPS = FPS;
export const pepo3Duration = Math.round(data.duration * FPS);

// Entrada con desenfoque y escala, salida con fundido: se usa en las palabras de detrás y de delante.
const useIn = (dur: number) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 6], [0, 1], clamp);
  const out = interpolate(frame, [dur - 4, dur], [1, 0], clamp);
  return { k, o: Math.min(k, out) };
};

// Palabra gigante detrás de la persona: la palabra y, encima, el recorte de la persona del mismo cuadro.
const Behind: React.FC<{ b: Big; dur: number }> = ({ b, dur }) => {
  const frame = useCurrentFrame();
  const { k, o } = useIn(dur);
  const n = f(b.start) - f(b.shotStart) + frame;
  // Playfair 900 mide ~0,72 em por letra: la palabra ocupa ~1000 px de ancho como máximo.
  const size = Math.min(210, Math.round(1000 / (b.text.length * 0.72)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 660 - size * 0.55 }}>
        <div
          style={{
            opacity: o,
            filter: `blur(${(1 - k) * 10}px)`,
            transform: `scale(${1.14 - 0.14 * k})`,
            fontFamily: Playfair,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: -2,
            color: "rgba(255,255,255,0.94)",
            textShadow: "0 10px 40px rgba(0,0,0,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          {b.text}
        </div>
      </AbsoluteFill>
      <Img src={staticFile(`pepo3/matte/${b.src}/${n}.png`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

// Palabra delante: itálica dorada grande, o la etiqueta «PASO 1» con una línea fina.
const Front: React.FC<{ b: Big; dur: number }> = ({ b, dur }) => {
  const { k, o } = useIn(dur);
  if (b.style === "tag") {
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 400 }}>
        <div
          style={{
            opacity: o,
            transform: `translateY(${(1 - k) * 14}px)`,
            fontFamily: Montserrat,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: 10,
            color: "white",
            paddingBottom: 10,
            borderBottom: `3px solid ${GOLD}`,
            textShadow: "0 3px 12px rgba(0,0,0,0.7)",
          }}
        >
          {b.text}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 930 }}>
      <div
        style={{
          opacity: o,
          filter: `blur(${(1 - k) * 8}px)`,
          transform: `scale(${0.92 + 0.08 * k})`,
          maxWidth: 980,
          fontFamily: Playfair,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: b.text.length > 14 ? 92 : 118,
          lineHeight: 1.02,
          textAlign: "center",
          color: GOLD,
          textShadow: "0 6px 26px rgba(0,0,0,0.8)",
        }}
      >
        {b.text}
      </div>
    </AbsoluteFill>
  );
};

// Es una recreación: se dice en pantalla para que la escena no pase por un caso real grabado.
const Dramatizacion: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 304,
      right: 64,
      fontFamily: Montserrat,
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: 6,
      color: "rgba(255,255,255,0.7)",
      textShadow: "0 2px 6px rgba(0,0,0,0.6)",
    }}
  >
    DRAMATIZACIÓN
  </div>
);

export const Pepo3: React.FC = () => {
  const seq = (b: Big, i: number, node: React.ReactNode) => (
    <Sequence key={`${b.layer}-${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}>
      {node}
    </Sequence>
  );
  const behind = data.big.map((b, i) =>
    b.layer === "behind" ? seq(b, i, <Behind b={b} dur={f(b.end) - f(b.start)} />) : null,
  );
  const front = data.big.map((b, i) =>
    b.layer === "front" ? seq(b, i, <Front b={b} dur={f(b.end) - f(b.start)} />) : null,
  );
  return (
    <TomasVideo
      data={data}
      dir="pepo3"
      captionTop={1180}
      captionCine
      punch={1.16}
      punchOrigin="50% 36%"
      hideCaptions={data.big.filter((b) => b.style !== "tag")}
      inner={behind}
      overlay={
        <>
          {front}
          <Dramatizacion />
        </>
      }
    />
  );
};
