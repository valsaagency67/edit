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
    <SceneFade duration={135}>
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
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const DeductibleBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { icon: "fuel" as const, name: "Gasolina", amt: "$850.00" },
    { icon: "toll" as const, name: "Casetas", amt: "$214.00" },
    { icon: "food" as const, name: "Comidas", amt: "$432.00" },
  ];
  return (
    <SceneFade duration={105} fadeIn={8} fadeOut={6}>
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
            marginTop: 80,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            width: 900,
          }}
        >
          {rows.map((r, i) => {
            const s = 14 + i * 12;
            const p = prog(frame, s, s + 18);
            const ok = prog(frame, s + 24, s + 36);
            return (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "28px 36px",
                  borderRadius: 34,
                  background: `rgba(134,227,204,${0.05 + ok * 0.1})`,
                  border: `2px solid rgba(134,227,204,${0.2 + ok * 0.6})`,
                  opacity: p,
                  translate: `${(1 - p) * 200}px 0px`,
                  boxShadow: ok > 0.5 ? `0 0 50px ${theme.teal}33` : "none",
                }}
              >
                <Icon kind={r.icon} size={74} />
                <div
                  style={{
                    flex: 1,
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 52,
                    color: theme.text,
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 40,
                    color: theme.muted,
                  }}
                >
                  {r.amt}
                </div>
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 82,
                    display: "grid",
                    placeItems: "center",
                    background: theme.teal,
                    scale: String(ok),
                    opacity: ok,
                  }}
                >
                  <Icon kind="check" size={50} color="#03141A" />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const SceneResult: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={135}>
      <TimeBeat />
    </Sequence>
    <Sequence from={135} durationInFrames={105}>
      <DeductibleBeat />
    </Sequence>
  </AbsoluteFill>
);
