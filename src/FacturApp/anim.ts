import { Easing, interpolate } from "remotion";

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** Progreso 0→1 con easing suave entre dos frames. */
export const prog = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

export const lin = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Pseudo-aleatorio determinista. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
