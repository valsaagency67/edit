import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Hl, Icon, SceneFade, Ticket, Title } from "./parts";
import { FONT, MONO, theme } from "./theme";
import { lin, prog } from "./anim";

// Local: 0-300 (10s). A: 0-120 · B: 120-210 · C: 210-300
const TicketsBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    {
      kind: "fuel" as const,
      name: "Gasolina",
      total: "$850.00",
      tilt: -5,
      x: 0,
    },
    { kind: "toll" as const, name: "Casetas", total: "$214.00", tilt: 4, x: 0 },
    {
      kind: "food" as const,
      name: "Comidas",
      total: "$432.00",
      tilt: -3,
      x: 0,
    },
  ];
  return (
    <SceneFade duration={120}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Title
          size={84}
          style={{
            opacity: prog(frame, 0, 16),
            translate: `0px ${(1 - prog(frame, 0, 16)) * 30}px`,
          }}
        >
          Tickets que <Hl color={theme.danger}>no son factura</Hl>
        </Title>
        <div
          style={{
            position: "relative",
            marginTop: 70,
            width: 1000,
            height: 1000,
          }}
        >
          {items.map((it, i) => {
            const s = 14 + i * 14;
            const p = prog(frame, s, s + 22);
            const stampP = prog(frame, 56 + i * 12, 64 + i * 12);
            const row = i;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: row * 330,
                  left: i % 2 === 0 ? 40 : 300,
                  display: "flex",
                  alignItems: "center",
                  gap: 34,
                  flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                  opacity: p,
                  translate: `${(i % 2 === 0 ? -1 : 1) * (1 - p) * 300}px 0px`,
                }}
              >
                <div
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 40,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(25,242,216,0.08)",
                    border: `2px solid ${theme.teal}66`,
                  }}
                >
                  <Icon kind={it.kind} size={86} />
                </div>
                <div style={{ position: "relative" }}>
                  <Ticket
                    width={380}
                    title={it.name.toUpperCase()}
                    lines={[["Consumo", it.total]]}
                    total={it.total}
                    tilt={it.tilt}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: -10,
                      top: 40,
                      opacity: stampP,
                      scale: String(1.8 - stampP * 0.8),
                      rotate: "-12deg",
                      border: `6px solid ${theme.danger}`,
                      color: theme.danger,
                      borderRadius: 12,
                      padding: "2px 16px",
                      fontFamily: FONT,
                      fontWeight: 800,
                      fontSize: 34,
                      background: "rgba(3,8,13,0.7)",
                    }}
                  >
                    SIN FACTURA
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const PortalBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const mins = Math.min(10, lin(frame, 18, 80) * 10);
  const whole = Math.floor(mins);
  const secs = Math.floor((mins - whole) * 60);
  const barW = 18 + lin(frame, 10, 90) * 22; // se queda "atorada" casi sin avanzar
  return (
    <SceneFade duration={90}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Title size={84}>
          Portales <Hl color={theme.amber}>lentos</Hl>
        </Title>
        {/* ventana de navegador */}
        <div
          style={{
            marginTop: 70,
            width: 900,
            borderRadius: 30,
            overflow: "hidden",
            background: "#0B1620",
            border: `2px solid ${theme.amber}55`,
            boxShadow: `0 0 80px ${theme.amber}18`,
            opacity: prog(frame, 0, 14),
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "20px 26px",
              background: "#0F202D",
            }}
          >
            {[theme.danger, theme.amber, theme.teal].map((c) => (
              <div
                key={c}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  background: c,
                  opacity: 0.8,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 20,
                borderRadius: 14,
                background: "#07121A",
                color: theme.muted,
                fontFamily: MONO,
                fontSize: 24,
                padding: "4px 18px",
              }}
            >
              portal-facturacion.com.mx
            </div>
          </div>
          <div
            style={{
              padding: "50px 50px 60px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {["RFC", "Folio del ticket", "Monto", "Fecha"].map((l, i) => (
              <div
                key={l}
                style={{
                  height: 66,
                  borderRadius: 14,
                  background: "#122635",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 24px",
                  fontFamily: MONO,
                  fontSize: 26,
                  color: theme.muted,
                  opacity: 0.5 + 0.5 * prog(frame, 6 + i * 4, 18 + i * 4),
                }}
              >
                {l}
              </div>
            ))}
            <div
              style={{
                height: 22,
                borderRadius: 22,
                background: "#122635",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barW}%`,
                  height: "100%",
                  background: theme.amber,
                  borderRadius: 22,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: FONT,
                color: theme.amber,
                fontSize: 30,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Cargando…
              <span
                style={{
                  display: "inline-block",
                  rotate: `${frame * 14}deg`,
                  marginLeft: 12,
                }}
              >
                ◜
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            textAlign: "center",
            opacity: prog(frame, 16, 30),
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 150,
              color: theme.amber,
              textShadow: `0 0 50px ${theme.amber}66`,
            }}
          >
            {whole < 10 ? "0" + whole : whole}:{secs < 10 ? "0" + secs : secs}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 52,
              color: theme.text,
            }}
          >
            minutos por ticket
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const DeductBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const boxIn = prog(frame, 6, 26);
  const arrow = prog(frame, 26, 44);
  const cross = lin(frame, 40, 52);
  const chip = prog(frame, 52, 72);
  const pct = Math.round(lin(frame, 54, 72) * 30);
  return (
    <SceneFade duration={90}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              opacity: boxIn,
              scale: String(0.85 + boxIn * 0.15),
              padding: "30px 56px",
              borderRadius: 40,
              border: `3px solid ${theme.danger}88`,
              background: "rgba(255,92,108,0.1)",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 76,
              color: theme.text,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Gasto
            <br />
            <Hl color={theme.danger}>sin factura</Hl>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 90,
              color: theme.teal,
              opacity: arrow,
              translate: `0px ${(1 - arrow) * -30}px`,
            }}
          >
            ↓
          </div>
          <div
            style={{
              position: "relative",
              opacity: arrow,
              padding: "30px 56px",
              borderRadius: 40,
              border: `3px solid ${theme.muted}66`,
              background: "rgba(127,166,166,0.1)",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 76,
              color: theme.text,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Gasto que
            <br />
            <Hl color={theme.muted}>no se deduce</Hl>
            <div
              style={{
                position: "absolute",
                left: 30,
                top: "50%",
                height: 10,
                width: `${cross * 94}%`,
                background: theme.danger,
                borderRadius: 10,
                rotate: "-6deg",
                boxShadow: `0 0 30px ${theme.danger}`,
              }}
            />
          </div>
          <div
            style={{
              opacity: chip,
              scale: String(0.8 + chip * 0.2),
              marginTop: 36,
              padding: "26px 64px",
              borderRadius: 44,
              background: theme.danger,
              color: "#fff",
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 800,
              lineHeight: 1,
              boxShadow: `0 0 80px ${theme.danger}88`,
            }}
          >
            <div style={{ fontSize: 120 }}>hasta {pct}%</div>
            <div style={{ fontSize: 40, fontWeight: 600, marginTop: 8 }}>
              de impuestos extra
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const SceneProblem: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}>
      <TicketsBeat />
    </Sequence>
    <Sequence from={120} durationInFrames={90}>
      <PortalBeat />
    </Sequence>
    <Sequence from={210} durationInFrames={90}>
      <DeductBeat />
    </Sequence>
  </AbsoluteFill>
);
