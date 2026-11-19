import { fitText } from "@remotion/layout-utils";
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TheBoldFont } from "../load-font";
import { COLORS } from "./timeline";

const fit = (text: string, max: number) =>
  Math.min(
    max,
    fitText({
      text,
      withinWidth: 940,
      fontFamily: TheBoldFont,
      textTransform: "uppercase",
    }).fontSize,
  );

export const Headline: React.FC<{
  title: string;
  subtitle: string;
  big?: boolean;
}> = ({ title, subtitle, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const b = spring({
    frame: frame - 6,
    fps,
    config: { damping: 10, stiffness: 160 },
  });
  const wobble = Math.sin(frame / 10) * 1.2;

  const titleSize = fit(title, big ? 190 : 140);
  const subSize = fit(subtitle, big ? 120 : 92);

  const shadow = "0 8px 0 rgba(0,0,0,0.35), 0 0 30px rgba(0,0,0,0.4)";

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: TheBoldFont,
        textTransform: "uppercase",
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: titleSize,
          color: COLORS.white,
          textShadow: shadow,
          transform: `scale(${interpolate(a, [0, 1], [0.3, 1])}) rotate(${wobble}deg)`,
          opacity: a,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: subSize,
          color: COLORS.orange,
          WebkitTextStroke: "4px #5a1300",
          paintOrder: "stroke",
          textShadow: shadow,
          transform: `translateY(${interpolate(b, [0, 1], [60, 0])}px) scale(${interpolate(b, [0, 1], [0.6, 1])})`,
          opacity: Math.max(0, b),
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
