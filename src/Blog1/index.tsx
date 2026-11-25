import React, { useState } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { buildTimeline, PREVIEW_TOTAL } from "./clips";
import { ClipView } from "./ClipView";
import {
  loadMiniVlogFonts,
  Preview,
  TypewriterTitle,
  WordCaptions,
} from "./MiniVlog";
import { FadeOut } from "./Overlays";

export const blog1Schema = z.object({
  /** Pista de música (archivo en public/, ej. "music/gym.mp3"). Vacío = sin música. */
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
});

export const Blog1: React.FC<z.infer<typeof blog1Schema>> = ({
  music,
  musicVolume,
}) => {
  useState(() => loadMiniVlogFonts());
  const { durationInFrames } = useVideoConfig();
  const timeline = buildTimeline();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Adelanto rápido + título escrito a máquina */}
      <Sequence durationInFrames={PREVIEW_TOTAL} name="Adelanto">
        <Preview />
      </Sequence>

      {/* El día, en orden */}
      {timeline.map((seg, i) => (
        <Sequence
          key={`v${i}`}
          from={seg.from}
          durationInFrames={seg.durationInFrames}
          name={`${seg.clip} ${seg.in}-${seg.out}`}
        >
          <ClipView seg={seg} />
        </Sequence>
      ))}

      <Sequence durationInFrames={PREVIEW_TOTAL + 12} name="Título">
        <TypewriterTitle />
      </Sequence>
      <WordCaptions />
      <FadeOut frames={15} />

      {/* tecleo suave mientras se escribe el título */}
      {Array.from({ length: Math.floor(PREVIEW_TOTAL / 3) }).map((_, i) => (
        <Sequence key={`t${i}`} from={i * 3} durationInFrames={4}>
          <Audio src={staticFile("sfx/tick.wav")} volume={0.12} />
        </Sequence>
      ))}

      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) =>
            musicVolume *
            interpolate(
              f,
              [0, 10, durationInFrames - 30, durationInFrames],
              [0.6, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
