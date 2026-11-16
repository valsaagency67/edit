import { createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../../public/avanzares/captions.json";
import meta from "../../public/avanzares/meta.json";

const fontFamily = "Montserrat";
// Montserrat (SIL Open Font License), fuente variable local: pesos 100-900.
loadFont({
  family: fontFamily,
  url: staticFile("fonts/montserrat-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});

type Cap = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  keyword: boolean;
};
const CAPTIONS = captionsJson as Cap[];
const KEYWORD_TEXTS = new Set(
  CAPTIONS.filter((c) => c.keyword).map((c) => `${c.startMs}`),
);

export const FPS = meta.fps;
export const VIDEO_FRAMES = meta.frames;
export const OUTRO_FRAMES = 84;
export const TOTAL_FRAMES = VIDEO_FRAMES + OUTRO_FRAMES;

// Colores de marca: rojo y blanco.
const RED = "#AE2C36"; // rojo exacto del logo de Huroban
const RED_LIGHT = "#FF4D5A"; // rojo claro para resaltar palabras sobre el video
const WHITE = "#FFFFFF";
const DARK = "#141414";

// Sin música: la canción se agrega directamente en Instagram.

// ---------- Video con zooms en cada corte ----------
const CUTS: number[] = meta.cuts;
const CLIPS: string[] = meta.clips;

const segmentIndexAt = (frame: number) => {
  let idx = 0;
  for (let i = 0; i < CUTS.length; i++) {
    if (frame >= CUTS[i]) idx = i;
  }
  return idx;
};

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const i = segmentIndexAt(Math.min(frame, VIDEO_FRAMES - 1));
  const segStart = CUTS[i];
  const local = frame - segStart;
  const sameSpeakerAsPrev = i > 0 && CLIPS[i] === CLIPS[i - 1];
  // Cortes dentro de la misma persona: alterna encuadre (punch-in) para que
  // el salto se sienta intencional.
  let runIndex = 0;
  for (let k = i; k > 0 && CLIPS[k] === CLIPS[k - 1]; k--) runIndex++;
  const base = runIndex % 2 === 1 ? 1.12 : 1.0;
  // Pequeño "pop" al inicio de cada corte + zoom lento continuo.
  const pop = interpolate(local, [0, 6], [sameSpeakerAsPrev ? 0.04 : 0.08, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const drift = interpolate(local, [0, 300], [0, 0.04], {
    extrapolateRight: "clamp",
  });
  const scale = base + pop + drift;

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <OffthreadVideo
        src={staticFile("avanzares/montaje.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// Destello blanco al cambiar de persona.
const SpeakerFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  CUTS.forEach((c, i) => {
    if (i > 0 && CLIPS[i] !== CLIPS[i - 1]) {
      opacity = Math.max(
        opacity,
        interpolate(frame - c, [0, 1, 7], [0, 0.75, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      );
    }
  });
  return <AbsoluteFill style={{ backgroundColor: "white", opacity }} />;
};

// ---------- Subtítulos ----------
const SubtitlePage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const timeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        top: 1270,
      }}
    >
      <div
        style={{
          width: 1000,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.12,
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "14px black",
          paintOrder: "stroke",
          textShadow: "0 8px 24px rgba(0,0,0,0.55)",
          transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])}) translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
        }}
      >
        {page.tokens.map((t, idx) => {
          const active = t.fromMs <= timeMs && t.toMs > timeMs;
          const keyword = KEYWORD_TEXTS.has(`${t.fromMs}`);
          const popScale = active ? 1.06 : 1;
          return (
            <span
              key={`${t.fromMs}-${idx}`}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                margin: "0 0.14em",
                color: keyword && !active ? RED_LIGHT : WHITE,
                background: active ? RED : "transparent",
                borderRadius: 14,
                padding: "0 10px",
                transform: `scale(${popScale})`,
              }}
            >
              {t.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: CAPTIONS,
        combineTokensWithinMilliseconds: 900,
      }).pages,
    [],
  );
  return (
    <>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const lastToken = page.tokens[page.tokens.length - 1];
        const endMs = Math.min(
          next ? next.startMs : Infinity,
          lastToken.toMs + 600,
        );
        const to = Math.min(Math.round((endMs / 1000) * fps), VIDEO_FRAMES);
        if (to <= from) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <SubtitlePage page={page} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------- Logo ----------
const LOGO = staticFile("avanzares/logo_blanco.png"); // blanco con fondo transparente

const Logo: React.FC<{ width: number; shadow?: boolean }> = ({
  width,
  shadow = true,
}) => (
  <Img
    src={LOGO}
    style={{
      width,
      filter: shadow ? "drop-shadow(0 4px 14px rgba(0,0,0,0.55))" : undefined,
    }}
  />
);

// ---------- Título de entrada ----------
const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const out = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sub = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16 },
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 150, opacity: out }}>
      <div style={{ transform: `scale(${inS})` }}>
        <Logo width={560} />
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily,
          fontWeight: 800,
          fontSize: 46,
          color: WHITE,
          textTransform: "uppercase",
          letterSpacing: 4,
          background: RED,
          padding: "10px 30px",
          borderRadius: 999,
          boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
          opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [20, 0])}px)`,
        }}
      >
        Opiniones de clientes
      </div>
    </AbsoluteFill>
  );
};

// Logo en transparencia durante todo el video (marca de agua).
const LogoWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15], [0, 0.55], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 105, opacity: o }}>
      <Logo width={230} />
    </AbsoluteFill>
  );
};

// ---------- Etiqueta con nombre ----------
const NameTag: React.FC<{ name: string }> = ({ name }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 15 } });
  const out = interpolate(frame, [70, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(inS - out, [0, 1], [-520, 0]);
  return (
    <AbsoluteFill style={{ top: 1120, left: 60 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          transform: `translateX(${x}px)`,
          fontFamily,
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: 14,
            height: 64,
            background: RED,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            background: "white",
            color: DARK,
            fontWeight: 900,
            fontSize: 48,
            padding: "6px 22px",
            borderRadius: 10,
            boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
          }}
        >
          {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Barra de progreso ----------
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / VIDEO_FRAMES);
  return (
    <AbsoluteFill style={{ top: 1904, height: 16 }}>
      <div style={{ height: 16, background: "rgba(255,255,255,0.25)" }}>
        <div
          style={{
            height: 16,
            width: `${p * 100}%`,
            background: `linear-gradient(90deg, ${RED}, ${RED_LIGHT})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Cierre ----------
const PRODUCTS = ["Arequipes", "Cremas de whisky", "Vino", "Conservas"];

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 3, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill style={{ backgroundColor: RED, opacity: bg }}>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 80 }}
      >
        <div style={{ transform: `scale(${logo})` }}>
          <Logo width={820} shadow={false} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            alignItems: "center",
          }}
        >
          {PRODUCTS.map((p, i) => {
            const s = spring({
              frame: frame - 14 - i * 6,
              fps,
              config: { damping: 14 },
            });
            return (
              <div
                key={p}
                style={{
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 50,
                  color: RED,
                  textTransform: "uppercase",
                  background: WHITE,
                  padding: "10px 34px",
                  borderRadius: 999,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                }}
              >
                {p}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Composición ----------
export const AvanzaresVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={VIDEO_FRAMES}>
        <VideoLayer />
      </Sequence>
      <Sequence durationInFrames={VIDEO_FRAMES}>
        <SpeakerFlash />
      </Sequence>
      <Sequence durationInFrames={150}>
        <IntroTitle />
      </Sequence>
      <Sequence from={150} durationInFrames={VIDEO_FRAMES - 150}>
        <LogoWatermark />
      </Sequence>
      {meta.nameTags.map((t) => (
        <Sequence key={t.text} from={t.fromFrame} durationInFrames={84}>
          <NameTag name={t.text} />
        </Sequence>
      ))}
      <Subtitles />
      <Sequence durationInFrames={VIDEO_FRAMES}>
        <ProgressBar />
      </Sequence>
      <Sequence from={VIDEO_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
