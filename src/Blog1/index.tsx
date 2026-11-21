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
import { loadFont } from "../load-font";
import { buildTimeline, FPS } from "./clips";
import { ClipView } from "./ClipView";
import { Captions, FadeOut, Flash, ProgressBar, Title } from "./Overlays";

export const blog1Schema = z.object({
  /** Pista de música (archivo en public/, ej. "music/gym.mp3"). Vacío = sin música. */
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
});

const SFX = {
  whoosh: { file: "sfx/whoosh.wav", lead: 6, volume: 0.35 },
  impact: { file: "sfx/impact.wav", lead: 0, volume: 0.6 },
  pop: { file: "sfx/pop.wav", lead: 0, volume: 0.5 },
} as const;

export const Blog1: React.FC<z.infer<typeof blog1Schema>> = ({
  music,
  musicVolume,
}) => {
  useState(() => loadFont());
  const { durationInFrames } = useVideoConfig();
  const timeline = buildTimeline();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {timeline.map((seg, i) => (
        <Sequence
          key={`v${i}`}
          from={seg.from}
          durationInFrames={seg.durationInFrames}
          name={`${seg.clip} ${seg.in}-${seg.out}`}
        >
          <ClipView seg={seg} />
          {seg.flash ? (
            <Sequence durationInFrames={6}>
              <Flash />
            </Sequence>
          ) : null}
          {seg.title ? (
            <Sequence
              durationInFrames={Math.round((seg.title.durationSec ?? 2) * FPS)}
            >
              <Title
                text={seg.title.text}
                sub={seg.title.sub}
                boxed={seg.layout === "boxed"}
                durationInFrames={Math.round(
                  (seg.title.durationSec ?? 2) * FPS,
                )}
              />
            </Sequence>
          ) : null}
        </Sequence>
      ))}

      <Captions />
      <ProgressBar />
      <FadeOut frames={12} />

      {timeline.map((seg, i) =>
        seg.sfx ? (
          <Sequence
            key={`s${i}`}
            from={Math.max(0, seg.from - SFX[seg.sfx].lead)}
            durationInFrames={30}
          >
            <Audio
              src={staticFile(SFX[seg.sfx].file)}
              volume={SFX[seg.sfx].volume}
            />
          </Sequence>
        ) : null,
      )}

      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) =>
            musicVolume *
            interpolate(
              f,
              [0, 15, durationInFrames - 30, durationInFrames],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
