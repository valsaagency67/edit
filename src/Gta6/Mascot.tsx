import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FPS, Word } from "./timeline";

/**
 * "Pixi": original mascot, a little gamepad with a face.
 * Talks (mouth opens) while a word is being spoken.
 */
export const Mascot: React.FC<{
  words: Word[];
  lead: number;
  x: number;
  y: number;
  size?: number;
  mood?: "happy" | "wow" | "worried";
}> = ({ words, lead, x, y, size = 260, mood = "happy" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = ((frame - lead) / FPS) * 1000;
  const talking = words.some((w) => ms >= w.startMs && ms < w.endMs);
  const mouthOpen = talking ? 0.4 + 0.6 * Math.abs(Math.sin(frame * 1.3)) : 0;

  const enter = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const bob = Math.sin(frame / 6) * (talking ? 6 : 3);
  const blink = frame % 90 > 85 ? 0.1 : 1;
  const tilt = Math.sin(frame / 18) * 4;
  const pupilX = Math.sin(frame / 40) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size,
        width: size,
        height: size,
        transform: `translateY(${(1 - enter) * 120 + bob}px) rotate(${tilt}deg) scale(${0.6 + 0.4 * enter})`,
        transformOrigin: "50% 100%",
      }}
    >
      <svg viewBox="0 0 260 260" width={size} height={size}>
        <ellipse
          cx={130}
          cy={250}
          rx={80}
          ry={10}
          fill="black"
          opacity={0.35}
        />
        {/* legs */}
        <rect
          x={88}
          y={210}
          width={18}
          height={36}
          rx={9}
          fill={COLORS.orangeDeep}
        />
        <rect
          x={154}
          y={210}
          width={18}
          height={36}
          rx={9}
          fill={COLORS.orangeDeep}
        />
        {/* gamepad body */}
        <path
          d="M40 90 Q 40 60 75 60 L 185 60 Q 220 60 220 90 L 240 190 Q 245 225 210 222 Q 190 220 175 195 L 85 195 Q 70 220 50 222 Q 15 225 20 190 Z"
          fill={COLORS.orange}
          stroke="#7a2e00"
          strokeWidth={5}
        />
        <path
          d="M60 80 Q 130 66 200 80"
          stroke="#ffd08a"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* d-pad */}
        <rect x={52} y={140} width={30} height={10} rx={3} fill="#7a2e00" />
        <rect x={62} y={130} width={10} height={30} rx={3} fill="#7a2e00" />
        {/* buttons */}
        <circle cx={196} cy={135} r={7} fill={COLORS.cyan} />
        <circle cx={210} cy={150} r={7} fill={COLORS.pink} />
        <circle cx={182} cy={150} r={7} fill="#ffe14d" />
        {/* eyes */}
        {[100, 160].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={112} rx={17} ry={20 * blink} fill="white" />
            <circle cx={ex + pupilX} cy={115} r={9 * blink} fill={COLORS.ink} />
            <circle cx={ex + pupilX + 3} cy={111} r={3 * blink} fill="white" />
          </g>
        ))}
        {mood === "worried" && (
          <>
            <path
              d="M84 86 L 114 94"
              stroke={COLORS.ink}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <path
              d="M176 86 L 146 94"
              stroke={COLORS.ink}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </>
        )}
        {/* cheeks */}
        <ellipse
          cx={80}
          cy={140}
          rx={12}
          ry={7}
          fill={COLORS.pink}
          opacity={0.5}
        />
        <ellipse
          cx={180}
          cy={140}
          rx={12}
          ry={7}
          fill={COLORS.pink}
          opacity={0.5}
        />
        {/* mouth */}
        {mouthOpen > 0 || mood === "wow" ? (
          <ellipse
            cx={130}
            cy={152}
            rx={14}
            ry={4 + 12 * Math.max(mouthOpen, mood === "wow" ? 0.8 : 0)}
            fill="#5a1300"
          />
        ) : (
          <path
            d={
              mood === "worried"
                ? "M115 158 Q 130 148 145 158"
                : "M112 148 Q 130 166 148 148"
            }
            stroke="#5a1300"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* cable / antenna */}
        <path
          d="M130 60 Q 135 30 160 22"
          stroke="#222"
          strokeWidth={5}
          fill="none"
        />
        <circle cx={162} cy={21} r={7} fill={COLORS.cyan} />
      </svg>
    </div>
  );
};
