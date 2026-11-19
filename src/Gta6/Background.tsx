import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "./timeline";

const HORIZON = 1130;
const PIER_TOP = 1300;

const Palm: React.FC<{
  x: number;
  flip?: boolean;
  scale?: number;
  sway: number;
}> = ({ x, flip, scale = 1, sway }) => (
  <g
    transform={`translate(${x} ${PIER_TOP}) scale(${flip ? -scale : scale} ${scale})`}
  >
    <path
      d="M0 0 C 10 -150, 30 -330, 70 -520"
      stroke="#1c0a2b"
      strokeWidth={26}
      fill="none"
      strokeLinecap="round"
    />
    <g transform={`translate(70 -520) rotate(${sway})`}>
      {[-150, -110, -60, -10, 35, 80].map((a, i) => (
        <path
          key={i}
          transform={`rotate(${a})`}
          d="M0 0 C 60 -40, 140 -30, 200 20 C 140 0, 70 -5, 0 0 Z"
          fill="#1c0a2b"
        />
      ))}
      <circle r={16} fill="#1c0a2b" />
    </g>
  </g>
);

const BULB_COLORS = [
  COLORS.pink,
  COLORS.cyan,
  COLORS.orange,
  "#ffe14d",
  "#7dff6b",
];

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 25) * 4;
  const sunGlow = 0.85 + Math.sin(frame / 20) * 0.08;
  const gridShift = (frame * 2.4) % 80;
  const flicker = random(`flick-${Math.floor(frame / 3)}`) > 0.93 ? 0.35 : 1;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d0420" />
            <stop offset="0.35" stopColor="#2a0f45" />
            <stop offset="0.6" stopColor="#6a1458" />
            <stop offset="0.75" stopColor="#c2185b" />
          </linearGradient>
          <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe14d" />
            <stop offset="0.5" stopColor="#ff8a1f" />
            <stop offset="1" stopColor="#ff3d8b" />
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#ff8a1f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff3d8b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b1a6b" />
            <stop offset="1" stopColor="#140a35" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d0833" />
            <stop offset="1" stopColor="#09020f" />
          </linearGradient>
          <clipPath id="sunClip">
            <rect x={0} y={0} width={1080} height={HORIZON} />
          </clipPath>
          <clipPath id="floorClip">
            <rect x={0} y={PIER_TOP + 40} width={1080} height={1920} />
          </clipPath>
        </defs>

        <rect width={1080} height={1920} fill="url(#sky)" />

        {/* stars */}
        {new Array(70).fill(0).map((_, i) => {
          const x = random(`sx${i}`) * 1080;
          const y = random(`sy${i}`) * 900;
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 15 + i));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.5 + random(`sr${i}`) * 2}
              fill="white"
              opacity={tw * 0.8}
            />
          );
        })}

        {/* sun */}
        <circle
          cx={540}
          cy={HORIZON}
          r={460}
          fill="url(#glow)"
          opacity={sunGlow}
        />
        <g clipPath="url(#sunClip)">
          <circle cx={540} cy={HORIZON - 30} r={290} fill="url(#sun)" />
          {new Array(7).fill(0).map((_, i) => {
            const y = HORIZON - 190 + i * 30 + ((frame * 0.6) % 30);
            return (
              <rect
                key={i}
                x={200}
                y={y}
                width={680}
                height={4 + i * 2.2}
                fill="#a8155a"
              />
            );
          })}
        </g>

        {/* water */}
        <rect
          x={0}
          y={HORIZON}
          width={1080}
          height={PIER_TOP - HORIZON}
          fill="url(#water)"
        />
        {new Array(6).fill(0).map((_, i) => {
          const y = HORIZON + 18 + i * 28;
          const off = Math.sin(frame / 12 + i) * 30;
          return (
            <path
              key={i}
              d={`M ${-40 + off} ${y} q 45 -10 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0 t 90 0`}
              stroke={i % 2 ? COLORS.pink : COLORS.cyan}
              strokeOpacity={0.35}
              strokeWidth={3}
              fill="none"
            />
          );
        })}

        {/* palms */}
        <Palm x={70} sway={sway} scale={1.05} />
        <Palm x={190} sway={-sway} scale={0.75} />
        <Palm x={1010} flip sway={-sway} scale={1.1} />
        <Palm x={890} flip sway={sway} scale={0.7} />

        {/* pier */}
        <rect x={0} y={PIER_TOP} width={1080} height={40} fill="#6b3f22" />
        <rect x={0} y={PIER_TOP} width={1080} height={8} fill="#a8683a" />
        {new Array(14).fill(0).map((_, i) => (
          <rect
            key={i}
            x={i * 80 + 20}
            y={PIER_TOP + 10}
            width={4}
            height={30}
            fill="#4a2a16"
          />
        ))}

        {/* neon grid floor */}
        <rect
          x={0}
          y={PIER_TOP + 40}
          width={1080}
          height={1920}
          fill="url(#floor)"
        />
        <g
          clipPath="url(#floorClip)"
          stroke={COLORS.pink}
          strokeOpacity={0.45}
          strokeWidth={3}
        >
          {new Array(12).fill(0).map((_, i) => {
            const t = (i * 80 + gridShift) / 960;
            const y = PIER_TOP + 40 + t * t * 600;
            return <line key={`h${i}`} x1={0} x2={1080} y1={y} y2={y} />;
          })}
          {new Array(17).fill(0).map((_, i) => {
            const x = -1200 + i * 210;
            return (
              <line
                key={`v${i}`}
                x1={540}
                y1={PIER_TOP + 40}
                x2={x}
                y2={1920}
              />
            );
          })}
        </g>

        {/* neon sign */}
        <g
          opacity={flicker}
          style={{ filter: "drop-shadow(0 0 10px #36f1ff)" }}
        >
          <rect
            x={985}
            y={560}
            width={70}
            height={330}
            rx={14}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={5}
          />
          {"PLAY".split("").map((ch, i) => (
            <text
              key={i}
              x={1020}
              y={630 + i * 75}
              textAnchor="middle"
              fontSize={56}
              fontFamily="TheBoldFont"
              fill={COLORS.cyan}
            >
              {ch}
            </text>
          ))}
        </g>
        <g style={{ filter: "drop-shadow(0 0 10px #ff3d8b)" }}>
          <path
            d="M45 620 l12 26 l28 4 l-20 20 l5 28 l-25 -13 l-25 13 l5 -28 l-20 -20 l28 -4 z"
            fill="none"
            stroke={COLORS.pink}
            strokeWidth={5}
            opacity={0.6 + 0.4 * Math.abs(Math.sin(frame / 10))}
          />
        </g>

        {/* string lights */}
        <path
          d="M -20 30 Q 270 110 540 40 Q 810 110 1100 30"
          stroke="#2b1a10"
          strokeWidth={4}
          fill="none"
        />
        {new Array(16).fill(0).map((_, i) => {
          const t = i / 15;
          const x = -20 + t * 1120;
          const half = t < 0.5 ? t * 2 : (t - 0.5) * 2;
          const y = 30 + 4 * half * (1 - half) * 55 + (t < 0.5 ? 0 : 0) + 6;
          const on = (Math.floor(frame / 8) + i) % 3 !== 0;
          const c = BULB_COLORS[i % BULB_COLORS.length];
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y + 12}
                r={on ? 22 : 0}
                fill={c}
                opacity={0.25}
              />
              <ellipse
                cx={x}
                cy={y + 12}
                rx={9}
                ry={13}
                fill={c}
                opacity={on ? 1 : 0.4}
              />
            </g>
          );
        })}

        {/* floating sparkles */}
        {new Array(26).fill(0).map((_, i) => {
          const speed = 0.6 + random(`ps${i}`) * 1.2;
          const x = random(`px${i}`) * 1080 + Math.sin(frame / 30 + i) * 20;
          const y =
            (((random(`py${i}`) * 1920 - frame * speed) % 1920) + 1920) % 1920;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2 + random(`pr${i}`) * 3}
              fill="white"
              opacity={interpolate(y, [0, 400, 1500, 1920], [0, 0.7, 0.7, 0])}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
