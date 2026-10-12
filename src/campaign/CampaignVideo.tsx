import React from "react";
import {
  AbsoluteFill,
  Html5Audio as Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Anton } from "./font";
import { Icon, IconName } from "./icons";
import edit from "./vigilante.json";

// Valores de estilo.md. La edición (cortes, subtítulos, tarjetas) la genera
// scripts/build_edl.py en vigilante.json a partir de las transcripciones.

export const FPS = 60;
const END_CARD = Math.round(3.5 * FPS);
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const RED = "#E30613";
const YELLOW = "#FFE600";

type Seg = (typeof edit.segments)[number];
type Page = (typeof edit.pages)[number];
type Card = (typeof edit.cards)[number];

export const TOTAL = edit.clipsEnd + END_CARD;

const clipStarts = edit.clips.slice(1).map((c) => c.from);

// Encuadre fijo: el cliente no quiere zooms que entran y salen.
const Segment: React.FC<{ s: Seg }> = ({ s }) => {
  const frame = useCurrentFrame();
  const isClipStart = clipStarts.indexOf(s.from) >= 0;
  const shake = isClipStart
    ? interpolate(frame, [0, 14], [22, 0], { extrapolateRight: "clamp" })
    : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`master/${s.video}.mov`)}
        trimBefore={s.trimBefore}
        trimAfter={s.trimAfter}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: shake
            ? `translate(${Math.sin(frame * 2.7) * shake}px, ${Math.cos(frame * 3.1) * shake}px) scale(1.03)`
            : undefined,
          filter: s.grayscale ? "grayscale(1) contrast(1.15)" : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

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

// Firma discreta en la esquina superior izquierda: no tapa la cabeza.
const TopBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = interpolate(
    spring({ frame, fps, config: { damping: 18 } }),
    [0, 1],
    [-420, 0],
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 40,
        transform: `translateX(${x}px)`,
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 12,
        padding: "8px 16px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 7,
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{ fontFamily: Anton, fontSize: 38, color: RED, lineHeight: 1 }}
      >
        Juan Felipe Castaño
      </div>
      <BrandBar width={"100%"} height={6} />
    </div>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 14,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(frame / TOTAL) * 100}%`,
          background: `linear-gradient(90deg, ${BRAND.join(",")})`,
        }}
      />
    </div>
  );
};

// Gancho y credenciales: debajo de los subtítulos (la cara ocupa la zona superior)
// y encima de la franja inferior de 380 px que tapa la interfaz de TikTok/Reels.
const TopText: React.FC<{ text: string; hook: boolean; dur: number }> = ({
  text,
  hook,
  dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 160 } });
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wobble = hook ? Math.sin(frame / 6) * 1.5 : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1390 }}>
      <div
        style={{
          transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${(hook ? -3 : 2) + wobble}deg)`,
          opacity: out,
          backgroundColor: hook ? YELLOW : RED,
          color: hook ? "black" : "white",
          fontFamily: Anton,
          fontSize: hook ? 80 : 60,
          lineHeight: 1.05,
          textAlign: "center",
          padding: "16px 32px",
          borderRadius: 20,
          maxWidth: 940,
          boxShadow: "0 12px 0 rgba(0,0,0,0.85)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Subtítulos palabra por palabra: bloque de hasta 3 palabras, la palabra que
// suena en amarillo 1.10x y las palabras clave en caja roja.
const Captions: React.FC<{ page: Page }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = page.from + frame;
  const enter = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        top: 1220 - 960,
        transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          rowGap: 10,
          maxWidth: 960,
          fontFamily: Anton,
          fontSize: 88,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        {page.words.map((w, i) => {
          const active = g >= w.start && g < w.end;
          // Palabra con clic: salto de escala 1.25 -> 1 en ~10 frames.
          const bounce =
            w.click && g >= w.start
              ? 1 +
                0.25 *
                  (1 -
                    spring({
                      frame: g - w.start,
                      fps,
                      config: { damping: 10, stiffness: 220 },
                    }))
              : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 20px",
                color: !w.key && active ? YELLOW : "white",
                transform: `scale(${(active ? 1.08 : 1) * bounce})`,
                WebkitTextStroke: w.key ? undefined : "14px black",
                paintOrder: "stroke fill",
                textShadow: "0 6px 0 rgba(0,0,0,0.55)",
                backgroundColor: w.key ? RED : undefined,
                padding: w.key ? "4px 14px 8px" : undefined,
                borderRadius: w.key ? 10 : undefined,
                boxShadow: w.key && active ? `0 0 0 6px ${YELLOW}` : undefined,
              }}
            >
              {w.text}
            </span>
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

export const CampaignVideo: React.FC = () => {
  const W = 12; // la campanita de transición suena justo en el corte
  const HOOK = Math.round(2.6 * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
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
        <React.Fragment key={f}>
          <Sequence from={f} durationInFrames={10}>
            <Flash />
          </Sequence>
          <Sequence from={f - W} durationInFrames={54}>
            <Audio src={staticFile("sfx/transition.wav")} volume={0.6} />
          </Sequence>
        </React.Fragment>
      ))}

      {edit.cards.map((c, i) => (
        <Sequence key={`card-${i}`} from={c.from} durationInFrames={c.dur}>
          <CardView card={c} />
        </Sequence>
      ))}
      {edit.cards.map((c, i) => (
        <Sequence key={`cardsfx-${i}`} from={c.from - W} durationInFrames={54}>
          <Audio src={staticFile("sfx/transition.wav")} volume={0.5} />
        </Sequence>
      ))}

      <Sequence from={edit.clipsEnd} durationInFrames={END_CARD}>
        <Flash />
        <EndCard />
        <Audio src={staticFile("sfx/transition.wav")} volume={0.6} />
      </Sequence>

      <Sequence durationInFrames={edit.clipsEnd}>
        <TopBanner />
      </Sequence>

      <Sequence from={6} durationInFrames={HOOK}>
        <TopText text={edit.hook} hook dur={HOOK} />
        <Audio src={staticFile("sfx/pop.wav")} volume={0.7} />
      </Sequence>

      {edit.texts.map((t, i) => (
        <Sequence key={`t-${i}`} from={t.from} durationInFrames={t.dur}>
          <TopText text={t.text} hook={false} dur={t.dur} />
          <Audio src={staticFile("sfx/pop.wav")} volume={0.6} />
        </Sequence>
      ))}

      {edit.pages.map((p, i) => (
        <Sequence
          key={`p-${i}`}
          from={p.from}
          durationInFrames={Math.max(1, p.to - p.from)}
        >
          <Captions page={p} />
        </Sequence>
      ))}

      {edit.clicks.map((f, i) => (
        <Sequence key={`click-${i}`} from={f} durationInFrames={12}>
          <Audio src={staticFile("sfx/click.wav")} volume={0.8} />
        </Sequence>
      ))}

      <Progress />
    </AbsoluteFill>
  );
};
