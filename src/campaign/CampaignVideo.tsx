import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Anton, Bebas, Montserrat, Playfair } from "./font";
import { Icon, IconName } from "./icons";
import raw from "./vigilante.json";

// Valores de estilo.md. La edición (cortes, subtítulos, tarjetas) la genera
// scripts/build_edl.py en vigilante.json a partir de las transcripciones.

export const FPS = 60;
const END_CARD_S = 3.5;
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const RED = "#E30613";
const YELLOW = "#FFE600";
const SHADOW = "0 4px 18px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.6)";

type Edit = typeof raw;
type Seg = Edit["segments"][number];
type Page = Edit["pages"][number];
type Card = Edit["cards"][number];
type Emph = Edit["emphasis"][number];

// vigilante.json está en frames a 60 fps. Para el borrador rápido (30 fps) se
// reescalan todos los tiempos; los planos se recalculan seguidos para no dejar huecos.
export const scaleEdit = (fps: number): Edit => {
  const k = fps / raw.fps;
  const f = (x: number) => Math.round(x * k);
  let t = 0;
  const segments = raw.segments.map((s) => {
    const trimBefore = f(s.trimBefore);
    const trimAfter = f(s.trimAfter);
    const out = { ...s, from: t, trimBefore, trimAfter };
    t += trimAfter - trimBefore;
    return out;
  });
  return {
    ...raw,
    fps,
    segments,
    clipsEnd: t,
    clips: raw.clips.map((c, i) => ({
      ...c,
      from: segments.find((s) => s.clipIndex === i)?.from ?? f(c.from),
      to: f(c.to),
    })),
    texts: raw.texts.map((x) => ({ ...x, from: f(x.from), dur: f(x.dur) })),
    cards: raw.cards.map((x) => ({ ...x, from: f(x.from), dur: f(x.dur) })),
    clicks: raw.clicks.map(f),
    emphasis: raw.emphasis.map((e) => ({
      ...e,
      from: f(e.from),
      to: f(e.to),
      lines: e.lines.map((l) => ({ ...l, from: f(l.from) })),
    })),
    pages: raw.pages.map((p) => ({
      ...p,
      from: f(p.from),
      to: f(p.to),
      words: p.words.map((w) => ({ ...w, start: f(w.start), end: f(w.end) })),
    })),
  };
};

export const durationFor = (fps: number) =>
  scaleEdit(fps).clipsEnd + Math.round(END_CARD_S * fps);

// Encuadre fijo, sin zooms ni sacudidas (pedido del cliente). El audio del video se
// silencia y se usa la voz mejorada de public/voice (scripts/enhance_voice.py), con los
// mismos recortes.
const Segment: React.FC<{ s: Seg }> = ({ s }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <OffthreadVideo
      src={staticFile(`master/${s.video}.mov`)}
      trimBefore={s.trimBefore}
      trimAfter={s.trimAfter}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: s.grayscale ? "grayscale(1) contrast(1.15)" : undefined,
      }}
    />
    <Html5Audio
      src={staticFile(`voice/${s.video}.wav`)}
      trimBefore={s.trimBefore}
      trimAfter={s.trimAfter}
    />
  </AbsoluteFill>
);

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 9], [0.85, 0], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "white", opacity: o }} />;
};

const BrandBar: React.FC<{ width: number | string; height: number }> = ({
  width,
  height,
}) => (
  <div
    style={{
      display: "flex",
      width,
      height,
      borderRadius: height / 2,
      overflow: "hidden",
    }}
  >
    {BRAND.map((c) => (
      <div key={c} style={{ flex: 1, backgroundColor: c }} />
    ))}
  </div>
);

// Firma pequeña sin recuadro, arriba a la izquierda, dentro de la zona segura 4:5
// de Instagram. Sombra oscura para que se lea sobre cualquier fondo.
const TopBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 64,
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 5,
      }}
    >
      <div
        style={{
          fontFamily: Anton,
          fontSize: 28,
          color: RED,
          lineHeight: 1,
          textShadow:
            "0 0 2px rgba(255,255,255,0.9), 0 1px 6px rgba(0,0,0,0.55)",
        }}
      >
        Juan Felipe Castaño
      </div>
      <BrandBar width={"100%"} height={4} />
    </div>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 42,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(frame / durationInFrames) * 100}%`,
          background: `linear-gradient(90deg, ${BRAND.join(",")})`,
        }}
      />
    </div>
  );
};

// Credencial pequeña debajo de la firma ("Abogado Javeriano").
const Credential: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 346,
        left: 64,
        opacity: o,
        fontFamily: Montserrat,
        fontWeight: 600,
        fontSize: 26,
        color: "white",
        textShadow: SHADOW,
      }}
    >
      {text}
    </div>
  );
};

// Subtítulo base estilo Duvalier: frase corta, sans limpia, blanca, sin caja, a ~70 %
// de la altura. Se oculta mientras hay un énfasis tipográfico en pantalla.
const BaseCaption: React.FC<{ page: Page }> = ({ page }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", top: 1160 }}
    >
      <div
        style={{
          opacity: o,
          maxWidth: 940,
          fontFamily: Montserrat,
          fontWeight: 600,
          fontSize: 72,
          lineHeight: 1.2,
          color: "white",
          textAlign: "center",
          textShadow: SHADOW,
        }}
      >
        {page.text}
      </div>
    </AbsoluteFill>
  );
};

// Tipografía cinética estilo Duvalier: cada línea aparece en su palabra (desenfoque ->
// nítido, con un clic) y se combinan sans ancha, condensada, serif cursiva y texto pequeño.
const LINE_STYLE: Record<string, React.CSSProperties> = {
  small: {
    fontFamily: Montserrat,
    fontWeight: 600,
    fontSize: 50,
    lineHeight: 1.15,
  },
  wide: {
    fontFamily: Montserrat,
    fontWeight: 900,
    fontSize: 104,
    lineHeight: 0.98,
    letterSpacing: -1,
  },
  serif: {
    fontFamily: Playfair,
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: 118,
    lineHeight: 1.0,
  },
  condensed: { fontFamily: Bebas, fontSize: 190, lineHeight: 0.9 },
};

const SelectBox: React.FC<{ text: string; age: number }> = ({ text, age }) => {
  // Efecto "texto seleccionado": la caja amarilla se abre de izquierda a derecha,
  // con manijas redondas y cursor, como en la referencia ("Buenaventura").
  const w = interpolate(age, [0, 9], [0, 100], { extrapolateRight: "clamp" });
  const handle = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: -10,
    top: side === "left" ? -34 : undefined,
    bottom: side === "right" ? -34 : undefined,
    width: 6,
    height: "calc(100% + 34px)",
    backgroundColor: YELLOW,
  });
  const dot = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: -27,
    top: side === "left" ? -54 : undefined,
    bottom: side === "right" ? -54 : undefined,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: YELLOW,
  });
  return (
    <div style={{ position: "relative", padding: "6px 30px 14px" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${w}%`,
          backgroundColor: "rgba(255,230,0,0.55)",
        }}
      />
      {w >= 100 && (
        <>
          <div style={handle("left")} />
          <div style={dot("left")} />
          <div style={handle("right")} />
          <div style={dot("right")} />
        </>
      )}
      <div
        style={{
          position: "relative",
          fontFamily: Montserrat,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: 100,
          color: "white",
          textShadow: SHADOW,
        }}
      >
        {text}
      </div>
      <svg
        width={54}
        height={64}
        viewBox="0 0 18 22"
        style={{
          position: "absolute",
          left: `${Math.min(w, 100) * 0.55}%`,
          bottom: -46,
        }}
      >
        <path
          d="M1 1 L1 17 L5.5 13 L8.5 20 L11 19 L8 12 L14 12 Z"
          fill="white"
          stroke="black"
          strokeWidth={1.2}
        />
      </svg>
    </div>
  );
};

const EmphasisView: React.FC<{ e: Emph }> = ({ e }) => {
  const frame = useCurrentFrame();
  const g = e.from + frame;
  const out = interpolate(frame, [e.to - e.from - 5, e.to - e.from], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stack = e.style === "stack";
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        top: stack ? 1180 - 960 : 1240 - 960,
        opacity: out,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 1000,
          textAlign: "center",
          gap: stack ? 6 : 0,
        }}
      >
        {e.lines.map((l, i) => {
          const age = g - l.from;
          if (age < 0) {
            return null;
          }
          if (l.font === "select") {
            return <SelectBox key={i} text={l.text} age={age} />;
          }
          const k = interpolate(age, [0, 6], [0, 1], {
            extrapolateRight: "clamp",
          });
          const base = LINE_STYLE[l.font] ?? LINE_STYLE.small;
          const size =
            stack && l.font === "condensed" ? { fontSize: 128 } : undefined;
          return (
            <div
              key={i}
              style={{
                ...base,
                ...size,
                color:
                  l.color === "yellow"
                    ? YELLOW
                    : l.color === "red"
                      ? RED
                      : "white",
                textShadow: SHADOW,
                opacity: k,
                filter: `blur(${(1 - k) * 12}px)`,
                transform: `translateY(${(1 - k) * 18}px) scale(${0.92 + 0.08 * k})`,
              }}
            >
              {l.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Tarjeta gráfica a pantalla completa (b-roll) disparada por una palabra.
const CardView: React.FC<{ card: Card }> = ({ card }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z = interpolate(
    spring({ frame, fps, config: { damping: 14 } }),
    [0, 1],
    [1.3, 1],
  );
  const out = interpolate(frame, [card.dur - 6, card.dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, #3a0508 0%, #141414 62%)`,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 470,
        gap: 50,
        opacity: out,
      }}
    >
      <div style={{ transform: `scale(${z})` }}>
        <Icon name={card.icon as IconName} size={360} />
      </div>
      <div
        style={{
          transform: `scale(${z})`,
          fontFamily: Anton,
          fontSize: 96,
          lineHeight: 1.02,
          color: "white",
          textAlign: "center",
          maxWidth: 920,
        }}
      >
        {card.text}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 12 } });
  const b = spring({ frame: frame - 12, fps, config: { damping: 10 } });
  const c = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  const pulse = 1 + Math.sin(frame / 7) * 0.04;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #ff2a36 0%, #b0000b 55%, #4a0005 100%)",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: Anton,
        color: "white",
        textAlign: "center",
        gap: 50,
      }}
    >
      <div
        style={{
          transform: `scale(${a})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 110, lineHeight: 1 }}>Juan Felipe Castaño</div>
        <div style={{ marginTop: 22 }}>
          <BrandBar width={760} height={20} />
        </div>
      </div>
      <div
        style={{
          transform: `scale(${b})`,
          fontSize: 72,
          maxWidth: 900,
          lineHeight: 1.1,
        }}
      >
        ¡Súmate a construir una Palmira mejor!
      </div>
      <div
        style={{
          transform: `scale(${c * pulse})`,
          backgroundColor: "white",
          color: RED,
          fontSize: 56,
          padding: "20px 44px",
          borderRadius: 60,
        }}
      >
        SÍGUENOS @juanfelipecastano_col
      </div>
    </AbsoluteFill>
  );
};

export const CampaignVideo: React.FC<{ fps: number }> = ({ fps }) => {
  const edit = React.useMemo(() => scaleEdit(fps), [fps]);
  const clipStarts = edit.clips.slice(1).map((c) => c.from);
  const END_CARD = Math.round(END_CARD_S * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Música de suspenso con muestras reales (scripts/make_music.py, CC-BY 3.0,
          ver CREDITOS.md), -30 LUFS: ~14 dB bajo la voz mejorada (-16 LUFS). */}
      <Html5Audio src={staticFile("music/suspenso.wav")} />
      {edit.segments.map((s, i) => (
        <Sequence
          key={i}
          from={s.from}
          durationInFrames={s.trimAfter - s.trimBefore}
          premountFor={30}
        >
          <Segment s={s} />
        </Sequence>
      ))}

      {clipStarts.map((f) => (
        <Sequence key={f} from={f} durationInFrames={10}>
          <Flash />
        </Sequence>
      ))}

      {edit.cards.map((c, i) => (
        <Sequence key={`card-${i}`} from={c.from} durationInFrames={c.dur}>
          <CardView card={c} />
        </Sequence>
      ))}

      <Sequence from={edit.clipsEnd} durationInFrames={END_CARD}>
        <Flash />
        <EndCard />
      </Sequence>

      <Sequence durationInFrames={edit.clipsEnd}>
        <TopBanner />
      </Sequence>

      {edit.texts.map((t, i) => (
        <Sequence key={`t-${i}`} from={t.from} durationInFrames={t.dur}>
          <Credential text={t.text} dur={t.dur} />
        </Sequence>
      ))}

      {edit.pages.map((p, i) => {
        // El subtítulo base se recorta donde hay énfasis o tarjeta en pantalla.
        const busy = [
          ...edit.emphasis.map((e) => [e.from, e.to]),
          ...edit.cards.map((c) => [c.from, c.from + c.dur]),
        ];
        const pieces: [number, number][] = [[p.from, p.to]];
        for (const [a, b] of busy) {
          for (let k = pieces.length - 1; k >= 0; k--) {
            const [x, y] = pieces[k];
            if (b <= x || a >= y) continue;
            pieces.splice(
              k,
              1,
              ...(
                [
                  [x, a],
                  [b, y],
                ] as [number, number][]
              ).filter(([u, v]) => v - u > 3),
            );
          }
        }
        return pieces.map(([a, b], j) => (
          <Sequence key={`p-${i}-${j}`} from={a} durationInFrames={b - a}>
            <BaseCaption page={p} />
          </Sequence>
        ));
      })}

      {edit.emphasis.map((e, i) => (
        <Sequence
          key={`e-${i}`}
          from={e.from}
          durationInFrames={Math.max(1, e.to - e.from)}
        >
          <EmphasisView e={e} />
        </Sequence>
      ))}

      {edit.clicks.map((f, i) => (
        <Sequence
          key={`click-${i}`}
          from={f}
          durationInFrames={Math.round(0.2 * fps)}
        >
          <Html5Audio src={staticFile("sfx/click.wav")} volume={0.55} />
        </Sequence>
      ))}

      <Progress />
    </AbsoluteFill>
  );
};
