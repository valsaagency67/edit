import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT, MONO, theme } from "./theme";

/** Fade in/out de cada escena. */
export const SceneFade: React.FC<{
  duration: number;
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ duration, children, fadeIn = 8, fadeOut = 8 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fadeIn, duration - fadeOut, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const Icon: React.FC<{
  kind:
    | "fuel"
    | "toll"
    | "food"
    | "check"
    | "bolt"
    | "globe"
    | "pen"
    | "phone"
    | "chat"
    | "camera";
  size?: number;
  color?: string;
}> = ({ kind, size = 80, color = theme.teal }) => {
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, React.ReactNode> = {
    fuel: (
      <>
        <rect x="14" y="10" width="26" height="44" rx="4" {...p} />
        <path d="M14 26h26" {...p} />
        <path d="M40 22l8 6v18a4 4 0 0 0 8 0V24l-6-8" {...p} />
        <path d="M10 54h34" {...p} />
      </>
    ),
    toll: (
      <>
        <path d="M6 44h52" {...p} />
        <path d="M10 44V26h44v18" {...p} />
        <path d="M16 34h8M30 34h8M44 34h4" {...p} />
        <path d="M32 26V12" {...p} />
        <path d="M22 54h20" {...p} />
      </>
    ),
    food: (
      <>
        <path d="M18 8v18a6 6 0 0 0 12 0V8M24 8v48" {...p} />
        <path d="M46 8c-6 6-8 14-8 24h8v24" {...p} />
      </>
    ),
    check: <path d="M12 34l14 14 26-30" {...p} strokeWidth={7} />,
    bolt: <path d="M36 6L14 36h16l-4 22 24-32H34z" {...p} />,
    globe: (
      <>
        <circle cx="32" cy="32" r="22" {...p} />
        <path
          d="M10 32h44M32 10c-10 12-10 32 0 44M32 10c10 12 10 32 0 44"
          {...p}
        />
      </>
    ),
    pen: (
      <>
        <path d="M10 54l4-14L42 12l10 10-28 28z" {...p} />
        <path d="M36 18l10 10" {...p} />
      </>
    ),
    phone: (
      <path
        d="M16 10l10-2 6 14-8 6a28 28 0 0 0 12 12l6-8 14 6-2 10c-26 4-52-22-38-38z"
        {...p}
      />
    ),
    chat: (
      <>
        <path
          d="M10 14h44a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30l-12 10V46h-8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z"
          {...p}
        />
        <path d="M20 26h24M20 35h14" {...p} />
      </>
    ),
    camera: (
      <>
        <path d="M8 20h12l4-6h16l4 6h12v34H8z" {...p} />
        <circle cx="32" cy="36" r="10" {...p} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {paths[kind]}
    </svg>
  );
};

export const Logo: React.FC<{ size?: number }> = ({ size = 1 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 28 * size,
      fontFamily: FONT,
    }}
  >
    <svg width={150 * size} height={150 * size} viewBox="0 0 150 150">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E4ECE9" />
          <stop offset="0.45" stopColor="#7E948E" />
          <stop offset="1" stopColor="#1F3A36" />
        </linearGradient>
      </defs>
      <circle cx="75" cy="75" r="72" fill="url(#lg)" />
      {/* capas apiladas */}
      <path
        d="M32 66c14-12 28-18 43-18s29 6 43 18c-14 4-29 10-43 10S46 70 32 66z"
        fill="#fff"
      />
      <path
        d="M32 86c14 6 29 12 43 12s29-6 43-12c-6 12-24 26-43 26s-37-14-43-26z"
        fill="#fff"
        opacity="0.92"
      />
    </svg>
    <div
      style={{
        fontSize: 112 * size,
        fontWeight: 500,
        letterSpacing: -2 * size,
        color: theme.text,
        lineHeight: 1,
      }}
    >
      Factur<span style={{ color: theme.teal }}>App</span>
    </div>
  </div>
);

/** Ticket de papel con borde dentado. */
export const Ticket: React.FC<{
  width?: number;
  title: string;
  lines: [string, string][];
  total: string;
  tilt?: number;
  stamp?: string;
}> = ({ width = 420, title, lines, total, tilt = 0, stamp }) => {
  const zig = `polygon(0 0,100% 0,100% calc(100% - 14px),${new Array(14)
    .fill(0)
    .map((_, i) => {
      const x0 = 100 - (i / 14) * 100;
      const x1 = 100 - ((i + 0.5) / 14) * 100;
      return `${x0.toFixed(2)}% 100%,${x1.toFixed(2)}% calc(100% - 14px)`;
    })
    .join(",")},0 calc(100% - 14px))`;
  return (
    <div
      style={{
        width,
        rotate: `${tilt}deg`,
        position: "relative",
        filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
      }}
    >
      <div
        style={{
          background: theme.paper,
          color: theme.ink,
          padding: "30px 30px 52px",
          clipPath: zig,
          fontFamily: MONO,
          fontSize: 22,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 28,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{ borderTop: `2px dashed ${theme.ink}55`, margin: "14px 0" }}
        />
        {lines.map(([a, b], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "6px 0",
            }}
          >
            <span>{a}</span>
            <span>{b}</span>
          </div>
        ))}
        <div
          style={{ borderTop: `2px dashed ${theme.ink}55`, margin: "14px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: 26,
          }}
        >
          <span>TOTAL</span>
          <span>{total}</span>
        </div>
      </div>
      {stamp ? (
        <div
          style={{
            position: "absolute",
            right: 10,
            bottom: 70,
            rotate: "-14deg",
            border: `5px solid ${theme.danger}`,
            color: theme.danger,
            borderRadius: 10,
            padding: "4px 14px",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 30,
            background: "rgba(255,255,255,0.35)",
          }}
        >
          {stamp}
        </div>
      ) : null}
    </div>
  );
};

/** Texto grande de título de escena. */
export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 92, style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: -2,
      color: theme.text,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hl: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = theme.teal,
}) => (
  <span style={{ color, textShadow: `0 0 40px ${color}66` }}>{children}</span>
);
