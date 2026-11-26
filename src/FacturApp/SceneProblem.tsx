import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Hl, Icon, SceneFade, Ticket, Title } from "./parts";
import { FONT, MONO, theme } from "./theme";
import { lin, prog } from "./anim";

/* Problema: 5.0 s → 15.5 s
   A 5.0–8.5  · gastos hormiga
   B 8.5–12.5 · por qué se pierden las facturas
   C 12.5–15.5 · la cuenta: $100 sin factura = $30 de más */

const CHIPS = ["Gasolina", "Oxxo", "Costco", "Casetas", "Comidas"];

const AntBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const tickets = [
    { name: "GASOLINA", total: "$850.00", tilt: -5 },
    { name: "OXXO", total: "$96.00", tilt: 3 },
    { name: "CASETAS", total: "$214.00", tilt: -3 },
  ];
  return (
    <SceneFade duration={105}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Title
          size={92}
          style={{
            opacity: prog(frame, 0, 14),
            translate: `0px ${(1 - prog(frame, 0, 14)) * 30}px`,
          }}
        >
          Gastos <Hl color={theme.amber}>hormiga</Hl>
        </Title>
        <div
          style={{
            marginTop: 14,
            opacity: prog(frame, 4, 18),
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 38,
            color: theme.muted,
          }}
        >
          Compras a público general
        </div>
        {/* chips que se nombran al ritmo de la voz */}
        <div
          style={{
            marginTop: 44,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 18,
            width: 900,
          }}
        >
          {CHIPS.map((c, i) => {
            const p = prog(frame, 6 + i * 14, 18 + i * 14);
            return (
              <div
                key={c}
                style={{
                  opacity: p,
                  scale: String(0.8 + p * 0.2),
                  padding: "16px 34px",
                  borderRadius: 50,
                  border: `2px solid ${theme.teal}`,
                  background: "rgba(25,242,216,0.1)",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 44,
                  color: theme.text,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
        {/* tickets con sello */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 70,
            width: 1000,
            justifyContent: "center",
          }}
        >
          {tickets.map((t, i) => {
            const s = 34 + i * 8;
            const p = prog(frame, s, s + 18);
            const st = prog(frame, 66 + i * 6, 74 + i * 6);
            return (
              <div
                key={t.name}
                style={{
                  position: "relative",
                  opacity: p,
                  translate: `0px ${(1 - p) * 120}px`,
                }}
              >
                <Ticket
                  width={310}
                  title={t.name}
                  lines={[["Consumo", t.total]]}
                  total={t.total}
                  tilt={t.tilt}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: 64,
                    opacity: st,
                    scale: String(1.7 - st * 0.7),
                    rotate: "-12deg",
                    border: `5px solid ${theme.danger}`,
                    color: theme.danger,
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 30,
                    background: "rgba(3,8,13,0.78)",
                  }}
                >
                  SIN FACTURA
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 60,
            opacity: prog(frame, 74, 92),
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 40,
            color: theme.muted,
            textAlign: "center",
          }}
        >
          Los proveedores grandes ya facturan solos.
          <br />
          <span style={{ color: theme.text }}>Estos gastos, no.</span>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const LostCard: React.FC<{
  icon: "globe" | "chat" | "calendar";
  title: string;
  sub: string;
  color: string;
  at: number;
  children: React.ReactNode;
}> = ({ icon, title, sub, color, at, children }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 16);
  return (
    <div
      style={{
        width: 930,
        height: 280,
        borderRadius: 40,
        padding: "0 38px",
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: "rgba(10,24,34,0.85)",
        border: `2px solid ${color}77`,
        boxShadow: `0 0 70px ${color}22`,
        opacity: p,
        translate: `${(1 - p) * 220}px 0px`,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 34,
          display: "grid",
          placeItems: "center",
          background: `${color}22`,
          flexShrink: 0,
        }}
      >
        <Icon kind={icon} size={72} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 50,
            color: theme.text,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 32,
            color: theme.muted,
            marginTop: 8,
          }}
        >
          {sub}
        </div>
      </div>
      <div style={{ width: 190, display: "grid", placeItems: "center" }}>
        {children}
      </div>
    </div>
  );
};

const LostBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const bar = 12 + lin(frame, 4, 70) * 18; // se queda atorada
  const dots = Math.floor(frame / 8) % 4;
  const crossed = lin(frame, 92, 108);
  return (
    <SceneFade duration={120}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Title size={80} style={{ opacity: prog(frame, 0, 12) }}>
          ¿Por qué se <Hl color={theme.danger}>pierden</Hl>?
        </Title>
        <div
          style={{
            marginTop: 60,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <LostCard
            icon="globe"
            title="Portales lentos"
            sub="≈ 10 min por ticket"
            color={theme.amber}
            at={4}
          >
            <div style={{ width: 170 }}>
              <div
                style={{
                  height: 16,
                  borderRadius: 16,
                  background: "#122635",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${bar}%`,
                    height: "100%",
                    background: theme.amber,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  color: theme.amber,
                  fontSize: 26,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                cargando…
              </div>
            </div>
          </LostCard>
          <LostCard
            icon="chat"
            title="Comercios que no responden"
            sub="Nadie contesta"
            color={theme.danger}
            at={34}
          >
            <div
              style={{
                padding: "14px 22px",
                borderRadius: 28,
                background: "#122635",
                fontFamily: MONO,
                fontSize: 40,
                color: theme.muted,
                letterSpacing: 4,
              }}
            >
              {".".repeat(dots)}
              <span style={{ opacity: 0 }}>{".".repeat(3 - dots)}</span>
            </div>
          </LostCard>
          <LostCard
            icon="calendar"
            title="Solo facturan en el mes en curso"
            sub="Cada mes que pasa, se pierde la deducción"
            color={theme.teal}
            at={74}
          >
            <div
              style={{
                position: "relative",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 70,
                color: theme.text,
              }}
            >
              30
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: "50%",
                  height: 8,
                  width: `${crossed * 120}%`,
                  background: theme.danger,
                  borderRadius: 8,
                  rotate: "-12deg",
                }}
              />
            </div>
          </LostCard>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const MoneyBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const a = prog(frame, 4, 24);
  const arrow = prog(frame, 26, 40);
  const b = prog(frame, 38, 58);
  const amount = Math.round(lin(frame, 40, 62) * 30);
  const note = prog(frame, 62, 78);
  return (
    <SceneFade duration={90}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              opacity: a,
              scale: String(0.85 + a * 0.15),
              width: 840,
              padding: "34px 40px",
              borderRadius: 44,
              border: `3px solid ${theme.muted}77`,
              background: "rgba(127,166,166,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 44,
                color: theme.muted,
              }}
            >
              Gasto <Hl color={theme.danger}>sin factura</Hl>
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 190,
                color: theme.text,
                lineHeight: 1.05,
              }}
            >
              $100
            </div>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 90,
              color: theme.teal,
              opacity: arrow,
              translate: `0px ${(1 - arrow) * -24}px`,
            }}
          >
            ↓
          </div>
          <div
            style={{
              opacity: b,
              scale: String(0.85 + b * 0.15),
              width: 840,
              padding: "34px 40px",
              borderRadius: 44,
              background: theme.danger,
              boxShadow: `0 0 90px ${theme.danger}77`,
              textAlign: "center",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 190,
                lineHeight: 1.05,
              }}
            >
              ${amount}
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 46 }}>
              de impuesto de más
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              opacity: note,
              width: 840,
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 32,
              color: theme.muted,
            }}
          >
            Un gasto sin factura no se deduce: pagas 30% sobre ese monto.
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const SceneProblem: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={105}>
      <AntBeat />
    </Sequence>
    <Sequence from={105} durationInFrames={120}>
      <LostBeat />
    </Sequence>
    <Sequence from={225} durationInFrames={90}>
      <MoneyBeat />
    </Sequence>
  </AbsoluteFill>
);
