import type { Clip } from "./data";

export const FPS = 30;

export type Cut = {
  /** Inicio y fin en el clip original (s). */
  readonly start: number;
  readonly end: number;
  /** Posición dentro del clip editado (fotogramas). */
  readonly from: number;
  readonly duration: number;
};

export const getCuts = (clip: Clip): Cut[] => {
  let from = 0;
  return clip.keep.map(([start, end]) => {
    const duration = Math.round((end - start) * FPS);
    const cut = { start, end, from, duration };
    from += duration;
    return cut;
  });
};

export const clipFrames = (clip: Clip) =>
  getCuts(clip).reduce((acc, c) => acc + c.duration, 0);

/**
 * Convierte un tiempo del clip original (s) a fotogramas del clip editado.
 * Si cae en un tramo recortado, se ajusta al inicio del siguiente tramo.
 */
export const toFrame = (clip: Clip, seconds: number): number => {
  const cuts = getCuts(clip);
  for (const c of cuts) {
    if (seconds < c.start) {
      return c.from;
    }
    if (seconds < c.end) {
      return (
        c.from + Math.min(c.duration, Math.round((seconds - c.start) * FPS))
      );
    }
  }
  const last = cuts[cuts.length - 1];
  return last.from + last.duration;
};
