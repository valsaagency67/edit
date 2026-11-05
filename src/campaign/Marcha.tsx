import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Anton, Bebas, Montserrat, Playfair } from "./font";
import raw from "./marcha.json";
import { Firma, Progress } from "./Peticion";

// Video de la marcha frente al CAM (IMG_3804), con el texto:
//   «¿Esto es el CAMBIO que nos PROMETIERON?» / «porque ningún MURO ni LEY del olvido» /
//   «silencia al que quiere la LIBERTAD».
// Tipografía cinética estilo Duvalier: cada línea entra en su momento (desenfoque -> nítido), y la
// letra va cambiando de frase en frase. «olvido» se va borrando letra por letra y «LIBERTAD» rota
// entre tipografías hasta quedarse fija. Sin zoom ni sacudidas. Tiempos en marcha.json.

export const MARCHA_FPS = raw.fps;
export const marchaDuration = Math.round(raw.duration * raw.fps);

const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const SHADOW = "0 4px 18px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.7)";
const f = (s: number) => Math.round(s * MARCHA_FPS);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const IO = 6;

const STYLES: Record<string, React.CSSProperties> = {
  small: { fontFamily: Montserrat, fontWeight: 600, fontSize: 62, color: "white" },
  wide: { fontFamily: Montserrat, fontWeight: 900, fontSize: 72, letterSpacing: -1, color: "white" },
  cambio: {
    fontFamily: Bebas,
    fontSize: 230,
    lineHeight: 0.95,
    color: "white",
    background: RED,
    padding: "0 34px",
    margin: "8px 0",
    textShadow: "none",
  },
  prometieron: { fontFamily: Playfair, fontStyle: "italic", fontSize: 128, color: YELLOW, lineHeight: 1.05 },
  muro: { fontFamily: Anton, fontSize: 170, lineHeight: 1, color: "white", letterSpacing: 4 },
  serifSmall: { fontFamily: Playfair, fontStyle: "italic", fontSize: 76, color: "white" },
  ley: {
    fontFamily: Bebas,
    fontSize: 280,
    lineHeight: 0.92,
    color: "white",
    background: BLUE,
    padding: "0 40px",
    margin: "6px 0",
    textShadow: "none",
  },
  olvido: { fontFamily: Playfair, fontStyle: "italic", fontSize: 104, color: "white" },
};

// Tipografías por las que rota «LIBERTAD» antes de quedarse en la final.
const CYCLE: React.CSSProperties[] = [
  { fontFamily: Anton, fontSize: 190 },
  { fontFamily: Playfair, fontStyle: "italic", fontSize: 170 },
  { fontFamily: Montserrat, fontWeight: 900, fontSize: 150, letterSpacing: -3 },
  { fontFamily: Bebas, fontSize: 250 },
  { fontFamily: Montserrat, fontWeight: 700, fontStyle: "italic", fontSize: 150 },
];
const LIBERTAD_FINAL: React.CSSProperties = {
  fontFamily: Bebas,
  fontSize: 290,
  color: YELLOW,
  textShadow: "0 6px 28px rgba(0,0,0,0.7), 0 0 40px rgba(255,230,0,0.35)",
};

type Line = { t: string; at: number; style: string; cycleUntil?: number };

// «olvido»: después de aparecer, sus letras se van apagando y desenfocando una tras otra (el «del»
// queda fijo). Termina a medio borrar, para que siga leyéndose.
const Olvido: React.FC<{ text: string; age: number }> = ({ text, age }) => {
  const cut = text.lastIndexOf(" ") + 1;
  return (
    <span>
      {text.slice(0, cut)}
      <Fading text={text.slice(cut)} age={age} />
    </span>
  );
};

const Fading: React.FC<{ text: string; age: number }> = ({ text, age }) => (
  <span>
    {text.split("").map((ch, i) => {
      const start = f(1.4) + i * 5;
      const o = interpolate(age, [start, start + 24], [1, 0.35], clamp);
      const b = interpolate(age, [start, start + 24], [0, 4], clamp);
      return (
        <span key={i} style={{ opacity: o, filter: `blur(${b}px)` }}>
          {ch}
        </span>
      );
    })}
  </span>
);

const LineView: React.FC<{ line: Line; phraseFrom: number }> = ({ line, phraseFrom }) => {
  const frame = useCurrentFrame(); // relativo al inicio de la frase
  const age = frame - (f(line.at) - f(phraseFrom));
  if (age < 0) {
    return <div style={{ ...STYLES[line.style], visibility: "hidden" }}>{line.t}</div>;
  }
  const o = interpolate(age, [0, IO], [0, 1], clamp);
  const blur = interpolate(age, [0, IO], [12, 0], clamp);
  let style: React.CSSProperties = STYLES[line.style] ?? {};
  let content: React.ReactNode = line.t;
  if (line.style === "libertad") {
    const settle = f(line.cycleUntil ?? line.at) - f(line.at);
    // Cambia cada 3 cuadros al principio y cada 6 al final: se siente que «busca» su letra.
    const step = age < settle / 2 ? 3 : 6;
    style =
      age >= settle
        ? LIBERTAD_FINAL
        : { ...CYCLE[Math.floor(age / step) % CYCLE.length], color: age % (2 * step) < step ? "white" : YELLOW };
    const pop = age >= settle ? interpolate(age - settle, [0, 4], [0.4, 1], clamp) : 1;
    style = { ...style, lineHeight: 1, opacity: pop };
  } else if (line.style === "olvido") {
    content = <Olvido text={line.t} age={age} />;
  }
  return (
    <div style={{ textShadow: SHADOW, ...style, opacity: (style.opacity as number ?? 1) * o, filter: `blur(${blur}px)` }}>
      {content}
    </div>
  );
};

const PhraseView: React.FC<{ lines: Line[]; from: number; dur: number }> = ({ lines, from, dur }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [dur - IO, dur], [1, 0], clamp);
  const outBlur = interpolate(frame, [dur - IO, dur], [0, 12], clamp);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 420,
        textAlign: "center",
        opacity: out,
        filter: `blur(${outBlur}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 1000 }}>
        {lines.map((l) => (
          <LineView key={l.t} line={l} phraseFrom={from} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Marcha: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Audio original de la marcha (cantos), normalizado a -16 LUFS en scripts/build_marcha.py. */}
    <OffthreadVideo src={staticFile("marcha/base.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    {/* Foley sintético alineado con cada línea (scripts/build_marcha.py). */}
    <Html5Audio src={staticFile("marcha/foley.wav")} volume={0.7} />

    {/* Sombra detrás del texto: el cielo y el edificio blanco del CAM son muy claros. */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0.5) 52%, rgba(0,0,0,0) 68%)",
      }}
    />

    {raw.phrases.map((p) => (
      <Sequence key={p.from} from={f(p.from)} durationInFrames={f(p.to) - f(p.from)}>
        <PhraseView lines={p.lines as Line[]} from={p.from} dur={f(p.to) - f(p.from)} />
      </Sequence>
    ))}

    <Firma />
    <Progress />
  </AbsoluteFill>
);
