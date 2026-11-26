import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "./theme";
import { rand } from "./anim";

const PARTICLES = 34;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 80;
  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* resplandores */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${30 + Math.sin(frame / 120) * 8}% 18%, rgba(134,227,204,0.16), transparent 62%), radial-gradient(1000px 1000px at ${75 + Math.cos(frame / 140) * 8}% 82%, rgba(0,120,255,0.12), transparent 60%)`,
        }}
      />
      {/* rejilla en perspectiva */}
      <AbsoluteFill style={{ perspective: 900, opacity: 0.5 }}>
        <div
          style={{
            position: "absolute",
            left: -600,
            right: -600,
            bottom: -200,
            height: 1300,
            transformOrigin: "50% 100%",
            rotate: "x 68deg",
            backgroundImage: `linear-gradient(${theme.tealSoft} 2px, transparent 2px), linear-gradient(90deg, ${theme.tealSoft} 2px, transparent 2px)`,
            backgroundSize: "110px 110px",
            backgroundPosition: `0px ${(frame * 1.6) % 110}px`,
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0.9), transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0.9), transparent 85%)",
          }}
        />
      </AbsoluteFill>
      {/* partículas */}
      {new Array(PARTICLES).fill(0).map((_, i) => {
        const x = rand(i + 1) * 1080;
        const speed = 0.25 + rand(i + 50) * 0.6;
        const size = 3 + rand(i + 90) * 5;
        const y =
          1920 - ((rand(i + 7) * 1920 + frame * speed * 2.2) % 1980) + 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + drift * (rand(i + 3) - 0.5),
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: theme.teal,
              opacity: 0.12 + rand(i + 20) * 0.35,
              boxShadow: `0 0 ${size * 3}px ${theme.teal}`,
            }}
          />
        );
      })}
      {/* viñeta */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
