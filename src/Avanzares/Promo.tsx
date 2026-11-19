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

// ---------- Zoom in / zoom out (estilo del video de referencia) ----------
// "seco": salto rápido (3 cuadros) en los golpes; si no, suave (8 cuadros ≈ 0.25 s).
type ZoomKey = { f: number; z: number; seco: boolean };
const ZOOMS: ZoomKey[] = [
  { f: 0, z: 1.0, seco: true },
  { f: M.venir, z: 1.2, seco: true }, // "tienes que venir a probar"
  { f: M.huroban, z: 1.06, seco: false }, // zoom out suave en "Huroban"
  { f: M.estamos, z: 1.0, seco: true }, // gira la cámara al teatro
  { f: M.solo, z: 1.18, seco: true }, // "solamente por hoy y mañana"
  { f: M.perder, z: 1.3, seco: true }, // "no se lo pueden perder"
];

const zoomAt = (frame: number) => {
  let z = ZOOMS[0].z;
  for (let i = 1; i < ZOOMS.length; i++) {
    const k = ZOOMS[i];
    const dur = k.seco ? 3 : 8;
    if (frame >= k.f) {
      z = interpolate(frame, [k.f, k.f + dur], [ZOOMS[i - 1].z, k.z], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      });
    }
  }
  // Acercamiento lento continuo para que la imagen nunca quede quieta.
  return z + frame * 0.00012;
};

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  // Sacudida corta cuando entra el sello "¡Solo hoy y mañana!".
  const t = frame - M.hoy;
  const shake = t >= 0 && t < 10 ? Math.sin(t * 2.6) * (10 - t) * 1.6 : 0;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shake}px, ${shake * 0.6}px) scale(${zoomAt(frame)})`,
        transformOrigin: "50% 40%",
      }}
    >
      <OffthreadVideo
        src={staticFile("avanzares/promo/montaje.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// Destello blanco (con el sonido de obturador) en los cambios de tema.
const FLASHES = [M.estamos, VIDEO_FRAMES];
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = Math.max(
    ...FLASHES.map((f) =>
      interpolate(frame - f, [-1, 0, 6], [0, 0.85, 0], clamp),
    ),
  );
  return <AbsoluteFill style={{ backgroundColor: WHITE, opacity: o }} />;
};

// ---------- Efectos de sonido (los 4 del video de referencia) ----------
// clic: textos grandes · whoosh: acercamientos · obturador: cambios de tema ·
// magia: solo en la marca. Pocos y suaves para no tapar la voz.
type Sfx = {
  f: number;
  s: "click" | "magic" | "whoosh" | "shutter";
  v: number;
};
const SFX: Sfx[] = [
  { f: M.palmira, s: "click", v: 0.5 },
  { f: M.venir, s: "whoosh", v: 0.55 },
  { f: M.huroban, s: "magic", v: 0.35 },
  { f: M.estamos, s: "shutter", v: 0.6 },
  { f: M.teatro, s: "click", v: 0.5 },
  { f: M.solo, s: "whoosh", v: 0.55 },
  { f: M.hoy, s: "click", v: 0.6 },
  { f: M.perder, s: "whoosh", v: 0.6 },
  { f: VIDEO_FRAMES, s: "shutter", v: 0.6 },
  { f: VIDEO_FRAMES + 3, s: "magic", v: 0.45 },
];
// El whoosh y el obturador tienen el golpe un poco después del inicio: se adelantan.
const LEAD: Record<Sfx["s"], number> = {
  click: 0,
  magic: 0,
  whoosh: 2,
  shutter: 3,
};

const Efectos: React.FC = () => (
  <>
    {SFX.map((e, i) => (
      <Sequence
        key={i}
        from={Math.max(0, e.f - LEAD[e.s])}
        durationInFrames={60}
      >
        <Audio src={staticFile(`avanzares/sfx/${e.s}.wav`)} volume={e.v} />
      </Sequence>
    ))}
  </>
);

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
    <Efectos />
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
    <Flash />
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
