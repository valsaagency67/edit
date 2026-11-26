import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT, sec, theme } from "./theme";
import { OUT } from "./anim";

type Cap = { from: number; to: number; text: string };

// *palabra* = resaltada en verde azulado
export const CAPTIONS: Cap[] = [
  {
    from: 0.3,
    to: 4.8,
    text: "¿Cuántas *facturas* pierde tu empresa cada mes?",
  },
  {
    from: 5.2,
    to: 9.0,
    text: "Gasolina, casetas, comidas… tickets que *no son factura*.",
  },
  {
    from: 9.2,
    to: 12.2,
    text: "Portales lentos: hasta *10 minutos* por ticket.",
  },
  {
    from: 12.4,
    to: 14.9,
    text: "Gasto sin factura = gasto que *no se deduce*.",
  },
  { from: 15.2, to: 18.8, text: "Toma una *foto* del ticket." },
  { from: 19.2, to: 22.2, text: "Mándala por la *app* o por *WhatsApp*." },
  {
    from: 22.4,
    to: 26.9,
    text: "Un *agente de IA* entra a portales, escribe o llama al comercio.",
  },
  {
    from: 27.2,
    to: 29.9,
    text: "De foto a *factura*. Sin que muevas un dedo.",
  },
  { from: 30.2, to: 34.2, text: "*10 segundos* en lugar de 10 minutos." },
  { from: 34.5, to: 37.9, text: "Más gastos *deducibles*." },
  {
    from: 38.2,
    to: 39.9,
    text: "Toma una foto. *FacturApp* lo factura por ti.",
  },
];

const renderText = (text: string) =>
  text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: theme.teal }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CAPTIONS.find(
    (c) => frame >= sec(c.from) && frame <= sec(c.to) + 6,
  );
  if (!active) return null;
  const a = sec(active.from);
  const b = sec(active.to);
  const opacity = interpolate(frame, [a, a + 6, b, b + 6], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [a, a + 10], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          marginBottom: 300,
          width: 940,
          opacity,
          translate: `0px ${y}px`,
          padding: "26px 40px",
          borderRadius: 36,
          background: "rgba(3,12,18,0.72)",
          border: `2px solid rgba(134,227,204,0.28)`,
          boxShadow: "0 0 60px rgba(134,227,204,0.12)",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 62,
          lineHeight: 1.22,
          color: theme.text,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {renderText(active.text)}
      </div>
    </AbsoluteFill>
  );
};
