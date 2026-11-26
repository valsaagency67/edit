import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hl, Icon, Ticket } from "./parts";
import { FONT, theme } from "./theme";
import { prog, rand } from "./anim";

const WORDS: { w: string; hl?: boolean; br?: boolean }[] = [
  { w: "¿Cuántas", br: true },
  { w: "facturas", hl: true, br: true },
  { w: "pierde" },
  { w: "tu" },
  { w: "empresa", br: true },
  { w: "cada" },
  { w: "mes?" },
];

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  let t0 = 6;
  return (
    <AbsoluteFill>
      {/* tickets que se desvanecen cayendo */}
      {new Array(7).fill(0).map((_, i) => {
        const start = 8 + i * 14;
        const p = (frame - start) / 90;
        if (p < 0 || p > 1) return null;
        const x = 120 + rand(i + 3) * 780;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 110,
              top: 240 + p * 1100,
              opacity: Math.sin(p * Math.PI) * 0.55,
              scale: 0.45,
              rotate: `${(rand(i + 9) - 0.5) * 50 + p * 40}deg`,
              filter: `blur(${p * 6}px)`,
            }}
          >
            <Ticket
              width={300}
              title="TICKET"
              lines={[["Consumo", "$---"]]}
              total="$---"
            />
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            marginBottom: 50,
            scale: String(0.9 + prog(frame, 0, 20) * 0.1),
            opacity: prog(frame, 0, 14),
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 44,
              border: `3px solid ${theme.teal}`,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 0 ${50 + Math.sin(frame / 6) * 20}px ${theme.teal}55`,
              background: "rgba(168,197,188,0.08)",
            }}
          >
            <Icon kind="camera" size={84} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 28,
            width: 940,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 118,
            letterSpacing: -3,
            lineHeight: 1.08,
            color: theme.text,
            textAlign: "center",
          }}
        >
          {WORDS.map((w, i) => {
            const s = t0 + i * 6;
            const p = prog(frame, s, s + 16);
            const node = (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: p,
                  translate: `0px ${(1 - p) * 50}px`,
                  filter: `blur(${(1 - p) * 10}px)`,
                }}
              >
                {w.hl ? <Hl>{w.w}</Hl> : w.w}
              </span>
            );
            return (
              <React.Fragment key={i}>
                {node}
                {w.br ? (
                  <span style={{ flexBasis: "100%", height: 0 }} />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
