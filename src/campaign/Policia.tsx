import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Anton, Montserrat } from "./font";

// Pieza de la petición: IMG_1698 (15.55–18.10 s y 28.38–37.30 s), en gris.
// public/policia/clip.mp4 ya trae las dos tomas unidas (11.5 s) y en escala de grises
// (render_edl.py con la lista de 2 tomas, luego hue=s=0 en ffmpeg).
// Tiempos en segundos de salida; a 30 fps. Sin zoom ni sacudidas: solo cortes y desenfoque -> nítido.

export const POLICIA_FPS = 30;
export const POLICIA_DURATION_S = 13.5;
export const policiaDuration = Math.round(POLICIA_DURATION_S * POLICIA_FPS);

const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const SHADOW = "0 4px 18px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.6)";
const f = (s: number) => Math.round(s * POLICIA_FPS);

// Subtítulos base (texto de IMG_1698.json). Amarillo para las palabras de acusación.
type Piece = { t: string; y?: boolean };
const CAPTIONS: { from: number; to: number; pieces: Piece[] }[] = [
  { from: 0.05, to: 1.33, pieces: [{ t: "nos están " }, { t: "censurando", y: true }] },
  { from: 1.33, to: 2.39, pieces: [{ t: "no podemos grabar" }] },
  { from: 2.58, to: 5.22, pieces: [{ t: "Nos está apuntando directamente la cámara" }] },
  { from: 5.22, to: 6.98, pieces: [{ t: "de la " }, { t: "Policía Nacional,", y: true }] },
  { from: 6.98, to: 9.38, pieces: [{ t: "donde nos dicen que van a llegar de inmediato" }] },
  { from: 9.38, to: 11.38, pieces: [{ t: "justamente porque estamos aquí grabando." }] },
];

// Íconos de línea blancos (viewBox 100x100, trazo 6), hechos a mano para esta pieza.
const ICONS = {
  eyeoff: (
    <>
      <path d="M10 50c8-14 22-22 40-22s32 8 40 22c-8 14-22 22-40 22S18 64 10 50z" />
      <circle cx="50" cy="50" r="12" />
      <path d="M18 14l64 72" />
    </>
  ),
  shield: (
    <>
      <path d="M50 10l32 12v22c0 22-14 36-32 46-18-10-32-24-32-46V22z" />
      <path d="M50 32l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" />
    </>
  ),
  camera: (
    <>
      <rect x="10" y="30" width="80" height="50" rx="6" />
      <path d="M34 30l6-10h20l6 10" />
      <circle cx="50" cy="55" r="16" />
    </>
  ),
  cameraoff: (
    <>
      <rect x="10" y="30" width="80" height="50" rx="6" />
      <path d="M34 30l6-10h20l6 10" />
      <circle cx="50" cy="55" r="16" />
      <path d="M12 12l76 76" />
    </>
  ),
};

// Entrada (desenfoque -> nítido, 0.2 s) y salida (nítido -> desenfoque, 0.2 s) dentro de
// su propio tiempo: la animación termina antes de que entre la siguiente tarjeta.
const IO = 6;
const inOut = (frame: number, dur: number) => {
  const o = interpolate(frame, [0, IO, dur - IO, dur], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const blur = interpolate(frame, [0, IO, dur - IO, dur], [12, 0, 0, 12], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return { o, blur };
};

const CardView: React.FC<{ icon: keyof typeof ICONS; text: string; color: string; dur: number }> = ({
  icon,
  text,
  color,
  dur,
}) => {
  const frame = useCurrentFrame();
  const { o, blur } = inOut(frame, dur);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 420,
        opacity: o,
        filter: `blur(${blur}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <svg
          width={280}
          height={280}
          viewBox="0 0 100 100"
          fill="none"
          stroke="white"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.4))" }}
        >
          {ICONS[icon]}
        </svg>
        <div
          style={{
            maxWidth: 940,
            padding: "18px 36px",
            background: color,
            color: "white",
            fontFamily: Anton,
            fontSize: 96,
            lineHeight: 1.05,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CaptionView: React.FC<{ pieces: Piece[]; dur: number }> = ({ pieces, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4, dur - 4, dur], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", top: 1160 }}>
      <div
        style={{
          opacity: o,
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
        {pieces.map((p, i) => (
          <span key={i} style={{ color: p.y ? YELLOW : "white" }}>
            {p.t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Firma igual que en el video de campaña: nombre en rojo, sin recuadro, y la barra de
// 5 colores de la marca debajo del nombre. Arriba a la izquierda, dentro de la zona 4:5.
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const Firma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 64,
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 5,
      }}
    >
      <div
        style={{
          fontFamily: Anton,
          fontSize: 28,
          color: RED,
          lineHeight: 1,
          textShadow: "0 0 2px rgba(255,255,255,0.9), 0 1px 6px rgba(0,0,0,0.55)",
        }}
      >
        Juan Felipe Castaño
      </div>
      <div style={{ display: "flex", width: "100%", height: 4, borderRadius: 2, overflow: "hidden" }}>
        {BRAND.map((c) => (
          <div key={c} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
};

export const Policia: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Música dramática (scripts/make_drama.py, muestras CC-BY 3.0, ver CREDITOS.md).
        -18 LUFS x 0.35 (-9 dB): se oye en el momento sin tapar la voz (-16 LUFS). */}
    <Html5Audio src={staticFile("policia/dramatico.wav")} volume={0.35} />
    {/* Foley sintético alineado con cada acción (scripts/make_foley.py). */}
    <Html5Audio src={staticFile("policia/foley.wav")} volume={0.9} />

    <Sequence from={0} durationInFrames={f(11.5)}>
      <OffthreadVideo
        src={staticFile("policia/clip.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Sequence>

    {CAPTIONS.map((c) => (
      <Sequence key={c.from} from={f(c.from)} durationInFrames={f(c.to) - f(c.from)}>
        <CaptionView pieces={c.pieces} dur={f(c.to) - f(c.from)} />
      </Sequence>
    ))}

    <Sequence from={f(0)} durationInFrames={f(2.45)}>
      <CardView icon="eyeoff" text="Nos están censurando" color={RED} dur={f(2.45)} />
    </Sequence>
    <Sequence from={f(2.6)} durationInFrames={f(4.3)}>
      <CardView icon="shield" text="Llega la Policía Nacional" color={BLUE} dur={f(4.3)} />
    </Sequence>
    <Sequence from={f(7.0)} durationInFrames={f(4.4)}>
      <CardView icon="camera" text="Porque estamos grabando" color={RED} dur={f(4.4)} />
    </Sequence>
    <Sequence from={f(11.5)} durationInFrames={f(2.0)}>
      <CardView icon="cameraoff" text="No nos dejan grabar" color={RED} dur={f(2.0)} />
    </Sequence>

    <Sequence from={0} durationInFrames={policiaDuration}>
      <Firma />
    </Sequence>
  </AbsoluteFill>
);
