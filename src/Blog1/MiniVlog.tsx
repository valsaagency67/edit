// Piezas de estilo "mini vlog" (según el video de referencia del cliente):
// adelanto rápido, título escrito a máquina y subtítulos de una palabra.
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { clipSrc, FPS, PREVIEW_TOTAL, timelineWords } from "./clips";
import { BOX } from "./ClipView";
import { PREVIEW, PREVIEW_FRAMES_EACH, TITLE } from "./edl";

export const SANS = "Inter Blog1";
export const SERIF = "Instrument Serif Blog1";

let fontsLoaded = false;
export const loadMiniVlogFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  const handle = delayRender("fuentes mini vlog");
  const faces = [
    new FontFace(
      SANS,
      `url('${staticFile("fonts/inter-600.woff2")}') format('woff2')`,
      { weight: "600" },
    ),
    new FontFace(
      SERIF,
      `url('${staticFile("fonts/instrument-serif-400.woff2")}') format('woff2')`,
    ),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
};

// ── Adelanto: 3 frames por plano ──────────────────────────
export const Preview: React.FC = () => (
  <>
    {PREVIEW.map((p, i) => (
      <Sequence
        key={i}
        from={i * PREVIEW_FRAMES_EACH}
        durationInFrames={PREVIEW_FRAMES_EACH}
      >
        <AbsoluteFill>
          <OffthreadVideo
            src={clipSrc(p.clip)}
            trimBefore={Math.round(p.at * FPS)}
            muted
            style={{
              width: 1080,
              height: 1920,
              filter: "brightness(1.16) contrast(1.06) saturate(1.08)",
            }}
          />
        </AbsoluteFill>
      </Sequence>
    ))}
  </>
);

// ── Título escrito a máquina ──────────────────────────────
export const TypewriterTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const typeFrames = PREVIEW_TOTAL - 6;
  const chars = Math.min(
    TITLE.length,
    Math.floor((frame / typeFrames) * TITLE.length),
  );
  const cursorOn = Math.floor(frame / 4) % 2 === 0;
  const opacity = interpolate(
    frame,
    [PREVIEW_TOTAL + 2, PREVIEW_TOTAL + 10],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <div
        style={{
          width: 560,
          fontFamily: SERIF,
          fontSize: 118,
          lineHeight: 0.92,
          color: "white",
          textAlign: "center",
          textShadow: "0 4px 30px rgba(0,0,0,0.55)",
        }}
      >
        {TITLE.slice(0, chars)}
        <span
          style={{
            display: "inline-block",
            width: 22,
            height: 92,
            marginLeft: 6,
            verticalAlign: "-8px",
            background: "white",
            opacity: cursorOn ? 1 : 0,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── Subtítulos: una palabra a la vez, minúsculas, limpios ──
const clean = (t: string) =>
  t
    .toLowerCase()
    .replace(/^[¡¿"“(]+/, "")
    .replace(/[.,;:!?"”)…]+$/, "");

export const WordCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const words = useMemo(() => timelineWords(), []);
  const ms = (frame / FPS) * 1000;
  // la palabra que está sonando; se queda hasta la siguiente (máx. 500 ms de silencio)
  let current: (typeof words)[number] | null = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    const end = Math.min(
      w.toMs + 500,
      next ? next.fromMs : Infinity,
      w.segEndMs,
    );
    if (ms >= w.fromMs && ms < end) {
      current = w;
      break;
    }
  }
  if (!current) return null;
  const top = current.boxed ? BOX.top + BOX.height - 170 : 1060;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 62,
          letterSpacing: -0.5,
          color: "white",
          textShadow: "0 2px 6px rgba(0,0,0,0.65), 0 0 24px rgba(0,0,0,0.35)",
        }}
      >
        {clean(current.text)}
      </div>
    </AbsoluteFill>
  );
};
