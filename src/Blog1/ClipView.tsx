import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clipSrc, FPS, HORIZONTAL, segFrame, TimedSegment } from "./clips";

// Ventana de las tomas horizontales en layout "boxed".
export const BOX = { top: 440, width: 1080, height: 720 };

// Ajuste fino sobre el LUT (los interiores del gym quedaron oscuros).
const GRADE = "brightness(1.16) contrast(1.06) saturate(1.08)";

const useMotion = (seg: TimedSegment) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // empuje muy lento durante toda la escena
  const push = interpolate(frame, [0, seg.durationInFrames], [0, 0.04]);
  // acercamientos de énfasis: entran con spring, se sostienen y salen suave
  let zoom = 0;
  for (const z of seg.zooms ?? []) {
    const start = segFrame(seg, z.at);
    const end = start + Math.round((z.dur ?? 2) * fps);
    const amount = (z.scale ?? 1.1) - 1;
    const inP = spring({
      frame: frame - start,
      fps,
      config: { damping: 18, stiffness: 120 },
    });
    const outP = interpolate(frame, [end, end + 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    zoom += amount * inP * outP;
  }
  return { transform: `scale(${1 + push + zoom})` };
};

const Video: React.FC<{
  seg: TimedSegment;
  style: React.CSSProperties;
  muted?: boolean;
}> = ({ seg, style, muted }) => {
  const realFrames = seg.durationInFrames;
  return (
    <OffthreadVideo
      src={clipSrc(seg.clip)}
      trimBefore={Math.round(seg.in * FPS)}
      muted={muted}
      volume={(f) =>
        interpolate(f, [0, 2, realFrames - 2, realFrames], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
      style={{ filter: GRADE, ...style }}
    />
  );
};

export const ClipView: React.FC<{ seg: TimedSegment }> = ({ seg }) => {
  const motion = useMotion(seg);
  const horizontal = HORIZONTAL.has(seg.clip);
  const focusX = seg.focusX ?? 0.5;

  if (seg.layout === "cover") {
    if (!horizontal) {
      return (
        <AbsoluteFill style={motion}>
          <Video seg={seg} style={{ width: 1080, height: 1920 }} />
        </AbsoluteFill>
      );
    }
    const w = 3414;
    const left = Math.min(0, Math.max(1080 - w, 540 - focusX * w));
    return (
      <AbsoluteFill style={{ ...motion, overflow: "hidden" }}>
        <Video
          seg={seg}
          style={{ position: "absolute", left, top: 0, width: w, height: 1920 }}
        />
      </AbsoluteFill>
    );
  }

  // boxed: ventana cuadrada + fondo difuminado de la misma toma
  const w = (BOX.height * 3414) / 1920; // ancho del video cuando su alto = BOX.height
  const left = Math.min(0, Math.max(BOX.width - w, BOX.width / 2 - focusX * w));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b" }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Video
          seg={seg}
          muted
          style={{
            position: "absolute",
            height: 1920,
            width: 3414,
            left: 540 - focusX * 3414,
            top: 0,
            filter: "blur(38px) brightness(0.6) saturate(1.2)",
            transform: "scale(1.15)",
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: BOX.top,
          left: 0,
          width: BOX.width,
          height: BOX.height,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, ...motion }}>
          <Video
            seg={seg}
            style={{
              position: "absolute",
              left,
              top: 0,
              width: w,
              height: BOX.height,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
