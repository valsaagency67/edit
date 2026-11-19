import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TheBoldFont } from "../load-font";
import { COLORS, Scene, wordFrame } from "./timeline";

const usePop = (start: number, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - start,
    fps,
    config: { damping, stiffness: 170 },
  });
};

const Pop: React.FC<{
  at: number;
  x: number;
  y: number;
  children: React.ReactNode;
  rotate?: number;
  from?: "scale" | "left" | "right" | "up";
}> = ({ at, x, y, children, rotate = 0, from = "scale" }) => {
  const p = usePop(at);
  const frame = useCurrentFrame();
  const float = Math.sin((frame + x) / 14) * 6;
  let t = `scale(${p})`;
  if (from === "left") t = `translateX(${(1 - p) * -700}px)`;
  if (from === "right") t = `translateX(${(1 - p) * 700}px)`;
  if (from === "up")
    t = `translateY(${(1 - p) * 400}px) scale(${0.5 + 0.5 * p})`;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        transform: `translate(-50%, -50%) ${t} rotate(${rotate}deg)`,
        opacity: Math.min(1, Math.max(0, p * 1.5)),
      }}
    >
      {children}
    </div>
  );
};

const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  dark?: boolean;
}> = ({ children, color = COLORS.orange, size = 46, dark }) => (
  <div
    style={{
      fontFamily: TheBoldFont,
      fontSize: size,
      background: color,
      color: dark ? COLORS.ink : "white",
      padding: "12px 26px 6px",
      borderRadius: 14,
      border: `5px solid ${COLORS.ink}`,
      boxShadow: `0 8px 0 ${COLORS.ink}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Card: React.FC<{
  w: number;
  h?: number;
  children: React.ReactNode;
  bg?: string;
}> = ({ w, h, children, bg = "#fff7ec" }) => (
  <div
    style={{
      width: w,
      height: h,
      background: bg,
      borderRadius: 26,
      border: `6px solid ${COLORS.ink}`,
      boxShadow: `0 14px 0 ${COLORS.ink}`,
      padding: 26,
      boxSizing: "border-box",
      fontFamily: TheBoldFont,
      color: COLORS.ink,
    }}
  >
    {children}
  </div>
);

const Gamepad: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 260 170">
    <path
      d="M30 40 Q 30 10 65 10 L 195 10 Q 230 10 230 40 L 252 140 Q 256 168 222 166 Q 200 164 185 140 L 75 140 Q 60 164 38 166 Q 4 168 8 140 Z"
      fill="#f4f0ff"
      stroke={COLORS.ink}
      strokeWidth={8}
    />
    <rect x={50} y={70} width={44} height={14} rx={4} fill={COLORS.ink} />
    <rect x={65} y={55} width={14} height={44} rx={4} fill={COLORS.ink} />
    <circle
      cx={190}
      cy={60}
      r={11}
      fill={COLORS.cyan}
      stroke={COLORS.ink}
      strokeWidth={4}
    />
    <circle
      cx={212}
      cy={82}
      r={11}
      fill={COLORS.pink}
      stroke={COLORS.ink}
      strokeWidth={4}
    />
    <circle
      cx={168}
      cy={82}
      r={11}
      fill="#ffe14d"
      stroke={COLORS.ink}
      strokeWidth={4}
    />
  </svg>
);

const Phone: React.FC<{ w: number; children?: React.ReactNode }> = ({
  w,
  children,
}) => (
  <div
    style={{
      width: w,
      height: w * 1.9,
      borderRadius: w * 0.14,
      background: COLORS.ink,
      padding: w * 0.05,
      boxSizing: "border-box",
      boxShadow: `0 16px 0 #000, 0 0 40px ${COLORS.pink}`,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: w * 0.1,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, #6a1458, ${COLORS.orangeDeep})`,
      }}
    >
      {children}
    </div>
  </div>
);

const Check: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <svg width={size} height={size} viewBox="0 0 70 70">
    <circle
      cx={35}
      cy={35}
      r={32}
      fill="#3ddc6a"
      stroke={COLORS.ink}
      strokeWidth={5}
    />
    <path
      d="M20 36 L 31 47 L 51 24"
      stroke="white"
      strokeWidth={8}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- scenes ---------- */

const HookVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const swap = wordFrame(s, "tambien");
  const arrow = usePop(swap - 4);
  const count = Math.floor(
    interpolate(frame, [swap, swap + 40], [0, 128450], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <>
      <Pop at={4} x={260} y={820} rotate={-8}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Gamepad size={300} />
          <Tag color="white" dark>
            Jugar
          </Tag>
        </div>
      </Pop>
      <div
        style={{
          position: "absolute",
          left: 455,
          top: 760,
          fontFamily: TheBoldFont,
          fontSize: 140,
          color: COLORS.orange,
          WebkitTextStroke: `5px ${COLORS.ink}`,
          transform: `scale(${arrow}) translateX(${Math.sin(frame / 4) * 10}px)`,
        }}
      >
        →
      </div>
      <Pop at={swap} x={820} y={800} rotate={6}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Phone w={210}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={110} height={110} viewBox="0 0 100 100">
                <circle cx={50} cy={50} r={46} fill="white" opacity={0.9} />
                <path d="M40 30 L 72 50 L 40 70 Z" fill={COLORS.pink} />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                width: "100%",
                textAlign: "center",
                fontFamily: TheBoldFont,
                fontSize: 30,
                color: "white",
              }}
            >
              {count.toLocaleString("es-CO")}
            </div>
          </Phone>
          <Tag>Crear</Tag>
        </div>
      </Pop>
    </>
  );
};

const PhoneVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const start = wordFrame(s, "crecer");
  const followers = Math.floor(
    interpolate(frame, [start, start + 60], [120, 48700], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const five = wordFrame(s, "cinco");
  return (
    <>
      <Pop at={2} x={540} y={760} from="up">
        <Phone w={300}>
          <div
            style={{
              position: "absolute",
              top: 30,
              width: "100%",
              textAlign: "center",
              fontFamily: TheBoldFont,
              color: "white",
              fontSize: 34,
            }}
          >
            SEGUIDORES
          </div>
          <div
            style={{
              position: "absolute",
              top: 80,
              width: "100%",
              textAlign: "center",
              fontFamily: TheBoldFont,
              color: "white",
              fontSize: 64,
            }}
          >
            {followers.toLocaleString("es-CO")}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 30,
              right: 30,
              height: 200,
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            {[0.2, 0.35, 0.3, 0.55, 0.7, 0.95].map((h, i) => {
              const g = interpolate(
                frame,
                [start + i * 5, start + i * 5 + 15],
                [0, h],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${g * 100}%`,
                    background: i === 5 ? COLORS.cyan : "white",
                    borderRadius: 6,
                  }}
                />
              );
            })}
          </div>
        </Phone>
      </Pop>
      {[0, 1, 2, 3].map((i) => {
        const at = start + 10 + i * 9;
        const y = interpolate(frame - at, [0, 40], [900, 560], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const o = interpolate(frame - at, [0, 5, 30, 40], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 720 + (i % 2) * 70,
              top: y,
              opacity: o,
              fontSize: 70,
            }}
          >
            <svg width={70} height={64} viewBox="0 0 70 64">
              <path
                d="M35 60 L 6 30 Q -6 10 14 4 Q 28 0 35 14 Q 42 0 56 4 Q 76 10 64 30 Z"
                fill={COLORS.pink}
                stroke={COLORS.ink}
                strokeWidth={4}
              />
            </svg>
          </div>
        );
      })}
      <Pop at={five} x={280} y={1000} rotate={-6}>
        <Tag color={COLORS.cyan} dark size={56}>
          5 pasos
        </Tag>
      </Pop>
    </>
  );
};

const TopicsVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const items = [
    { w: "trucos", label: "Trucos", icon: "🎮" },
    { w: "secretos", label: "Secretos del mapa", icon: "🗺️" },
    { w: "momentos", label: "Momentos graciosos", icon: "😂" },
  ];
  const pick = wordFrame(s, "claro");
  const chosen = usePop(pick);
  return (
    <>
      {items.map((it, i) => {
        const at = wordFrame(s, it.w);
        const selected = i === 0;
        const dim = selected ? 1 : interpolate(chosen, [0, 1], [1, 0.35]);
        return (
          <Pop
            key={it.w}
            at={at}
            x={540}
            y={640 + i * 165}
            from={i % 2 ? "right" : "left"}
          >
            <div
              style={{
                opacity: dim,
                transform: `scale(${selected ? 1 + chosen * 0.08 : 1})`,
                display: "flex",
                alignItems: "center",
                gap: 22,
                width: 760,
                background:
                  selected && chosen > 0.5 ? COLORS.orange : "#fff7ec",
                color: selected && chosen > 0.5 ? "white" : COLORS.ink,
                borderRadius: 24,
                border: `6px solid ${COLORS.ink}`,
                boxShadow: `0 10px 0 ${COLORS.ink}`,
                padding: "18px 30px 10px",
                fontFamily: TheBoldFont,
                fontSize: 58,
                textTransform: "uppercase",
              }}
            >
              <span style={{ fontSize: 64 }}>{it.icon}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {selected && chosen > 0.5 ? <Check /> : null}
            </div>
          </Pop>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1110,
          display: "flex",
          justifyContent: "center",
          opacity: chosen,
          transform: `scale(${chosen})`,
        }}
      >
        <Tag color={COLORS.cyan} dark>
          1 canal = 1 tema
        </Tag>
      </div>
    </>
  );
};

const ClipsVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const cut = wordFrame(s, "encuentre");
  const out = wordFrame(s, "clips");
  const scissorsX = interpolate(frame, [cut, cut + 25], [-100, 1180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stripShift = (frame * 6) % 140;
  const split = usePop(out - 6);
  return (
    <>
      <Pop at={4} x={540} y={640} from="left">
        <div
          style={{
            width: 1000,
            height: 170,
            background: COLORS.ink,
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
            border: `5px solid ${COLORS.ink}`,
          }}
        >
          {new Array(12).fill(0).map((_, i) => (
            <div
              key={`h${i}`}
              style={{
                position: "absolute",
                top: 8,
                left: i * 140 - stripShift + 20,
                width: 36,
                height: 18,
                background: "#fff",
                borderRadius: 4,
              }}
            />
          ))}
          {new Array(12).fill(0).map((_, i) => (
            <div
              key={`b${i}`}
              style={{
                position: "absolute",
                bottom: 8,
                left: i * 140 - stripShift + 20,
                width: 36,
                height: 18,
                background: "#fff",
                borderRadius: 4,
              }}
            />
          ))}
          {new Array(9).fill(0).map((_, i) => {
            const hot = i === 2 || i === 5 || i === 7;
            const lit = frame > cut + i * 3;
            return (
              <div
                key={`f${i}`}
                style={{
                  position: "absolute",
                  top: 34,
                  left: i * 140 - stripShift + 10,
                  width: 120,
                  height: 100,
                  borderRadius: 8,
                  background:
                    hot && lit
                      ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink})`
                      : `linear-gradient(135deg, #3b1a6b, #6a1458)`,
                  border: hot && lit ? "5px solid #ffe14d" : "none",
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </div>
      </Pop>
      <div
        style={{
          position: "absolute",
          left: scissorsX,
          top: 560,
          fontSize: 130,
          transform: `rotate(${Math.sin(frame) * 15 - 90}deg)`,
        }}
      >
        ✂️
      </div>
      <Pop at={cut} x={540} y={520} rotate={-3}>
        <Tag color={COLORS.cyan} dark size={40}>
          IA: mejores momentos
        </Tag>
      </Pop>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 540 + (i - 1) * 260 * split - 95,
            top: 790 + (1 - split) * 200,
            opacity: split,
            transform: `rotate(${(i - 1) * 6 * split}deg)`,
          }}
        >
          <Phone w={190}>
            <div
              style={{
                position: "absolute",
                top: "35%",
                width: "100%",
                textAlign: "center",
                fontSize: 70,
              }}
            >
              {["🚗", "💥", "😂"][i]}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 16,
                right: 16,
                background: "white",
                borderRadius: 8,
                fontFamily: TheBoldFont,
                fontSize: 22,
                textAlign: "center",
                padding: "6px 0 2px",
                color: COLORS.ink,
              }}
            >
              SUBTÍTULOS
            </div>
          </Phone>
        </div>
      ))}
    </>
  );
};

const ScriptVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const rows = [
    { w: "gancho", label: "Gancho de 3 seg", color: COLORS.pink },
    { w: "datos", label: "3 datos", color: COLORS.cyan },
    { w: "cierre", label: "Cierre", color: COLORS.orange },
  ];
  return (
    <Pop at={4} x={540} y={830} rotate={-2} from="up">
      <Card w={780}>
        <div
          style={{
            fontSize: 50,
            marginBottom: 18,
            borderBottom: `5px dashed ${COLORS.ink}`,
            paddingBottom: 10,
          }}
        >
          📝 MI GUION
        </div>
        {rows.map((r, i) => {
          const at = wordFrame(s, r.w);
          const on = frame >= at;
          const p = spring({
            frame: frame - at,
            fps: 30,
            config: { damping: 9 },
          });
          return (
            <div
              key={r.w}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                margin: "18px 0",
                fontSize: 56,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  transform: `scale(${on ? p : 1})`,
                }}
              >
                {on ? (
                  <Check />
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      border: `6px solid ${COLORS.ink}`,
                      borderRadius: 14,
                    }}
                  />
                )}
              </div>
              <span>{i + 1}.</span>
              <span
                style={{
                  background: on ? r.color : "transparent",
                  padding: "6px 14px 0",
                  borderRadius: 10,
                  color: on ? "white" : "#999",
                }}
              >
                {r.label.toUpperCase()}
              </span>
            </div>
          );
        })}
      </Card>
    </Pop>
  );
};

const CalendarVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const start = wordFrame(s, "dias");
  const hour = wordFrame(s, "hora");
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const hand = interpolate(frame, [hour, hour + 20], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Pop at={3} x={540} y={760} from="up">
        <Card w={860} bg="#fff7ec">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 44,
              marginBottom: 14,
            }}
          >
            <span>📅 ESTA SEMANA</span>
            <span style={{ color: COLORS.orangeDeep }}>7/7</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {days.map((d, i) => {
              const at = start + i * 4;
              const p = spring({
                frame: frame - at,
                fps: 30,
                config: { damping: 9 },
              });
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 140,
                    borderRadius: 14,
                    border: `5px solid ${COLORS.ink}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    fontSize: 40,
                    background: frame >= at ? "#ffe8cc" : "white",
                  }}
                >
                  <span>{d}</span>
                  <div style={{ transform: `scale(${Math.max(0, p)})` }}>
                    <Check size={58} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Pop>
      <Pop at={hour} x={540} y={1060}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle
              cx={60}
              cy={60}
              r={52}
              fill="white"
              stroke={COLORS.ink}
              strokeWidth={8}
            />
            <line
              x1={60}
              y1={60}
              x2={60}
              y2={28}
              stroke={COLORS.ink}
              strokeWidth={8}
              strokeLinecap="round"
              transform={`rotate(${hand} 60 60)`}
            />
            <line
              x1={60}
              y1={60}
              x2={84}
              y2={60}
              stroke={COLORS.pink}
              strokeWidth={8}
              strokeLinecap="round"
            />
          </svg>
          <Tag color={COLORS.cyan} dark>
            Misma hora
          </Tag>
        </div>
      </Pop>
    </>
  );
};

const CommentsVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const qs = [
    "¿Cuál es el carro más rápido?",
    "¿Cómo gano dinero rápido?",
    "¡Haz parte 2! 🔥",
  ];
  const base = wordFrame(s, "comentarios");
  const idea = wordFrame(s, "idea");
  const bulb = usePop(idea);
  return (
    <>
      {qs.map((q, i) => (
        <Pop
          key={q}
          at={base + i * 7}
          x={i % 2 ? 600 : 480}
          y={600 + i * 150}
          from={i % 2 ? "right" : "left"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                background: [COLORS.pink, COLORS.cyan, "#ffe14d"][i],
                border: `5px solid ${COLORS.ink}`,
              }}
            />
            <div
              style={{
                background: "white",
                color: COLORS.ink,
                fontFamily: TheBoldFont,
                fontSize: 42,
                padding: "16px 26px 8px",
                borderRadius: 24,
                border: `5px solid ${COLORS.ink}`,
                boxShadow: `0 8px 0 ${COLORS.ink}`,
                whiteSpace: "nowrap",
              }}
            >
              {q.toUpperCase()}
            </div>
          </div>
        </Pop>
      ))}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1060,
          transform: `translate(-50%,-50%) scale(${bulb})`,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            fontSize: 100,
            filter: `drop-shadow(0 0 ${20 + Math.sin(frame / 3) * 10}px #ffe14d)`,
          }}
        >
          💡
        </span>
        <Tag>Próximo video</Tag>
      </div>
    </>
  );
};

const WarningVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const x = wordFrame(s, "vendas");
  const cross = usePop(x - 6, 8);
  const shake = frame < 10 ? Math.sin(frame * 3) * 12 : 0;
  return (
    <>
      <Pop at={0} x={540} y={720}>
        <svg
          width={320}
          height={290}
          viewBox="0 0 320 290"
          style={{ transform: `translateX(${shake}px)` }}
        >
          <path
            d="M160 14 L 306 270 L 14 270 Z"
            fill="#ffe14d"
            stroke={COLORS.ink}
            strokeWidth={14}
            strokeLinejoin="round"
          />
          <rect
            x={146}
            y={90}
            width={28}
            height={110}
            rx={12}
            fill={COLORS.ink}
          />
          <circle cx={160} cy={234} r={18} fill={COLORS.ink} />
        </svg>
      </Pop>
      <Pop at={wordFrame(s, "logo")} x={540} y={1030}>
        <div style={{ position: "relative", display: "flex", gap: 30 }}>
          <Tag color="white" dark size={52}>
            © Logo
          </Tag>
          <Tag color="white" dark size={52}>
            © Personajes
          </Tag>
          <svg
            width={760}
            height={150}
            viewBox="0 0 760 150"
            style={{
              position: "absolute",
              left: -40,
              top: -30,
              transform: `scale(${cross})`,
            }}
          >
            <line
              x1={20}
              y1={20}
              x2={740}
              y2={130}
              stroke="#ff2a2a"
              strokeWidth={22}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Pop>
    </>
  );
};

const CtaVisual: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const typed = "GTA".slice(0, Math.max(0, Math.floor((frame - 8) / 5)));
  const send = wordFrame(s, "lista");
  const card = usePop(send);
  const pulse = 1 + Math.sin(frame / 4) * 0.04;
  return (
    <>
      <Pop at={2} x={540} y={640} from="up">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            width: 860,
            background: "white",
            borderRadius: 60,
            border: `6px solid ${COLORS.ink}`,
            boxShadow: `0 10px 0 ${COLORS.ink}`,
            padding: "18px 22px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: COLORS.orange,
              border: `5px solid ${COLORS.ink}`,
            }}
          />
          <div
            style={{
              flex: 1,
              fontFamily: TheBoldFont,
              fontSize: 64,
              color: COLORS.ink,
              paddingTop: 8,
            }}
          >
            {typed}
            <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
          </div>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              background: COLORS.pink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${pulse})`,
            }}
          >
            <svg width={50} height={50} viewBox="0 0 50 50">
              <path d="M6 25 L 44 8 L 30 44 L 24 28 Z" fill="white" />
            </svg>
          </div>
        </div>
      </Pop>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 930,
          transform: `translate(-50%,-50%) scale(${card}) rotate(${-3 + Math.sin(frame / 12) * 2}deg)`,
        }}
      >
        <Card w={640}>
          <div style={{ fontSize: 52, color: COLORS.orangeDeep }}>
            🧰 LISTA DE HERRAMIENTAS
          </div>
          <div style={{ fontSize: 38, marginTop: 14, lineHeight: 1.4 }}>
            ✓ CLIPS CON IA
            <br />✓ GUIONES CON IA
            <br />✓ SUBTÍTULOS AUTOMÁTICOS
          </div>
        </Card>
      </div>
    </>
  );
};

export const Visual: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.visual) {
    case "hook":
      return <HookVisual s={scene} />;
    case "phone":
      return <PhoneVisual s={scene} />;
    case "topics":
      return <TopicsVisual s={scene} />;
    case "clips":
      return <ClipsVisual s={scene} />;
    case "script":
      return <ScriptVisual s={scene} />;
    case "calendar":
      return <CalendarVisual s={scene} />;
    case "comments":
      return <CommentsVisual s={scene} />;
    case "warning":
      return <WarningVisual s={scene} />;
    case "cta":
      return <CtaVisual s={scene} />;
    default:
      return null;
  }
};
