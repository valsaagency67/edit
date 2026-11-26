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
          <stop offset="0" stopColor="#3DFFE6" />
          <stop offset="1" stopColor="#00A99D" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="138" height="138" rx="38" fill="url(#lg)" />
      {/* ticket con borde dentado */}
      <path
        d="M46 30h58v90l-9.7-8-9.6 8-9.7-8-9.7 8-9.6-8-9.7 8z"
        fill="#03141A"
      />
      <path
        d="M58 56h34M58 74h34M58 92h20"
        stroke="#19F2D8"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M96 88l7 8 14-18"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    <div
      style={{
        fontSize: 108 * size,
        fontWeight: 800,
        letterSpacing: -3 * size,
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
            fontWeight: 800,
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
            fontWeight: 800,
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
      fontWeight: 800,
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
