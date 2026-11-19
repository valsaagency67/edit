import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "./timeline";

export const TRANSITION_FRAMES = 22;

/** Full-screen neon wipe with a racing car and speed lines. Peak cover at frame 11. */
export const Transition: React.FC = () => {
  const frame = useCurrentFrame();
  const p = frame / TRANSITION_FRAMES;
  const bandX = interpolate(p, [0, 0.5, 1], [-1900, 0, 1900]);
  const carX = interpolate(p, [0, 1], [-700, 1500]);
  const flash = interpolate(frame, [9, 11, 15], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: -300,
          left: bandX - 400,
          width: 1900,
          height: 2600,
          transform: "skewX(-18deg)",
          background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.orangeDeep} 35%, #ffb347 50%, ${COLORS.orangeDeep} 65%, ${COLORS.pink})`,
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {new Array(22).fill(0).map((_, i) => {
          const y = random(`ly${i}`) * 1920;
          const len = 200 + random(`ll${i}`) * 500;
          const x = ((random(`lx${i}`) * 2000 + frame * 140) % 2600) - 800;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={len}
              height={6 + random(`lh${i}`) * 8}
              rx={4}
              fill="white"
              opacity={interpolate(Math.abs(p - 0.5), [0, 0.5], [0.85, 0])}
            />
          );
        })}
        {/* generic retro sports car silhouette */}
        <g transform={`translate(${carX} 860) scale(1.6)`}>
          <path
            d="M0 90 L 20 60 Q 60 50 110 30 Q 170 5 240 15 Q 290 25 330 55 L 390 62 Q 410 66 412 90 Z"
            fill={COLORS.night}
          />
          <path
            d="M125 35 Q 175 14 235 22 L 250 52 L 120 52 Z"
            fill={COLORS.cyan}
            opacity={0.85}
          />
          <rect x={395} y={68} width={18} height={8} rx={3} fill="#ffe14d" />
          <circle cx={95} cy={92} r={26} fill="#05010a" />
          <circle cx={95} cy={92} r={11} fill="#888" />
          <circle cx={325} cy={92} r={26} fill="#05010a" />
          <circle cx={325} cy={92} r={11} fill="#888" />
          <rect
            x={-120}
            y={70}
            width={110}
            height={6}
            rx={3}
            fill="white"
            opacity={0.7}
          />
          <rect
            x={-180}
            y={50}
            width={160}
            height={5}
            rx={3}
            fill="white"
            opacity={0.5}
          />
        </g>
      </svg>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};
