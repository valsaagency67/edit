import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TheBoldFont } from "../load-font";
import { timelineWords } from "./clips";
import { BOX } from "./ClipView";

const YELLOW = "#FFE14D";

// ── Subtítulos palabra por palabra ─────────────────────────
type CapWord = ReturnType<typeof timelineWords>[number];
type CapPage = {
  words: CapWord[];
  startMs: number;
  endMs: number;
  boxed: boolean;
};

const MAX_WORDS = 3;
const MAX_CHARS = 16;
const MAX_GAP_MS = 400;

const paginate = (words: CapWord[]): CapPage[] => {
  const pages: CapPage[] = [];
  let cur: CapWord[] = [];
  const flush = () => {
    if (cur.length) {
      pages.push({
        words: cur,
        startMs: cur[0].fromMs,
        endMs: cur[cur.length - 1].toMs,
        boxed: cur[0].boxed,
      });
    }
    cur = [];
  };
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars =
      cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (
      prev &&
      (cur.length >= MAX_WORDS ||
        chars > MAX_CHARS ||
        w.fromMs - prev.toMs > MAX_GAP_MS ||
        w.segStartMs !== prev.segStartMs ||
        /[.!?]$/.test(prev.text))
    ) {
      flush();
    }
    cur.push(w);
  }
  flush();
  // cada página se queda hasta que empieza la siguiente (máx. +400 ms)
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const end = Math.min(
      p.endMs + MAX_GAP_MS,
      next ? next.startMs : Infinity,
      p.words[0].segEndMs,
    );
    return { ...p, endMs: end };
  });
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(() => paginate(timelineWords()), []);
  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;

  const pageFrame = Math.round(((ms - page.startMs) / 1000) * fps);
  const enter = spring({
    frame: pageFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 5,
  });
  const top = page.boxed ? BOX.top + BOX.height + 60 : 1300;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top,
          left: 50,
          right: 50,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 34,
          fontFamily: TheBoldFont,
          fontSize: 92,
          lineHeight: 1.1,
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "16px black",
          paintOrder: "stroke",
          textShadow: "0 8px 24px rgba(0,0,0,0.45)",
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        }}
      >
        {page.words.map((w, i) => {
          // una sola palabra activa: la última que ya empezó
          const activeIdx = page.words.reduce(
            (acc, x, j) => (ms >= x.fromMs ? j : acc),
            0,
          );
          const active = i === activeIdx;
          const wf = Math.round(((ms - w.fromMs) / 1000) * fps);
          const pop = active
            ? interpolate(
                spring({
                  frame: wf,
                  fps,
                  config: { damping: 12, stiffness: 250 },
                }),
                [0, 1],
                [1.14, 1.0],
              )
            : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: active ? YELLOW : "white",
                transform: `scale(${pop})`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Título animado ─────────────────────────────────────────
export const Title: React.FC<{
  text: string;
  sub?: string;
  durationInFrames: number;
  boxed: boolean;
}> = ({ text, sub, durationInFrames, boxed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const outP = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const subP = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        top: boxed ? 190 : 230,
        fontFamily: TheBoldFont,
        textTransform: "uppercase",
        opacity: outP,
      }}
    >
      <div
        style={{
          backgroundColor: YELLOW,
          color: "#111",
          fontSize: 78,
          padding: "14px 34px 6px",
          borderRadius: 14,
          transform: `rotate(-3deg) scale(${inP * (0.9 + 0.1 * outP)})`,
          boxShadow: "0 14px 0 #111",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 30,
            backgroundColor: "#111",
            color: "white",
            fontSize: 52,
            padding: "10px 26px 4px",
            borderRadius: 10,
            transform: `rotate(2deg) scale(${subP})`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── Destello blanco en el corte ───────────────────────────
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.85, 0], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "white", opacity: o }} />;
};

// ── Barra de progreso ─────────────────────────────────────
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: "rgba(0,0,0,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 12,
          width: `${(frame / (durationInFrames - 1)) * 100}%`,
          background: YELLOW,
          boxShadow: `0 0 18px ${YELLOW}`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Fundido a negro final ─────────────────────────────────
export const FadeOut: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(
    frame,
    [durationInFrames - frames, durationInFrames - 1],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return <AbsoluteFill style={{ backgroundColor: "black", opacity: o }} />;
};
