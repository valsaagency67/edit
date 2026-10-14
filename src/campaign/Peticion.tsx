import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Anton, Montserrat } from "./font";
import evidencia from "./evidencia.json";
import raw from "./peticion.json";

// Video completo de la petición (todas las tomas de la lista de la cabina). Solo el primer clip
// (la censura) va en gris; el resto en color. Se quitan las pausas para que hable de seguido.
// Tramos, subtítulos, tarjetas y duración: scripts/build_peticion.py -> peticion.json.
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

// Evidencia del derecho de petición: recorte real del correo (scripts/make_evidencia.py) sobre una
// hoja blanca, con un resaltador amarillo que pasa de izquierda a derecha por las líneas clave.
// Va a la altura de las tarjetas (anclada abajo en y=1120) para no tapar los subtítulos.
const EV_W = 1000; // ancho de la hoja
const EV_PAD = 20;
const EvidenceView: React.FC<{ img: number; title: string; quote: string; dur: number }> = ({
  img,
  title,
  quote,
  dur,
}) => {
  const frame = useCurrentFrame();
  const ev = evidencia[img];
  const o = interpolate(frame, [0, IO, dur - IO, dur], [0, 1, 1, 0], clamp);
  const blur = interpolate(frame, [0, IO, dur - IO, dur], [12, 0, 0, 12], clamp);
  const s = (EV_W - 2 * EV_PAD) / ev.w;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ backgroundColor: "black", opacity: 0.45 }} />
      <div
        style={{
          position: "absolute",
          left: (1080 - EV_W) / 2,
          width: EV_W,
          bottom: 1920 - 1120,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          filter: `blur(${blur}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              background: RED,
              color: "white",
              fontFamily: Montserrat,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 3,
              padding: "8px 16px",
              textTransform: "uppercase",
            }}
          >
            Evidencia
          </div>
          <div
            style={{
              fontFamily: Anton,
              fontSize: 60,
              lineHeight: 1,
              color: "white",
              textTransform: "uppercase",
              textShadow: SHADOW,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            background: "white",
            padding: EV_PAD,
            borderRadius: 10,
            boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
          }}
        >
          <Img src={staticFile(ev.src)} style={{ display: "block", width: ev.w * s, height: ev.h * s }} />
          {ev.marks.map(([x0, y0, x1, y1], i) => {
            const start = IO + 4 + i * 5;
            const p = interpolate(frame, [start, start + 9], [0, 1], clamp);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: EV_PAD + x0 * s,
                  top: EV_PAD + y0 * s,
                  width: (x1 - x0) * s * p,
                  height: (y1 - y0) * s,
                  background: "rgba(255, 222, 0, 0.5)",
                  mixBlendMode: "multiply",
                  borderRadius: 3,
                }}
              />
            );
          })}
        </div>
        {quote ? (
          // El dato clave en grande: el texto del correo se ve pequeño en el celular.
          <div
            style={{
              alignSelf: "flex-start",
              background: YELLOW,
              color: "#111",
              fontFamily: Montserrat,
              fontWeight: 800,
              fontSize: 40,
              lineHeight: 1.15,
              padding: "10px 18px",
              whiteSpace: "pre-line",
              opacity: interpolate(frame, [IO + 14, IO + 20], [0, 1], clamp),
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {quote}
          </div>
        ) : null}
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

const VIDEO_FRAMES = raw.videoFrames;
const BASE = staticFile("policia/peticion-base.mp4");
const VOICE = staticFile("policia/peticion-voz.wav");
// Solo el primer clip va en gris (pedido del cliente); el resto en color.
const GRAY = "grayscale(1) contrast(1.12) brightness(0.98)";
const FILL: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const LAST = raw.ranges[raw.ranges.length - 1];

// Un tramo conservado de la base (los cortes de pausas quedan entre tramos), acelerado a
// raw.speed (el audio usa atempo: el tono no cambia). `dur` son cuadros de la base y `outDur` los
// que ocupa en el video. La voz lleva un fundido de 1 cuadro en cada borde para que no haga clic.
const Tramo: React.FC<{ base: number; dur: number; outDur: number; gray: boolean }> = ({
  base,
  dur,
  outDur,
  gray,
}) => (
  <>
    <OffthreadVideo src={BASE} trimBefore={base} trimAfter={base + dur} playbackRate={raw.speed} muted
      style={{ ...FILL, filter: gray ? GRAY : undefined }} />
    <Html5Audio src={VOICE} trimBefore={base} trimAfter={base + dur} playbackRate={raw.speed}
      volume={(fr) => interpolate(fr, [0, 1, outDur - 1, outDur], [0, 1, 1, 0], clamp)} />
  </>
);

export const Peticion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Música propia de esta pieza (piano en Fa menor, muestras CC-BY 3.0, ver CREDITOS.md).
        -18 LUFS x 0.18 (-15 dB): ~17 dB bajo la voz, como pidió el cliente. */}
    <Html5Audio src={staticFile("policia/peticion-drama.wav")} volume={0.18} />
    {/* Foley sintético alineado con subtítulos, tarjetas y cortes. */}
    <Html5Audio src={staticFile("policia/peticion-foley.wav")} volume={0.8} />

    {/* Imagen y voz (cada toma a -16 LUFS con la cadena de enhance_voice.py), tramo por tramo. */}
    {raw.ranges.map((r) => (
      <Sequence key={r.out} from={r.out} durationInFrames={r.outDur} premountFor={15}>
        <Tramo base={r.base} dur={r.dur} outDur={r.outDur} gray={r.gray} />
      </Sequence>
    ))}
    <Sequence from={VIDEO_FRAMES} durationInFrames={peticionDuration - VIDEO_FRAMES}>
      {/* trimBefore lleva la base a su último cuadro conservado; Freeze lo deja quieto ahí. */}
      <Freeze frame={0}>
        <OffthreadVideo src={BASE} trimBefore={LAST.base + LAST.dur - 1} muted
          style={{ ...FILL, filter: LAST.gray ? GRAY : undefined }} />
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

    {raw.evidence.map((e) => (
      <Sequence key={e.from} from={f(e.from)} durationInFrames={Math.max(1, f(e.to) - f(e.from))}>
        <EvidenceView img={e.img} title={e.title} quote={e.quote} dur={Math.max(1, f(e.to) - f(e.from))} />
      </Sequence>
    ))}

    <Sequence  durationInFrames={peticionDuration}>
      <Firma />
    </Sequence>
  </AbsoluteFill>
);
