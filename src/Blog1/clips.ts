import { staticFile } from "remotion";
import captionsJson from "./captions.json";
import { SEGMENTS, Segment, Word } from "./edl";

export const FPS = 30;

// Los intermedios (scripts/prep-blog1.sh) son los clips completos: el segundo
// N del original es el segundo N del intermedio.

// Tomas horizontales (intermedio 3414x1920); el resto son verticales 1080x1920.
export const HORIZONTAL = new Set(["C075", "C076", "C099", "C115", "C116"]);

export const clipSrc = (clip: string) => staticFile(`blog1/${clip}.mp4`);

const CAPTIONS = captionsJson as unknown as Record<string, Word[]>;

export type TimedSegment = Segment & {
  from: number; // frame de inicio en la línea de tiempo
  durationInFrames: number;
};

const framesOf = (s: Segment) => Math.round((s.out - s.in) * FPS);

export const buildTimeline = (): TimedSegment[] => {
  let cursor = 0;
  return SEGMENTS.map((s) => {
    const t = { ...s, from: cursor, durationInFrames: framesOf(s) };
    cursor += t.durationInFrames;
    return t;
  });
};

export const totalFrames = () =>
  SEGMENTS.reduce((acc, s) => acc + framesOf(s), 0);

/** Frame (relativo al segmento) de un segundo del original. */
export const segFrame = (seg: Segment, at: number) =>
  Math.max(0, Math.round((at - seg.in) * FPS));

export type CapWord = {
  text: string;
  fromMs: number;
  toMs: number;
  segStartMs: number;
  segEndMs: number;
  boxed: boolean;
};

/** Palabras de todo el video en milisegundos de la línea de tiempo. */
export const timelineWords = (): CapWord[] => {
  const out: CapWord[] = [];
  for (const seg of buildTimeline()) {
    const segStart = seg.from / FPS;
    const segEnd = (seg.from + seg.durationInFrames) / FPS;
    const base = segStart - seg.in;
    for (const [text, s, e] of CAPTIONS[seg.clip] ?? []) {
      if (s < seg.in || s >= seg.out) continue;
      out.push({
        text,
        fromMs: (base + s) * 1000,
        toMs: Math.min(segEnd, base + e) * 1000,
        segStartMs: segStart * 1000,
        segEndMs: segEnd * 1000,
        boxed: seg.layout === "boxed",
      });
    }
  }
  return out;
};
