import { createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
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
import captionsJson from "../../public/avanzares/promo/captions.json";
import meta from "../../public/avanzares/promo/meta.json";

// Video promocional: "Si estás aquí en el centro de Palmira..." (IMG_0563).

const fontFamily = "Montserrat";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/montserrat-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});

const RED = "#AE2C36";
const RED_LIGHT = "#FF4D5A";
const WHITE = "#FFFFFF";
const DARK = "#141414";
const LOGO = staticFile("avanzares/logo_blanco.png");

type Cap = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  keyword: boolean;
};
const CAPTIONS = captionsJson as Cap[];
const KEYWORD_STARTS = new Set(
  CAPTIONS.filter((c) => c.keyword).map((c) => c.startMs),
);

export const PROMO_FPS = meta.fps;
const VIDEO_FRAMES = meta.frames;
const OUTRO_FRAMES = 90;
export const PROMO_TOTAL = VIDEO_FRAMES + OUTRO_FRAMES;
const M = meta.marks;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Música: "Escapada" de Beat Mekanik (CC BY 4.0), desde el "drop" (33 s).
// Debajo de la voz ~-32 dB (la voz va en ~-19 dB); sola en el cierre ~-21 dB.
const MUSIC_START_S = 33.0;
const MUSIC_UNDER_VOICE = 0.1;
const MUSIC_FULL = 0.41;

// ---------- Video con acercamientos en las frases clave ----------
const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.inOut(Easing.cubic);
  const zoom = interpolate(
    frame,
    [
      0,
      M.venir,
      M.venir + 12,
      M.teatro - 6,
      M.teatro + 8,
      M.solo,
      M.solo + 10,
      M.perder,
      M.perder + 10,
      VIDEO_FRAMES,
    ],
    [1.0, 1.0, 1.1, 1.1, 1.0, 1.0, 1.12, 1.12, 1.2, 1.22],
    { ...clamp, easing: ease },
  );
  return (
    <AbsoluteFill
      style={{ transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}
    >
      <OffthreadVideo
        src={staticFile("avanzares/promo/montaje.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// ---------- Logo transparente en el centro durante todo el video ----------
const LogoCentro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 0.32], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Img
        src={LOGO}
        style={{
          width: 460,
          opacity,
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Etiqueta de ubicación ----------
const Pin: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
    />
  </svg>
);

const UbicacionTag: React.FC<{ text: string; dur: number }> = ({
  text,
  dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 14 } });
  const out = interpolate(frame, [dur - 10, dur], [0, 1], clamp);
  const s = inS - out;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 380 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: WHITE,
          color: RED,
          fontFamily,
          fontWeight: 900,
          fontSize: 50,
          textTransform: "uppercase",
          padding: "14px 34px 14px 24px",
          borderRadius: 999,
          boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
          opacity: s,
          transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${interpolate(s, [0, 1], [-30, 0])}px)`,
        }}
      >
        <Pin size={52} color={RED} />
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Sello "¡Solo hoy y mañana!" ----------
const SoloHoySello: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const pulse = 1 + 0.035 * Math.sin((frame / fps) * Math.PI * 2.2);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 285 }}>
      <div
        style={{
          background: RED,
          color: WHITE,
          border: `8px solid ${WHITE}`,
          fontFamily,
          fontWeight: 900,
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1,
          padding: "22px 46px 26px",
          borderRadius: 30,
          boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
          transform: `rotate(-4deg) scale(${inS * pulse})`,
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: 4 }}>¡Solo</div>
        <div style={{ fontSize: 78 }}>hoy y mañana!</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Subtítulos palabra por palabra ----------
const SubtitlePage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const timeMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1290 }}>
      <div
        style={{
          width: 1000,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.15,
          textTransform: "uppercase",
          color: WHITE,
          WebkitTextStroke: "14px black",
          paintOrder: "stroke",
          textShadow: "0 8px 24px rgba(0,0,0,0.55)",
          transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])}) translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
        }}
      >
        {page.tokens.map((t, i) => {
          const active = t.fromMs <= timeMs && t.toMs > timeMs;
          const keyword = KEYWORD_STARTS.has(t.fromMs);
          return (
            <span
              key={`${t.fromMs}-${i}`}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                margin: "0 0.14em",
                padding: "0 10px",
                borderRadius: 14,
                color: keyword && !active ? RED_LIGHT : WHITE,
                background: active ? RED : "transparent",
                transform: `scale(${active ? 1.06 : 1})`,
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
        const last = page.tokens[page.tokens.length - 1];
        const endMs = Math.min(next ? next.startMs : Infinity, last.toMs + 600);
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

// ---------- Barra de progreso ----------
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ top: 1904, height: 16 }}>
      <div style={{ height: 16, background: "rgba(255,255,255,0.25)" }}>
        <div
          style={{
            height: 16,
            width: `${Math.min(1, frame / VIDEO_FRAMES) * 100}%`,
            background: `linear-gradient(90deg, ${RED}, ${RED_LIGHT})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Cierre ----------
const PRODUCTOS = ["Arequipes", "Cremas de whisky", "Vino", "Conservas"];

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 8], [0, 1], clamp);
  const logo = spring({ frame: frame - 3, fps, config: { damping: 11 } });
  const sello = spring({ frame: frame - 12, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: RED,
        opacity: bg,
        fontFamily,
        alignItems: "center",
      }}
    >
      <Img
        src={LOGO}
        style={{
          position: "absolute",
          top: 300,
          width: 640,
          transform: `scale(${logo})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 860,
          background: WHITE,
          color: RED,
          fontWeight: 900,
          fontSize: 66,
          textTransform: "uppercase",
          padding: "14px 40px 16px",
          borderRadius: 22,
          transform: `rotate(-3deg) scale(${sello})`,
          boxShadow: "0 14px 34px rgba(0,0,0,0.3)",
        }}
      >
        ¡Solo hoy y mañana!
      </div>
      <div
        style={{
          position: "absolute",
          top: 1030,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: WHITE,
          fontWeight: 800,
          fontSize: 44,
          textTransform: "uppercase",
          textAlign: "center",
          opacity: sello,
        }}
      >
        <Pin size={48} color={WHITE} />
        Frente al Teatro Materón
      </div>
      <div
        style={{
          position: "absolute",
          top: 1095,
          color: WHITE,
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: 3,
          textTransform: "uppercase",
          opacity: sello * 0.9,
        }}
      >
        Centro de Palmira
      </div>
      <div
        style={{
          position: "absolute",
          top: 1220,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
          width: 900,
        }}
      >
        {PRODUCTOS.map((p, i) => {
          const s = spring({
            frame: frame - 20 - i * 5,
            fps,
            config: { damping: 14 },
          });
          return (
            <div
              key={p}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: `3px solid ${WHITE}`,
                color: WHITE,
                fontWeight: 800,
                fontSize: 40,
                textTransform: "uppercase",
                padding: "8px 26px",
                borderRadius: 999,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
              }}
            >
              {p}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Composición ----------
export const PromoPalmira: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DARK }}>
    <Sequence durationInFrames={VIDEO_FRAMES}>
      <VideoLayer />
    </Sequence>
    <Sequence durationInFrames={VIDEO_FRAMES}>
      <LogoCentro />
    </Sequence>
    <Sequence from={M.palmira} durationInFrames={80}>
      <UbicacionTag text="Centro de Palmira" dur={80} />
    </Sequence>
    <Sequence from={M.teatro} durationInFrames={M.hoy - M.teatro - 4}>
      <UbicacionTag
        text="Frente al Teatro Materón"
        dur={M.hoy - M.teatro - 4}
      />
    </Sequence>
    <Sequence from={M.hoy} durationInFrames={VIDEO_FRAMES - M.hoy}>
      <SoloHoySello />
    </Sequence>
    <Subtitles />
    <Sequence durationInFrames={VIDEO_FRAMES}>
      <ProgressBar />
    </Sequence>
    <Sequence from={VIDEO_FRAMES} durationInFrames={OUTRO_FRAMES}>
      <Outro />
    </Sequence>
    <Audio
      src={staticFile("avanzares/musica.mp3")}
      startFrom={Math.round(MUSIC_START_S * PROMO_FPS)}
      volume={(f) =>
        interpolate(f, [0, 6], [0, 1], clamp) *
        // Más baja mientras dice "del Teatro Materón" (la cámara gira y la voz baja).
        interpolate(f, [228, 238, 290, 300], [1, 0.5, 0.5, 1], clamp) *
        interpolate(
          f,
          [VIDEO_FRAMES - 6, VIDEO_FRAMES + 8],
          [MUSIC_UNDER_VOICE, MUSIC_FULL],
          clamp,
        ) *
        interpolate(f, [PROMO_TOTAL - 30, PROMO_TOTAL], [1, 0], clamp)
      }
    />
  </AbsoluteFill>
);
