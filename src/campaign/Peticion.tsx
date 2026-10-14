import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Anton, Montserrat } from "./font";
import raw from "./peticion.json";

// Video completo de la petición (todas las tomas de la lista de la cabina), en gris.
// Tiempos de subtítulos, tarjetas, cortes y duración: scripts/build_peticion.py -> peticion.json.
// Sin zoom ni sacudidas: cortes, destello breve en cada cambio de clip, y entrada/salida con desenfoque.
//
// Composición vertical (1080x1920):
//   300-340   firma (nombre + barra de colores), arriba a la izquierda
//   ~300-800  cara de Juan Felipe en todos los planos: ahí no va ningún gráfico
//   ~880-1120 tarjetas (ícono a la izquierda + texto), ancladas por abajo en 1120
//   1160+     subtítulos

export const PETICION_FPS = raw.fps;
export const peticionDuration = Math.round(raw.duration * raw.fps);

const RED = "#E30613";
const BLUE = "#1D3E9E";
const YELLOW = "#FFE600";
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const SHADOW = "0 4px 18px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.6)";
const COLORS: Record<string, string> = { red: RED, blue: BLUE };
const f = (s: number) => Math.round(s * PETICION_FPS);
const clamp = { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const };

// Íconos de línea blancos (viewBox 100x100, trazo 6), hechos a mano para esta pieza.
const ICONS: Record<string, React.ReactNode> = {
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
  calendar: (
    <>
      <rect x="12" y="20" width="76" height="66" rx="6" />
      <path d="M12 40h76M32 12v14M68 12v14" />
      <path d="M30 58h8M46 58h8M62 58h8M30 74h8M46 74h8" />
    </>
  ),
  clock: (
    <>
      <circle cx="50" cy="50" r="38" />
      <path d="M50 26v26l16 10" />
    </>
  ),
  chart: (
    <>
      <path d="M14 86h74" />
      <path d="M22 80V56M42 80V36M62 80V48M82 80V22" />
    </>
  ),
  people: (
    <>
      <circle cx="50" cy="32" r="11" />
      <path d="M30 78c0-12 9-21 20-21s20 9 20 21" />
      <circle cx="22" cy="42" r="8" />
      <path d="M8 76c0-9 6-15 14-15 3 0 6 1 8 3" />
      <circle cx="78" cy="42" r="8" />
      <path d="M92 76c0-9-6-15-14-15-3 0-6 1-8 3" />
    </>
  ),
  doc: (
    <>
      <path d="M26 10h36l16 16v64H26z" />
      <path d="M62 10v16h16" />
      <path d="M38 48h24M38 60h24M38 72h16" />
    </>
  ),
  mail: (
    <>
      <rect x="10" y="26" width="80" height="50" rx="6" />
      <path d="M12 30l38 28 38-28" />
      <path d="M12 74l28-24M88 74L60 50" />
    </>
  ),
  city: (
    <>
      <path d="M14 88V40h22v48M36 88V16h28v72M64 88V44h22v44" />
      <path d="M8 88h84" />
      <path d="M44 28h6M44 40h6M44 52h6M44 64h6M72 56h6M72 68h6" />
    </>
  ),
};

// Entrada (desenfoque -> nítido) y salida (nítido -> desenfoque) de 0.2 s dentro de su tiempo:
// la animación termina antes de que entre la siguiente tarjeta.
const IO = 6;

const CardView: React.FC<{ icon: string; kicker: string; text: string; color: string; dur: number }> = ({
  icon,
  kicker,
  text,
  color,
  dur,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, IO, dur - IO, dur], [0, 1, 1, 0], clamp);
  const blur = interpolate(frame, [0, IO, dur - IO, dur], [12, 0, 0, 12], clamp);
  return (
    <AbsoluteFill style={{ opacity: o, filter: `blur(${blur}px)` }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 1920 - 1120,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <svg
          width={170}
          height={170}
          viewBox="0 0 100 100"
          fill="none"
          stroke="white"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))" }}
        >
          {ICONS[icon]}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          {kicker ? (
            <div
              style={{
                fontFamily: Montserrat,
                fontWeight: 800,
                fontSize: 36,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "white",
                textShadow: SHADOW,
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              maxWidth: 720,
              padding: "14px 28px",
              background: color,
              color: "white",
              fontFamily: Anton,
              fontSize: 76,
              lineHeight: 1.05,
              textTransform: "uppercase",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CaptionView: React.FC<{ pieces: { t: string; y: boolean }[]; dur: number }> = ({ pieces, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
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

// Destello blanco de 0.2 s en cada cambio de clip (interrupción de patrón, sin zoom ni sacudida).
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [0.55, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: "white", opacity: o }} />;
};

// Firma igual que en el video de campaña: nombre en rojo y la barra de 5 colores debajo.
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

// Cierre: el último cuadro queda congelado y se oscurece para que la pregunta final se lea sola.
const Dim: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 9], [0, 0.45], clamp);
  return <AbsoluteFill style={{ backgroundColor: "black", opacity: o }} />;
};

const VIDEO_FRAMES = f(raw.videoDuration);

export const Peticion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Voz mejorada, cada toma a -16 LUFS (scripts/build_peticion.py, cadena de enhance_voice.py). */}
    <Html5Audio src={staticFile("policia/peticion-voz.wav")} />
    {/* Música de muestras reales (CC-BY 3.0, ver CREDITOS.md), -18 LUFS x 0.35: ~11 dB bajo la voz. */}
    <Html5Audio src={staticFile("policia/peticion-drama.wav")} volume={0.35} />
    {/* Foley sintético alineado con subtítulos, tarjetas y cortes. */}
    <Html5Audio src={staticFile("policia/peticion-foley.wav")} volume={0.9} />

    <Sequence  durationInFrames={VIDEO_FRAMES}>
      <OffthreadVideo
        src={staticFile("policia/peticion.mp4")}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Sequence>
    <Sequence from={VIDEO_FRAMES} durationInFrames={peticionDuration - VIDEO_FRAMES}>
      {/* trimBefore lleva el video a su último cuadro; Freeze lo deja quieto ahí. */}
      <Freeze frame={0}>
        <OffthreadVideo
          src={staticFile("policia/peticion.mp4")}
          trimBefore={VIDEO_FRAMES - 1}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
      <Dim />
    </Sequence>

    {raw.cuts.map((t) => (
      <Sequence key={t} from={f(t)} durationInFrames={6}>
        <Flash />
      </Sequence>
    ))}

    {raw.captions.map((c) => (
      <Sequence key={c.from} from={f(c.from)} durationInFrames={Math.max(1, f(c.to) - f(c.from))}>
        <CaptionView pieces={c.pieces} dur={Math.max(1, f(c.to) - f(c.from))} />
      </Sequence>
    ))}

    {raw.cards.map((c) => (
      <Sequence key={c.from} from={f(c.from)} durationInFrames={Math.max(1, f(c.to) - f(c.from))}>
        <CardView
          icon={c.icon}
          kicker={c.kicker}
          text={c.text}
          color={COLORS[c.color]}
          dur={Math.max(1, f(c.to) - f(c.from))}
        />
      </Sequence>
    ))}

    <Sequence  durationInFrames={peticionDuration}>
      <Firma />
    </Sequence>
  </AbsoluteFill>
);
