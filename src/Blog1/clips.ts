import { staticFile } from "remotion";
import { SEGMENTS, Segment } from "./edl";

export const FPS = 30;

// Segundo del original donde empieza cada intermedio (scripts/prep-blog1.sh).
export const CLIP_OFFSETS: Record<string, number> = {
  C075: 1,
  C076: 10,
  C084: 6,
  C087: 10.5,
  C090: 0,
  C094: 60,
  C099: 17,
  C105: 0,
  C110: 0,
  C113: 0,
  C115: 0,
  C116: 0,
};

// Tomas horizontales (intermedio 3414x1920); el resto son verticales 1080x1920.
export const HORIZONTAL = new Set(["C075", "C076", "C099", "C115", "C116"]);

export const clipSrc = (clip: string) => staticFile(`blog1/${clip}.mp4`);

export const END_HOLD_SEC = 0.5;

export type TimedSegment = Segment & {
  from: number; // frame de inicio en la línea de tiempo
  durationInFrames: number;
};

export const buildTimeline = (): TimedSegment[] => {
  let cursor = 0;
  return SEGMENTS.map((s, i) => {
    const isLast = i === SEGMENTS.length - 1;
    const durationInFrames =
      Math.round((s.out - s.in) * FPS) +
      (isLast ? Math.round(END_HOLD_SEC * FPS) : 0);
    const t = { ...s, from: cursor, durationInFrames };
    cursor += Math.round((s.out - s.in) * FPS);
    return t;
  });
};

export const totalFrames = () =>
  SEGMENTS.reduce((acc, s) => acc + Math.round((s.out - s.in) * FPS), 0) +
  Math.round(END_HOLD_SEC * FPS);

/** Palabras de todo el video en milisegundos de la línea de tiempo. */
export const timelineWords = () =>
  ([] as TimedSegment[]).concat(buildTimeline()).reduce<
    {
      text: string;
      fromMs: number;
      toMs: number;
      segStartMs: number;
      segEndMs: number;
      boxed: boolean;
    }[]
  >(
    (acc, seg) =>
      acc.concat(
        seg.words.map(([text, s, e]) => {
          const base = seg.from / FPS - seg.in;
          const segEnd =
            (seg.from + Math.round((seg.out - seg.in) * FPS)) / FPS;
          return {
            text,
            fromMs: Math.max(seg.from / FPS, base + s) * 1000,
            toMs: Math.min(segEnd, base + e) * 1000,
            segStartMs: (seg.from / FPS) * 1000,
            segEndMs: segEnd * 1000,
            boxed: seg.layout === "boxed",
          };
        }),
      ),
    [],
  );
