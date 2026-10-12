import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Html5Audio as Audio } from "remotion";
import { Anton } from "./font";
import { Edit } from "./edl";

export const FPS = 60;
const END_CARD_S = 3.5;
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const RED = "#E30613";

type Placed = {
  file: string;
  from: number;
  len: number;
  trimBefore: number;
  trimAfter: number;
  clipIndex: number;
  segIndex: number;
};

const layout = (edit: Edit) => {
  const placed: Placed[] = [];
  const clipStarts: number[] = [];
  let t = 0;
  edit.clips.forEach((clip, clipIndex) => {
    clipStarts.push(t);
    clip.segments.forEach(([a, b], segIndex) => {
      const trimBefore = Math.round(a * FPS);
      const trimAfter = Math.round(b * FPS);
      const len = trimAfter - trimBefore;
      placed.push({
        file: clip.file,
        from: t,
        len,
        trimBefore,
        trimAfter,
        clipIndex,
        segIndex,
      });
      t += len;
    });
  });
  return {
    placed,
    clipStarts,
    clipsEnd: t,
    total: t + Math.round(END_CARD_S * FPS),
  };
};

export const calculateCampaignMetadata: CalculateMetadataFunction<{
  edit: Edit;
}> = ({ props }) => ({ durationInFrames: layout(props.edit).total, fps: FPS });

// Un segmento con encuadre alternado (jump cut), "pop" de zoom al entrar y
// empuje lento continuo para que la imagen nunca esté quieta.
const Segment: React.FC<{ p: Placed; isClipStart: boolean }> = ({
  p,
  isClipStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = p.segIndex % 2 === 1 ? 1.16 : 1.0;
  const push = interpolate(frame, [0, p.len], [0, 0.045]);
  const pop = isClipStart
    ? 0
    : 0.06 *
      (1 - spring({ frame, fps, config: { damping: 14, stiffness: 180 } }));
  // Sacudida corta al entrar a un clip nuevo.
  const shakeAmt = isClipStart
    ? interpolate(frame, [0, 14], [22, 0], { extrapolateRight: "clamp" })
    : 0;
  const sx = Math.sin(frame * 2.7) * shakeAmt;
  const sy = Math.cos(frame * 3.1) * shakeAmt;
  // Encuadre un poco más arriba cuando hay zoom, para mantener la cara.
  const originY = p.segIndex % 2 === 1 ? "35%" : "45%";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`master/${p.file}.mov`)}
        trimBefore={p.trimBefore}
        trimAfter={p.trimAfter}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: `50% ${originY}`,
          transform: `translate(${sx}px, ${sy}px) scale(${base + push + pop})`,
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

const BrandBar: React.FC<{ width: number; height: number }> = ({
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

// Banner superior fijo: nombre + barra de colores de campaña.
const TopBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const y = interpolate(enter, [0, 1], [-260, 0]);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        top: 120,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: 28,
          padding: "18px 40px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontFamily: Anton,
            fontSize: 74,
            color: RED,
            letterSpacing: 1,
            lineHeight: 1,
          }}
        >
          Juan Felipe Castaño
        </div>
        <div style={{ marginTop: 14 }}>
          <BrandBar width={640} height={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Barra de progreso (retención: el espectador ve cuánto falta).
const Progress: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const w = (frame / total) * 100;
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
          width: `${w}%`,
          background: `linear-gradient(90deg, ${BRAND.join(",")})`,
        }}
      />
    </div>
  );
};

const PopText: React.FC<{
  text: string;
  tone: "hook" | "info";
  dur: number;
}> = ({ text, tone, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 160 } });
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wobble = tone === "hook" ? Math.sin(frame / 6) * 1.5 : 0;
  const isHook = tone === "hook";
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        top: isHook ? 1180 : 1300,
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(s, [0, 1], [0.4, 1]) * (0.9 + 0.1 * out)}) rotate(${(isHook ? -3 : 2) + wobble}deg)`,
          opacity: out,
          backgroundColor: isHook ? "#FFE600" : RED,
          color: isHook ? "black" : "white",
          fontFamily: Anton,
          fontSize: isHook ? 96 : 66,
          lineHeight: 1.05,
          textAlign: "center",
          padding: "18px 34px",
          borderRadius: 22,
          maxWidth: 940,
          boxShadow: "0 14px 0 rgba(0,0,0,0.85)",
          textTransform: "uppercase",
        }}
      >
        {text}
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
        SÍGUELO @juanfelipecastano_col
      </div>
    </AbsoluteFill>
  );
};

export const CampaignVideo: React.FC<{ edit: Edit }> = ({ edit }) => {
  const { placed, clipStarts, clipsEnd, total } = layout(edit);
  const W = 10; // frames de anticipación del whoosh antes del corte
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {placed.map((p, i) => (
        <Sequence
          key={i}
          from={p.from}
          durationInFrames={p.len}
          premountFor={30}
        >
          <Segment p={p} isClipStart={p.segIndex === 0 && p.clipIndex > 0} />
        </Sequence>
      ))}

      {clipStarts.slice(1).map((f) => (
        <React.Fragment key={f}>
          <Sequence from={f} durationInFrames={10}>
            <Flash />
          </Sequence>
          <Sequence from={f - W} durationInFrames={30}>
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.55} />
          </Sequence>
        </React.Fragment>
      ))}

      <Sequence from={clipsEnd} durationInFrames={total - clipsEnd}>
        <Flash />
        <EndCard />
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>

      <Sequence durationInFrames={clipsEnd}>
        <TopBanner />
      </Sequence>

      {/* Gancho en los primeros 2.6 s */}
      <Sequence from={6} durationInFrames={Math.round(2.6 * FPS)}>
        <PopText text={edit.hook} tone="hook" dur={Math.round(2.6 * FPS)} />
        <Audio src={staticFile("sfx/pop.wav")} volume={0.7} />
      </Sequence>

      {edit.clips.map((clip, ci) =>
        (clip.texts ?? []).map((t, ti) => {
          const dur = Math.round((t.dur ?? 2.4) * FPS);
          return (
            <Sequence
              key={`${ci}-${ti}`}
              from={clipStarts[ci] + Math.round((t.at ?? 0) * FPS)}
              durationInFrames={dur}
            >
              <PopText text={t.text} tone={t.tone ?? "info"} dur={dur} />
              <Audio src={staticFile("sfx/pop.wav")} volume={0.6} />
            </Sequence>
          );
        }),
      )}

      <Progress total={total} />
    </AbsoluteFill>
  );
};
