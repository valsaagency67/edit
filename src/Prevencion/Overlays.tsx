import { TikTokPage } from "@remotion/captions";
import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ChipTone } from "./data";
import { DISPLAY_FONT, UI_FONT } from "./fonts";

export const COLORS = {
  brand: "#7B2CBF",
  brandDark: "#3C096C",
  highlight: "#FFD60A",
  danger: "#E5383B",
  white: "#FFFFFF",
  black: "#000000",
};

// Zonas seguras para TikTok/Reels (1080x1920).
// El título va sobre el pecho (no arriba) porque en los planos cerrados la
// cabeza llega casi al borde superior.
const TITLE_TOP = 1000;
const TITLE_VISIBLE_FRAMES = 80;
const CAPTION_CENTER_Y = 1260;
const CHIPS_TOP = 1430;

export const CaptionPage: React.FC<{
  readonly page: TikTokPage;
  readonly hidden: boolean;
}> = ({ page, hidden }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = page.startMs + (frame / fps) * 1000;

  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220 },
    durationInFrames: 8,
  });

  return (
    <AbsoluteFill
      style={{
        top: CAPTION_CENTER_Y - 130,
        height: 260,
        justifyContent: "center",
        alignItems: "center",
        opacity: hidden ? 0 : 1,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 100,
          maxWidth: 900,
          lineHeight: 1.08,
          wordSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          color: COLORS.white,
          WebkitTextStroke: "16px black",
          paintOrder: "stroke",
          letterSpacing: 1,
          transform: `scale(${interpolate(enter, [0, 1], [0.7, 1])}) translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
        }}
      >
        {page.tokens.map((t, i) => {
          const active = t.fromMs <= timeMs && t.toMs > timeMs;
          return (
            <React.Fragment key={`${t.fromMs}-${i}`}>
              {t.text.startsWith(" ") ? " " : null}
              <span
                style={{
                  display: "inline-block",
                  color: active ? COLORS.highlight : COLORS.white,
                  transform: active ? "scale(1.12)" : "scale(1)",
                }}
              >
                {t.text.trim()}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TitleChip: React.FC<{
  readonly text: string;
  readonly top?: number;
}> = ({ text, top = TITLE_TOP }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 3, fps, config: { damping: 12 } });
  const exit = spring({
    frame: frame - TITLE_VISIBLE_FRAMES,
    fps,
    config: { damping: 200 },
    durationInFrames: 8,
  });
  if (!text || exit >= 0.999) {
    return null;
  }
  return (
    <AbsoluteFill style={{ top, height: 110, alignItems: "center" }}>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 58,
          color: COLORS.white,
          background: COLORS.brand,
          padding: "10px 34px",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          letterSpacing: 2,
          transform: `scale(${enter * (1 - exit)}) rotate(-3deg)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const chipStyle = (tone: ChipTone): React.CSSProperties => {
  if (tone === "danger") {
    return { background: COLORS.danger, color: COLORS.white };
  }
  if (tone === "check") {
    return { background: COLORS.white, color: COLORS.brandDark };
  }
  return { background: COLORS.brand, color: COLORS.white };
};

const chipIcon = (tone: ChipTone) =>
  tone === "danger" ? "✕ " : tone === "check" ? "✓ " : "";

export const Chips: React.FC<{
  readonly chips: readonly { text: string; frame: number; tone: ChipTone }[];
}> = ({ chips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (chips.length === 0) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{
        top: CHIPS_TOP,
        height: 260,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        gap: 18,
        padding: "0 70px",
      }}
    >
      {chips.map((c) => {
        const p = spring({
          frame: frame - c.frame,
          fps,
          config: { damping: 10, stiffness: 180 },
        });
        if (frame < c.frame) {
          return null;
        }
        return (
          <div
            key={c.text}
            style={{
              ...chipStyle(c.tone),
              fontFamily: UI_FONT,
              fontWeight: 900,
              fontSize: c.text.length > 20 ? 36 : 44,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              padding: "12px 26px",
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-8, 0])}deg)`,
            }}
          >
            {chipIcon(c.tone)}
            {c.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const StampOverlay: React.FC<{ readonly text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 9, stiffness: 200 } });
  const fontSize = Math.min(
    130,
    fitText({ fontFamily: DISPLAY_FONT, text, withinWidth: width * 0.78 })
      .fontSize,
  );
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", top: 120 }}
    >
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize,
          color: COLORS.white,
          background: COLORS.danger,
          padding: "16px 40px",
          borderRadius: 18,
          border: "8px solid white",
          letterSpacing: 2,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(-5deg)`,
          opacity: interpolate(p, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export type LineaAtencion = { nombre: string; numero: string };

const lineasValidas = (lineas: readonly LineaAtencion[]) =>
  lineas.filter((l) => l.numero.trim() !== "");

export const PointCard: React.FC<{
  /** null = todavía no hay número (se muestra [NÚMERO]). */
  readonly linea: LineaAtencion | null;
  /** Punta del dedo, como fracción del cuadro (0–1). */
  readonly x: number;
  readonly y: number;
}> = ({ linea, x, y }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 9, stiffness: 200 } });
  const pending = linea === null;
  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height - 34,
        transformOrigin: "50% 100%",
        transform: `translate(-50%, -100%) scale(${p})`,
        opacity: Math.min(1, p * 3),
      }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: 24,
          padding: "10px 26px 14px",
          textAlign: "center",
          borderBottom: `12px solid ${COLORS.brand}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: pending ? 70 : 130,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            color: pending ? COLORS.danger : COLORS.brandDark,
          }}
        >
          {pending ? "[NÚMERO]" : linea.numero}
        </div>
        {linea?.nombre ? (
          <div
            style={{
              fontFamily: UI_FONT,
              fontWeight: 900,
              fontSize: 27,
              letterSpacing: 1,
              color: COLORS.brandDark,
              textTransform: "uppercase",
            }}
          >
            {linea.nombre}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -22,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: `24px solid ${COLORS.brand}`,
        }}
      />
    </div>
  );
};

export const BRollImage: React.FC<{
  readonly src: string;
  readonly duration: number;
}> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220 },
    durationInFrames: 8,
  });
  const drift = interpolate(frame, [0, duration], [1, 1.07]);
  return (
    <AbsoluteFill
      style={{ backgroundColor: "black", opacity: Math.min(1, enter * 2) }}
    >
      {/* Fondo: la misma imagen, desenfocada, para llenar el vertical. */}
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) brightness(0.45)",
          transform: "scale(1.25)",
        }}
      />
      <AbsoluteFill
        style={{ top: -360, justifyContent: "center", alignItems: "center" }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            display: "block",
            boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
            transform: `scale(${interpolate(enter, [0, 1], [1.25, 1]) * drift})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC<{ readonly total: number }> = ({
  total,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ height: 14, background: "rgba(0,0,0,0.35)" }}>
      <div
        style={{
          height: "100%",
          width: `${(frame / Math.max(1, total - 1)) * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.highlight})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Outro: React.FC<{
  readonly lineas: readonly LineaAtencion[];
}> = ({ lineas }) => {
  const validas = lineasValidas(lineas);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const l1 = line(0);
  const l2 = line(6);
  const l3 = line(16);
  const l4 = line(26);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${COLORS.brand}, ${COLORS.brandDark} 75%)`,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 120,
          lineHeight: 1.05,
          color: COLORS.white,
          transform: `scale(${l1})`,
        }}
      >
        EL RESPETO
        <br />
        PROTEGE,
      </div>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 120,
          lineHeight: 1.05,
          marginTop: 16,
          color: COLORS.highlight,
          transform: `scale(${l2}) rotate(-3deg)`,
        }}
      >
        LA INDIFERENCIA
        <br />
        NO.
      </div>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 76,
          marginTop: 56,
          background: COLORS.white,
          color: COLORS.brandDark,
          borderRadius: 18,
          padding: "6px 36px",
          letterSpacing: 2,
          transform: `scale(${l3})`,
        }}
      >
        NO ESTÁS SOLA.
      </div>
      <div
        style={{
          fontFamily: UI_FONT,
          fontWeight: 900,
          fontSize: 38,
          color: COLORS.white,
          marginTop: 36,
          letterSpacing: 2,
          lineHeight: 1.3,
          opacity: l4,
          transform: `translateY(${interpolate(l4, [0, 1], [40, 0])}px)`,
        }}
      >
        LA VIOLENCIA SE PREVIENE,
        <br />
        SE RECONOCE Y SE DENUNCIA.
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
            marginTop: 32,
          }}
        >
          {validas.map((l) => (
            <div
              key={l.numero}
              style={{
                background: COLORS.white,
                color: COLORS.brandDark,
                borderRadius: 16,
                padding: "10px 34px",
                fontSize: validas.length > 2 ? 48 : 72,
                fontFamily: DISPLAY_FONT,
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              {l.numero}
              {l.nombre ? (
                <div
                  style={{
                    fontFamily: UI_FONT,
                    fontWeight: 900,
                    fontSize: 26,
                  }}
                >
                  {l.nombre.toUpperCase()}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
