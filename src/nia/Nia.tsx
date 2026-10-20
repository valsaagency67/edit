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
import { Bebas, Montserrat, Playfair } from "../campaign/font";
import raw from "./nia.json";
import { NIA } from "./NiaEstilo";

// Video de Nia («La filosofía se vive en la calle»). Voz en off por escenas (scripts/build_nia.py,
// tiempos en nia.json), tomas selfie con gradación pastel y, donde todavía no hay video, un
// recuadro que dice qué toma va ahí. Paleta pastel: ver CLAUDE.md (sección Nia).

export const NIA_FPS = raw.fps;
export const niaDuration = Math.round(raw.duration * raw.fps);

type Word = { t: string; s: number; e: number };
type Shot = { start: number; end: number; src?: string; from?: number; placeholder?: string; card?: string; porque?: boolean };
type Scene = (typeof raw.scenes)[number] & { words: Word[]; shots: Shot[] };

const f = (s: number) => Math.round(s * NIA_FPS);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const SHADOW = "0 3px 14px rgba(62,47,91,0.55), 0 0 2px rgba(62,47,91,0.6)";
const GRAD = `linear-gradient(90deg, ${NIA.lila}, ${NIA.rosa}, ${NIA.amarillo})`;
const IO = 6;
const scenes = raw.scenes as Scene[];
const scene = (key: string) => scenes.find((s) => s.key === key)!;
// Inicio de una palabra (n-ésima aparición) dentro de una escena, en segundos globales.
const at = (key: string, word: string, nth = 1) =>
  scene(key).words.filter((w) => w.t.toLowerCase().replace(/[^\p{L}]/gu, "") === word)[nth - 1].s;

// Entra desenfocado -> nítido y sale al revés, dentro de su tiempo.
const useBlurIO = (dur: number) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, IO, dur - IO, dur], [0, 1, 1, 0], clamp);
  const b = interpolate(frame, [0, IO, dur - IO, dur], [14, 0, 0, 14], clamp);
  return { opacity: o, filter: `blur(${b}px)` };
};

// Aparece en `t` (segundos globales) dentro de una Sequence que empieza en `from` (segundos globales).
const Appear: React.FC<{ t: number; from: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  t,
  from,
  children,
  style,
}) => {
  const age = useCurrentFrame() - (f(t) - f(from));
  const o = interpolate(age, [0, IO], [0, 1], clamp);
  const b = interpolate(age, [0, IO], [12, 0], clamp);
  return <div style={{ ...style, opacity: o, filter: `blur(${b}px)` }}>{children}</div>;
};

// Si la escena dura más que lo que queda de la toma, se congela su último cuadro.
const CLIP_FRAMES: Record<string, number> = { v1: 169, v2: 205 };
const Clip: React.FC<{ src: string; from: number; dur: number }> = ({ src, from, dur }) => {
  const usable = CLIP_FRAMES[src] - f(from) - 1;
  const video = (trim: number) => (
    <OffthreadVideo src={staticFile(`nia/${src}.mp4`)} trimBefore={trim} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
  if (dur <= usable) return <AbsoluteFill>{video(f(from))}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={usable}>{video(f(from))}</Sequence>
      <Sequence from={usable}>
        <Freeze frame={0}>{video(f(from) + usable - 1)}</Freeze>
      </Sequence>
    </AbsoluteFill>
  );
};

const PastelBg: React.FC<{ blurImg?: boolean }> = ({ blurImg = true }) => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${NIA.lila} 0%, ${NIA.rosa} 55%, ${NIA.amarillo} 100%)` }}>
    {blurImg ? (
      <Img
        src={staticFile("nia/estilo-v1.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px)", opacity: 0.35, transform: "scale(1.15)" }}
      />
    ) : null}
    {blurImg ? <AbsoluteFill style={{ background: "rgba(62,47,91,0.38)" }} /> : null}
  </AbsoluteFill>
);

const Camara: React.FC = () => (
  <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke={NIA.crema} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
    <path d="M15.5 10.5l5-3v9l-5-3" />
  </svg>
);

// Recuadro de toma pendiente: aquí va un video que todavía no tenemos.
const Placeholder: React.FC<{ label: string; dur: number }> = ({ label, dur }) => {
  const io = useBlurIO(dur);
  return (
    <AbsoluteFill>
      <PastelBg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 380 }}>
        <div
          style={{
            ...io,
            width: 860,
            height: 700,
            border: `5px dashed ${NIA.crema}`,
            borderRadius: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            background: "rgba(62,47,91,0.18)",
          }}
        >
          <Camara />
          <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 34, letterSpacing: 4, color: NIA.crema, opacity: 0.85 }}>
            AQUÍ VA TU VIDEO
          </div>
          <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 76, color: "white", textAlign: "center", padding: "0 50px", textShadow: SHADOW }}>
            {label}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Pendiente: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 300,
      right: 64,
      fontFamily: Montserrat,
      fontWeight: 600,
      fontSize: 28,
      color: NIA.ciruela,
      background: NIA.crema,
      padding: "8px 22px",
      borderRadius: 30,
      opacity: 0.92,
    }}
  >
    voz pendiente
  </div>
);

const Bloque: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 190 }) => (
  <span
    style={{
      fontFamily: Bebas,
      fontSize: size,
      lineHeight: 0.95,
      color: NIA.ciruela,
      background: NIA.amarillo,
      padding: "10px 38px 0",
      borderRadius: 28,
      boxShadow: "0 10px 40px rgba(62,47,91,0.25)",
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

const Serif: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 92, color = NIA.crema }) => (
  <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: size, color, textShadow: SHADOW, marginTop: 18 }}>{children}</div>
);

// Texto grande de cada escena (además de los subtítulos).
const Kinetic: React.FC<{ sc: Scene }> = ({ sc }) => {
  const from = sc.start;
  const col = (top: number, children: React.ReactNode) => (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: top, textAlign: "center" }}>{children}</AbsoluteFill>
  );
  switch (sc.key) {
    case "gancho":
      return col(
        1060,
        <>
          <Appear t={at("gancho", "filosofía")} from={from}>
            <Bloque>LA FILOSOFÍA</Bloque>
          </Appear>
          <Appear t={at("gancho", "no")} from={from}>
            <Serif>
              no empieza en un{" "}
              <span style={{ color: NIA.lila }}>libro</span>
            </Serif>
          </Appear>
        </>,
      );
    case "calle":
      return col(
        1060,
        <>
          <Appear t={from + 0.1} from={from}>
            <Serif>empieza en la</Serif>
          </Appear>
          <Appear t={from + 0.55} from={from} style={{ marginTop: 14 }}>
            <Bloque size={230}>CALLE</Bloque>
          </Appear>
        </>,
      );
    case "porque":
      return col(
        1000,
        <>
          <Appear t={from + 0.1} from={from}>
            <Serif size={72}>empieza cuando te preguntas</Serif>
          </Appear>
          <Appear t={from + 0.8} from={from} style={{ marginTop: 14 }}>
            <Bloque size={200}>¿POR QUÉ?</Bloque>
          </Appear>
          <Appear t={from + 1.5} from={from}>
            <Serif size={72}>las cosas son como son</Serif>
          </Appear>
        </>,
      );
    case "injusticia":
      return col(
        1380,
        <>
          <Appear t={at("injusticia", "tanto")} from={from}>
            <div style={{ fontFamily: Bebas, fontSize: 250, lineHeight: 0.9, color: NIA.crema, textShadow: `0 6px 0 ${NIA.lavanda}, ${SHADOW}` }}>
              TANTO
            </div>
          </Appear>
          <Appear t={at("injusticia", "tan")} from={from}>
            <Serif size={56}>y otros tan poco</Serif>
          </Appear>
        </>,
      );
    case "socrates":
      return (
        <Sequence from={f(at("socrates", "sócrates")) - f(from)} durationInFrames={f(at("socrates", "haciendo")) - f(at("socrates", "sócrates"))}>
          <SocratesCard dur={f(at("socrates", "haciendo")) - f(at("socrates", "sócrates"))} />
        </Sequence>
      );
    case "ojo":
      return col(
        1380,
        <>
          <Sequence durationInFrames={f(at("ojo", "atreverse")) - f(from)} layout="none">
            <Appear t={at("ojo", "ojo")} from={from}>
              <Bloque size={220}>OJO</Bloque>
            </Appear>
          </Sequence>
          <Appear t={at("ojo", "atreverse")} from={from}>
            <div style={{ fontFamily: Bebas, fontSize: 170, lineHeight: 1, marginTop: 10, color: NIA.crema, textShadow: `0 5px 0 ${NIA.lavanda}, ${SHADOW}` }}>
              ATREVERSE
            </div>
          </Appear>
        </>,
      );
    default:
      return null;
  }
};

const SocratesCard: React.FC<{ dur: number }> = ({ dur }) => {
  const io = useBlurIO(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1380 }}>
      <div style={{ ...io, background: NIA.crema, borderRadius: 32, padding: "18px 48px 24px", textAlign: "center", boxShadow: "0 10px 40px rgba(62,47,91,0.25)" }}>
        <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 104, color: NIA.ciruela }}>Sócrates</div>
        <div style={{ fontFamily: Montserrat, fontWeight: 600, fontSize: 34, letterSpacing: 3, color: NIA.lavanda }}>ATENAS · 470–399 a. C.</div>
      </div>
    </AbsoluteFill>
  );
};

// «esas VERDADES que todos daban por sentadas»: la palabra se tacha con una línea lavanda en «daban».
const Verdades: React.FC<{ from: number; dur: number }> = ({ from, dur }) => {
  const frame = useCurrentFrame();
  const io = useBlurIO(dur);
  const strike = interpolate(frame, [f(at("socrates", "daban")) - f(from), f(at("socrates", "daban")) - f(from) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <PastelBg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 560, textAlign: "center", ...io }}>
        <Serif size={70} color="white">esas</Serif>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontFamily: Bebas, fontSize: 240, lineHeight: 1, color: NIA.ciruela }}>VERDADES</div>
          <div
            style={{
              position: "absolute",
              left: -10,
              top: "46%",
              height: 18,
              width: `${strike * 104}%`,
              background: NIA.lavanda,
              borderRadius: 9,
            }}
          />
        </div>
        <Serif size={60} color="white">que todos daban por sentadas</Serif>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PorQue: React.FC<{ dur: number }> = ({ dur }) => {
  const io = useBlurIO(dur);
  return (
    <AbsoluteFill>
      <PastelBg blurImg={false} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...io }}>
        <div style={{ fontFamily: Bebas, fontSize: 330, lineHeight: 0.9, color: NIA.ciruela }}>¿POR QUÉ?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const dur = f(shot.end) - f(shot.start);
  if (shot.src) return <Clip src={shot.src} from={shot.from ?? 0} dur={dur} />;
  if (shot.placeholder) return <Placeholder label={shot.placeholder} dur={dur} />;
  if (shot.card === "verdades") return <Verdades from={shot.start} dur={dur} />;
  if (shot.porque) return <PorQue dur={dur} />;
  return null;
};

const Flash: React.FC = () => {
  const o = interpolate(useCurrentFrame(), [0, 3], [0.35, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: NIA.crema, opacity: o }} />;
};

const Caption: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const o = interpolate(useCurrentFrame(), [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1160 }}>
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
        {text.split(" ").map((w, i) => (
          <span key={i} style={{ color: w.startsWith("*") ? NIA.amarillo : "white" }}>
            {(i ? " " : "") + w.replace("*", "")}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Firma: React.FC = () => (
  <div style={{ position: "absolute", top: 300, left: 64 }}>
    <div style={{ fontFamily: Playfair, fontStyle: "italic", fontSize: 44, color: NIA.crema, textShadow: SHADOW }}>Nia</div>
    <div style={{ width: 96, height: 6, borderRadius: 3, background: GRAD, marginTop: 4 }} />
  </div>
);

const Barra: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 42, background: "rgba(255,248,236,0.28)" }}>
      <div style={{ width: `${(frame / durationInFrames) * 100}%`, height: "100%", background: GRAD, borderRadius: "0 21px 21px 0" }} />
    </div>
  );
};

export const Nia: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NIA.ciruela }}>
    {/* Voz en off (cada toma a -16 LUFS), música propia ~17 dB abajo y foley alineado. */}
    <Html5Audio src={staticFile("nia/voz.wav")} />
    <Html5Audio src={staticFile("nia/musica.wav")} />
    <Html5Audio src={staticFile("nia/foley.wav")} volume={0.4} />

    {scenes.map((sc) =>
      sc.shots.map((s) => (
        <Sequence key={`${sc.key}-${s.start}`} from={f(s.start)} durationInFrames={Math.max(1, f(s.end) - f(s.start))} premountFor={15}>
          <ShotView shot={s} />
          {s.start > 0 ? <Flash /> : null}
        </Sequence>
      )),
    )}

    {scenes.map((sc) => (
      <Sequence key={`k-${sc.key}`} from={f(sc.start)} durationInFrames={f(sc.end) - f(sc.start)}>
        <Kinetic sc={sc} />
        {sc.pending && sc.key !== "final" ? <Pendiente /> : null}
      </Sequence>
    ))}

    {scenes.map((sc) =>
      sc.captions.map((c) => (
        <Sequence key={`c-${c.start}`} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
          <Caption text={c.text} dur={Math.max(1, f(c.end) - f(c.start))} />
        </Sequence>
      )),
    )}

    <Firma />
    <Barra />
  </AbsoluteFill>
);
