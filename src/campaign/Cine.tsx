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
import { TomasData, TomasVideo } from "./Tomas";

// Estilo «cinematográfico» de los videos de Juan Felipe (Pepo 3, Pepo 2; armados con scripts/build_pepo3.py):
// del video de referencia de CapCut, subtítulos de una o dos palabras en serifa y palabras grandes que aparecen
// detrás de Juan Felipe (la palabra y encima su recorte, cuadro a cuadro, dentro del zoom) o delante. El color
// va tal como viene (lo pidió el cliente).

type Big = {
  scene: string;
  text: string;
  layer: "behind" | "front";
  style?: "tag";
  start: number;
  end: number;
  shotStart: number;
  src: string;
  headTop?: number;
  baseline?: number;
};

type HookLine = { text: string; start: number; gold?: boolean };
export type CineData = TomasData & { big: Big[]; hook?: { start: number; end: number; lines: HookLine[] } };

// Gancho: líneas grandes debajo de la cara de Juan Felipe (y≈1010, para no taparla), cada una entra de golpe (escala y desenfoque cortos) en su palabra, sobre
// la toma oscurecida un poco abajo para que se lea. Se va con un fundido al terminar la escena.
const Hook: React.FC<{ h: NonNullable<CineData["hook"]>; dur: number }> = ({ h, dur }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [dur - 5, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 62%, rgba(0,0,0,0.25) 85%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1010, gap: 10 }}>
        {h.lines.map((l, i) => {
          const at = f(l.start) - f(h.start);
          // La línea que va desde el primer cuadro sale completa (es la que se ve al pasar el dedo).
          const k = at <= 0 ? 1 : interpolate(frame - at, [0, 5], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                opacity: k,
                filter: `blur(${(1 - k) * 8}px)`,
                transform: `scale(${1.25 - 0.25 * k})`,
                fontFamily: Playfair,
                fontWeight: 900,
                fontStyle: l.gold ? "italic" : "normal",
                fontSize: l.gold ? 138 : 112,
                whiteSpace: l.gold ? "nowrap" : "normal",
                lineHeight: 1,
                color: l.gold ? GOLD : "white",
                textAlign: "center",
                maxWidth: 1000,
                textShadow: "0 8px 30px rgba(0,0,0,0.8)",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
let FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const GOLD = "#E9C46A";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };


// Entrada con desenfoque y escala, salida con fundido: se usa en las palabras de detrás y de delante.
const useIn = (dur: number) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 6], [0, 1], clamp);
  const out = interpolate(frame, [dur - 4, dur], [1, 0], clamp);
  return { k, o: Math.min(k, out) };
};

// Palabra gigante detrás de la persona: la palabra y, encima, el recorte de la persona del mismo cuadro. Va
// centrada un poco debajo de donde empieza la cabeza (headTop, medido en el armado), así la cabeza tapa el centro.
const Behind: React.FC<{ b: Big; dur: number; dir: string }> = ({ b, dur, dir }) => {
  const frame = useCurrentFrame();
  const { k, o } = useIn(dur);
  const n = f(b.start) - f(b.shotStart) + frame;
  // Playfair 900 mide ~0,72 em por letra: la palabra ocupa ~1000 px de ancho como máximo.
  const size = Math.min(210, Math.round(1000 / (b.text.length * 0.72)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: (b.baseline ?? (b.headTop ?? 620) + 60) - size * 0.9 }}>
        <div
          style={{
            opacity: o,
            filter: `blur(${(1 - k) * 10}px)`,
            transform: `scale(${1.14 - 0.14 * k}) scaleY(1.5)`,
            transformOrigin: "50% 90%",
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
      {/* En su propia capa absoluta: un <Img> suelto (sin posición) se pinta DEBAJO de la palabra, que sí la tiene. */}
      <AbsoluteFill>
        <Img src={staticFile(`${dir}/matte/${b.src}/${n}.png`)} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Palabra delante: itálica dorada grande, o la etiqueta «PASO 1» con una línea fina.
const Front: React.FC<{ b: Big; dur: number }> = ({ b, dur }) => {
  const { k, o } = useIn(dur);
  if (b.style === "tag") {
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 228 }}>
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

export const CineVideo: React.FC<{ data: CineData; dir: string }> = ({ data, dir }) => {
  FPS = data.fps;
  const seq = (b: Big, i: number, node: React.ReactNode) => (
    <Sequence key={`${b.layer}-${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}>
      {node}
    </Sequence>
  );
  const behind = data.big.map((b, i) =>
    b.layer === "behind" ? seq(b, i, <Behind b={b} dur={f(b.end) - f(b.start)} dir={dir} />) : null,
  );
  const front = data.big.map((b, i) =>
    b.layer === "front" ? seq(b, i, <Front b={b} dur={f(b.end) - f(b.start)} />) : null,
  );
  return (
    <TomasVideo
      data={data}
      dir={dir}
      captionTop={1180}
      captionCine
      punch={1.16}
      punchOrigin="50% 36%"
      hideCaptions={[...data.big.filter((b) => b.style !== "tag"), ...(data.hook ? [data.hook] : [])]}
      brighten={data.hook ? [{ start: data.hook.start, end: data.hook.end, amount: 1.25 }] : []}
      inner={behind}
      overlay={
        <>
          {front}
          {data.hook ? (
            <Sequence from={f(data.hook.start)} durationInFrames={Math.max(1, f(data.hook.end) - f(data.hook.start))}>
              <Hook h={data.hook} dur={Math.max(1, f(data.hook.end) - f(data.hook.start))} />
            </Sequence>
          ) : null}
        </>
      }
      noFlash
      hideFirma={data.big.filter((b) => b.layer === "behind" && (b.baseline ?? 9999) < 520)}
    />
  );
};
