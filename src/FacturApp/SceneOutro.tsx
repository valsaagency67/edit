import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Logo } from "./parts";
import { FONT, theme } from "./theme";
import { prog } from "./anim";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const a = prog(frame, 0, 16);
  const b = prog(frame, 14, 30);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 380,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: 1100,
          background: `radial-gradient(circle, ${theme.teal}33, transparent 65%)`,
          scale: String(0.7 + a * 0.4),
          opacity: a,
        }}
      />
      <div
        style={{
          opacity: a,
          scale: String(0.8 + a * 0.2),
          filter: `drop-shadow(0 0 40px ${theme.teal}66)`,
        }}
      >
        <Logo size={1.15} />
      </div>
      <div
        style={{
          marginTop: 56,
          opacity: b,
          translate: `0px ${(1 - b) * 24}px`,
          padding: "20px 52px",
          borderRadius: 60,
          border: `3px solid ${theme.teal}`,
          background: "rgba(134,227,204,0.1)",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 58,
          color: theme.text,
          letterSpacing: 1,
        }}
      >
        facturappmx.com
      </div>
    </AbsoluteFill>
  );
};
