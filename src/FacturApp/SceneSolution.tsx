import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { Hl, Icon, SceneFade, Ticket, Title } from "./parts";
import { FONT, MONO, theme } from "./theme";
import { lin, prog, rand } from "./anim";

const GAS = {
  title: "GASOLINERA DEL SUR",
  lines: [
    ["Magna 32.4 L", "$850.00"],
    ["IVA incluido", ""],
  ] as [string, string][],
  total: "$850.00",
};

/* ───────── A · Toma una foto (local 0-120) ───────── */
const PhotoBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = frame >= 62 && frame < 70 ? 1 - (frame - 62) / 8 : 0;
  const scan = lin(frame, 18, 60);
  const captured = prog(frame, 66, 90);
  return (
    <SceneFade duration={120}>
      <Sequence from={62} durationInFrames={20} layout="none">
        <Audio src={staticFile("facturapp/shutter.mp3")} volume={0.8} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Title
          size={86}
          style={{
            opacity: prog(frame, 0, 14),
            translate: `0px ${(1 - prog(frame, 0, 14)) * 30}px`,
          }}
        >
          Toma una <Hl>foto</Hl>
        </Title>
        <div
          style={{
            position: "relative",
            marginTop: 60,
            width: 560,
            height: 1020,
            borderRadius: 74,
            border: `6px solid #1E3442`,
            background: "#050D13",
            boxShadow: `0 0 120px rgba(168,197,188,0.18), inset 0 0 60px rgba(168,197,188,0.06)`,
            overflow: "hidden",
            scale: String(0.9 + prog(frame, 0, 24) * 0.1),
            opacity: prog(frame, 0, 12),
          }}
        >
          {/* notch */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              translate: "-50% 0",
              width: 150,
              height: 34,
              borderRadius: 20,
              background: "#000",
              zIndex: 5,
            }}
          />
          {/* ticket en cámara */}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 220 + (1 - prog(frame, 0, 26)) * 80,
              scale: String(1 - captured * 0.0),
              rotate: `${-4 + prog(frame, 0, 40) * 4}deg`,
            }}
          >
            <Ticket width={400} {...GAS} />
          </div>
          {/* visor */}
          {[
            { l: 54, t: 150, r: 0 },
            { l: 456, t: 150, r: 90 },
            { l: 456, t: 760, r: 180 },
            { l: 54, t: 760, r: 270 },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c.l - 30,
                top: c.t,
                width: 70,
                height: 70,
                borderLeft: `7px solid ${theme.teal}`,
                borderTop: `7px solid ${theme.teal}`,
                borderTopLeftRadius: 18,
                rotate: `${c.r}deg`,
                opacity: prog(frame, 8 + i * 3, 20 + i * 3),
                boxShadow: `-6px -6px 24px ${theme.teal}55`,
              }}
            />
          ))}
          {/* láser de escaneo */}
          {scan > 0 && scan < 1 ? (
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: 170 + scan * 620,
                height: 6,
                borderRadius: 6,
                background: theme.teal,
                boxShadow: `0 0 40px 10px ${theme.teal}88`,
              }}
            />
          ) : null}
          {/* botón de disparo */}
          <div
            style={{
              position: "absolute",
              bottom: 54,
              left: "50%",
              translate: "-50% 0",
              width: 120,
              height: 120,
              borderRadius: 120,
              border: `6px solid ${theme.text}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                width: 88 - (frame >= 60 && frame < 72 ? 14 : 0),
                height: 88 - (frame >= 60 && frame < 72 ? 14 : 0),
                borderRadius: 100,
                background: theme.text,
              }}
            />
          </div>
          {/* flash */}
          <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.9 }} />
          {/* capturado */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 92,
              translate: "-50% 0",
              opacity: captured,
              scale: String(0.7 + captured * 0.3),
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 24px",
              borderRadius: 40,
              background: theme.teal,
              color: "#03141A",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 30,
              zIndex: 6,
            }}
          >
            <Icon kind="check" size={34} color="#03141A" /> Ticket capturado
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ───────── B · Envío por app o WhatsApp (local 0-90) ───────── */
const Core: React.FC<{ size?: number; pulse?: number }> = ({
  size = 260,
  pulse = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[1, 1.35, 1.7].map((k, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: (size * (1 - k)) / 2,
            borderRadius: "50%",
            border: `2px ${i === 1 ? "dashed" : "solid"} ${theme.teal}${i === 0 ? "aa" : "44"}`,
            rotate: `${(i % 2 ? -1 : 1) * frame * (1.2 + i)}deg`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: size * 0.14,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #E8F0ED, ${theme.teal} 35%, ${theme.tealDeep} 80%)`,
          boxShadow: `0 0 ${80 * pulse + Math.sin(frame / 5) * 20}px ${theme.teal}99`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size * 0.3,
            color: "#03141A",
            letterSpacing: -2,
          }}
        >
          IA
        </div>
      </div>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (frame * 2.4 + i * 72) * (Math.PI / 180);
        const r = size * 0.85;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size / 2 + Math.cos(a) * r - 7,
              top: size / 2 + Math.sin(a) * r - 7,
              width: 14,
              height: 14,
              borderRadius: 14,
              background: theme.text,
              boxShadow: `0 0 20px ${theme.teal}`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

const SendBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const fly = prog(frame, 16, 66);
  const chipsIn = prog(frame, 4, 24);
  return (
    <SceneFade duration={90}>
      <Sequence from={14} durationInFrames={30} layout="none">
        <Audio src={staticFile("facturapp/whoosh.mp3")} volume={0.5} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Title size={80} style={{ opacity: prog(frame, 0, 14) }}>
          Por <Hl>app</Hl> o por <Hl color={theme.whatsapp}>WhatsApp</Hl>
        </Title>
        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 56,
            opacity: chipsIn,
            translate: `0px ${(1 - chipsIn) * 30}px`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 34px",
              borderRadius: 60,
              border: `3px solid ${theme.teal}`,
              background: "rgba(168,197,188,0.1)",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 40,
              color: theme.text,
            }}
          >
            <Icon kind="phone" size={48} /> App
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 34px",
              borderRadius: 60,
              border: `3px solid ${theme.whatsapp}`,
              background: "rgba(37,211,102,0.12)",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 40,
              color: theme.text,
            }}
          >
            <Icon kind="chat" size={48} color={theme.whatsapp} /> WhatsApp
          </div>
        </div>
        {/* trayecto foto → IA */}
        <div
          style={{
            position: "relative",
            width: 900,
            height: 900,
            marginTop: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 320,
              top: 470,
              opacity: prog(frame, 0, 20),
              scale: String(0.9 + prog(frame, 0, 30) * 0.1),
            }}
          >
            <Core pulse={1 + fly * 0.5} />
          </div>
          {/* ticket miniatura */}
          <div
            style={{
              position: "absolute",
              left: 40 + fly * 330,
              top: 60 + fly * 480,
              scale: String(0.55 - fly * 0.28),
              opacity: 1 - lin(frame, 58, 70),
              rotate: `${-8 + fly * 14}deg`,
              transformOrigin: "0 0",
            }}
          >
            <Ticket width={360} {...GAS} />
          </div>
          {/* estela */}
          {new Array(8).fill(0).map((_, i) => {
            const q = Math.max(0, fly - i * 0.045);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 140 + q * 330,
                  top: 140 + q * 480,
                  width: 18 - i,
                  height: 18 - i,
                  borderRadius: 20,
                  background: theme.teal,
                  opacity: fly > 0 && fly < 1 ? 0.7 - i * 0.08 : 0,
                  boxShadow: `0 0 20px ${theme.teal}`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ───────── C · El agente trabaja (local 0-150) ───────── */
const MODES = [
  { icon: "globe" as const, label: "Entra a portales" },
  { icon: "pen" as const, label: "Escribe" },
  { icon: "phone" as const, label: "Llama al comercio" },
];

const typed = (s: string, frame: number, from: number, speed = 0.9) =>
  s.slice(0, Math.max(0, Math.floor((frame - from) * speed)));

const AgentBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const mode = Math.min(2, Math.floor(frame / 50));
  const f = frame - mode * 50;
  return (
    <SceneFade duration={150} fadeOut={6}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ opacity: prog(frame, 0, 14) }}>
          <Title size={74}>
            Un <Hl>agente de IA</Hl> lo factura
          </Title>
        </div>
        <div style={{ marginTop: 90 }}>
          <Core size={250} pulse={1.3} />
        </div>
        {/* modos */}
        <div style={{ display: "flex", gap: 20, marginTop: 120 }}>
          {MODES.map((m, i) => {
            const on = i === mode;
            return (
              <div
                key={m.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 24px",
                  borderRadius: 50,
                  border: `2px solid ${on ? theme.teal : "#1E3442"}`,
                  background: on
                    ? "rgba(168,197,188,0.16)"
                    : "rgba(10,24,34,0.6)",
                  color: on ? theme.text : theme.muted,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 30,
                  boxShadow: on ? `0 0 40px ${theme.teal}44` : "none",
                }}
              >
                <Icon
                  kind={m.icon}
                  size={38}
                  color={on ? theme.teal : theme.muted}
                />{" "}
                {m.label}
              </div>
            );
          })}
        </div>
        {/* panel de acción */}
        <div
          key={mode}
          style={{
            marginTop: 40,
            width: 880,
            height: 330,
            borderRadius: 34,
            background: "#0A1822",
            border: `2px solid ${theme.teal}44`,
            padding: 36,
            opacity: prog(f, 0, 8),
            translate: `0px ${(1 - prog(f, 0, 10)) * 24}px`,
            fontFamily: MONO,
            fontSize: 32,
            color: theme.text,
            overflow: "hidden",
          }}
        >
          {mode === 0 && (
            <>
              <div style={{ color: theme.muted }}>
                &gt; abriendo portal del comercio…
              </div>
              <div
                style={{
                  marginTop: 18,
                  padding: "12px 20px",
                  borderRadius: 14,
                  background: "#07121A",
                  color: theme.teal,
                }}
              >
                {typed("https://facturacion.comercio.mx", f, 4, 1.4)}
                <span style={{ opacity: Math.floor(frame / 8) % 2 }}>▌</span>
              </div>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {["Folio", "Monto", "RFC"].map((l, i) => (
                  <div
                    key={l}
                    style={{
                      height: 34,
                      borderRadius: 10,
                      background: "#122635",
                      width: `${lin(f, 16 + i * 8, 30 + i * 8) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {mode === 1 && (
            <>
              <div style={{ color: theme.muted }}>
                &gt; capturando datos del ticket…
              </div>
              {[
                ["Folio", "A-10482"],
                ["Monto", "$850.00"],
                ["Fecha", "12/11/2026"],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  style={{ marginTop: 16, display: "flex", gap: 20 }}
                >
                  <span style={{ width: 150, color: theme.muted }}>{k}</span>
                  <span style={{ color: theme.teal }}>
                    {typed(v, f, 6 + i * 10, 0.8)}
                  </span>
                </div>
              ))}
            </>
          )}
          {mode === 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 100,
                  background: "rgba(168,197,188,0.14)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: `0 0 ${30 + Math.sin(frame / 3) * 14}px ${theme.teal}66`,
                }}
              >
                <Icon kind="phone" size={70} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38 }}
                >
                  Llamando al comercio…
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    height: 80,
                    marginTop: 8,
                  }}
                >
                  {new Array(26).fill(0).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 12,
                        borderRadius: 8,
                        background: theme.teal,
                        height:
                          14 +
                          Math.abs(Math.sin(frame / 4 + i * 0.7)) *
                            56 *
                            (0.4 + rand(i + 2) * 0.6),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ───────── D · Foto → factura (local 0-90) ───────── */
const Invoice: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      borderRadius: 22,
      overflow: "hidden",
      background: "#FFFFFF",
      color: theme.ink,
      fontFamily: FONT,
      boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 80px ${theme.teal}44`,
    }}
  >
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.teal}, ${theme.tealDeep})`,
        padding: "26px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#03141A",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 40, letterSpacing: 1 }}>
        FACTURA
      </span>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 }}>
        Folio A-10482
      </span>
    </div>
    <div style={{ padding: "26px 32px 34px", fontSize: 24 }}>
      {[
        ["Concepto", "Combustible"],
        ["Subtotal", "$732.76"],
        ["IVA 16%", "$117.24"],
      ].map(([a, b]) => (
        <div
          key={a}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid #E3EBEB",
            fontWeight: 500,
          }}
        >
          <span style={{ color: "#5A7070" }}>{a}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700 }}>{b}</span>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 18,
          fontWeight: 700,
          fontSize: 36,
        }}
      >
        <span>Total</span>
        <span style={{ fontFamily: MONO, color: theme.tealDeep }}>$850.00</span>
      </div>
    </div>
  </div>
);

const MorphBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = prog(frame, 12, 56);
  const done = prog(frame, 56, 72);
  const W = 540;
  return (
    <SceneFade duration={90} fadeIn={6} fadeOut={8}>
      <Sequence from={54} durationInFrames={50} layout="none">
        <Audio src={staticFile("facturapp/success.mp3")} volume={0.7} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Title size={86} style={{ opacity: prog(frame, 0, 14) }}>
          De foto a <Hl>factura</Hl>
        </Title>
        <div
          style={{
            position: "relative",
            marginTop: 90,
            width: W,
            height: 700,
            scale: String(1 + done * 0.04),
          }}
        >
          {/* ticket (abajo) */}
          <div style={{ position: "absolute", left: 0, top: 40, opacity: 1 }}>
            <Ticket width={W} {...GAS} />
          </div>
          {/* factura (arriba, revelada con clip) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              clipPath: `inset(0 0 ${100 - sweep * 100}% 0)`,
            }}
          >
            <Invoice width={W} />
          </div>
          {/* línea de barrido */}
          {sweep > 0 && sweep < 1 ? (
            <div
              style={{
                position: "absolute",
                left: -40,
                right: -40,
                top: sweep * 470,
                height: 8,
                borderRadius: 8,
                background: theme.teal,
                boxShadow: `0 0 60px 16px ${theme.teal}99`,
              }}
            />
          ) : null}
          {/* partículas al terminar */}
          {new Array(18).fill(0).map((_, i) => {
            const p = lin(frame, 56, 86);
            const a = (i / 18) * Math.PI * 2;
            const d = 280 + rand(i) * 140;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: W / 2 + Math.cos(a) * d * p - 6,
                  top: 240 + Math.sin(a) * d * p - 6,
                  width: 12,
                  height: 12,
                  borderRadius: 12,
                  background: i % 3 ? theme.teal : theme.text,
                  opacity: p > 0 ? 1 - p : 0,
                }}
              />
            );
          })}
        </div>
        {/* sello */}
        <div
          style={{
            marginTop: 30,
            opacity: done,
            scale: String(1.5 - done * 0.5),
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 40px",
            borderRadius: 60,
            background: theme.teal,
            color: "#03141A",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 54,
            boxShadow: `0 0 70px ${theme.teal}88`,
          }}
        >
          <Icon kind="check" size={56} color="#03141A" /> ¡Facturado!
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const SceneSolution: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}>
      <PhotoBeat />
    </Sequence>
    <Sequence from={120} durationInFrames={90}>
      <SendBeat />
    </Sequence>
    <Sequence from={210} durationInFrames={150}>
      <AgentBeat />
    </Sequence>
    <Sequence from={360} durationInFrames={90}>
      <MorphBeat />
    </Sequence>
  </AbsoluteFill>
);
