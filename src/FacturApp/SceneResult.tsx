import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Hl, Icon, SceneFade, Title } from "./parts";
import { FONT, MONO, theme } from "./theme";
import { lin, prog } from "./anim";

const TimeBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(lin(frame, 14, 50) * 10);
  const sub = prog(frame, 70, 90);
  return (
    <SceneFade duration={120}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        {/* contador grande */}
        <div style={{ textAlign: "center", opacity: prog(frame, 0, 14) }}>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 280,
              lineHeight: 1,
              color: theme.teal,
              textShadow: `0 0 90px ${theme.teal}88`,
              scale: String(0.85 + prog(frame, 0, 24) * 0.15),
            }}
          >
            {count}
          </div>
          <Title size={110} style={{ marginTop: 6 }}>
            segundos
          </Title>
        </div>
        {/* barras comparativas */}
        <div
          style={{
            width: 900,
            marginTop: 80,
            display: "flex",
            flexDirection: "column",
            gap: 44,
          }}
        >
          <div style={{ opacity: prog(frame, 40, 56) }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 38,
                color: theme.teal,
                marginBottom: 12,
              }}
            >
              Con FacturApp · 10 seg
            </div>
            <div
              style={{ height: 54, borderRadius: 30, background: "#0E2230" }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${prog(frame, 44, 62) * 4}%`,
                  minWidth: prog(frame, 44, 62) * 40,
                  borderRadius: 30,
                  background: theme.teal,
                  boxShadow: `0 0 40px ${theme.teal}`,
                }}
              />
            </div>
          </div>
          <div style={{ opacity: prog(frame, 60, 76) }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 38,
                color: theme.amber,
                marginBottom: 12,
              }}
            >
              Haciéndolo a mano · 10 min
            </div>
            <div
              style={{ height: 54, borderRadius: 30, background: "#0E2230" }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${prog(frame, 64, 120) * 100}%`,
                  borderRadius: 30,
                  background: theme.amber,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            opacity: sub,
            translate: `0px ${(1 - sub) * 20}px`,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 56,
            color: theme.text,
            textAlign: "center",
          }}
        >
          en lugar de <Hl color={theme.amber}>10 minutos</Hl>
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              color: theme.muted,
              marginTop: 10,
            }}
          >
            por ticket · y son decenas o cientos al mes
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const DeductibleBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const c1 = prog(frame, 14, 32);
  const c2 = prog(frame, 40, 58);
  const save = prog(frame, 70, 90);
  const card = (bad: boolean): React.CSSProperties => ({
    width: 900,
    borderRadius: 40,
    padding: "34px 44px",
    border: `3px solid ${bad ? theme.danger + "88" : theme.teal}`,
    background: bad ? "rgba(255,92,108,0.1)" : "rgba(25,242,216,0.12)",
    boxShadow: bad ? "none" : `0 0 70px ${theme.teal}33`,
  });
  return (
    <SceneFade duration={120} fadeIn={8} fadeOut={6}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Title
          size={96}
          style={{
            opacity: prog(frame, 0, 14),
            translate: `0px ${(1 - prog(frame, 0, 14)) * 30}px`,
          }}
        >
          Más gastos
          <br />
          <Hl>deducibles</Hl>
        </Title>
        <div
          style={{
            marginTop: 70,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              ...card(true),
              opacity: c1,
              translate: `${(1 - c1) * 200}px 0px`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 36,
                color: theme.muted,
              }}
            >
              Sin FacturApp · $100,000 sin factura
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 76,
                color: theme.danger,
              }}
            >
              $30,000 de impuesto extra
            </div>
          </div>
          <div
            style={{
              ...card(false),
              opacity: c2,
              translate: `${(1 - c2) * 200}px 0px`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 36,
                    color: theme.teal,
                  }}
                >
                  Con FacturApp · $100,000 facturados
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 76,
                    color: theme.text,
                  }}
                >
                  Todo deducible
                </div>
              </div>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                  display: "grid",
                  placeItems: "center",
                  background: theme.teal,
                  scale: String(prog(frame, 52, 66)),
                }}
              >
                <Icon kind="check" size={62} color="#03141A" />
              </div>
            </div>
          </div>
          <div
            style={{
              opacity: save,
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 46,
              color: theme.text,
            }}
          >
            Ahorras hasta <Hl>$30,000</Hl> por cada $100,000
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const SceneResult: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}>
      <TimeBeat />
    </Sequence>
    <Sequence from={120} durationInFrames={120}>
      <DeductibleBeat />
    </Sequence>
  </AbsoluteFill>
);
