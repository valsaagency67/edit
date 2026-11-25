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
import { buildTimeline, FPS, segFrame } from "./clips";
import { ClipView } from "./ClipView";
import { Captions, FadeOut, Flash, ProgressBar, Title } from "./Overlays";

export const blog1Schema = z.object({
  /** Pista de música (archivo en public/, ej. "music/gym.mp3"). Vacío = sin música. */
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
});

const SFX = {
  whoosh: { file: "sfx/whoosh.wav", lead: 6, volume: 0.35 },
  impact: { file: "sfx/impact.wav", lead: 0, volume: 0.45 },
  pop: { file: "sfx/pop.wav", lead: 0, volume: 0.45 },
} as const;

type SfxCue = { frame: number; kind: keyof typeof SFX };

export const Blog1: React.FC<z.infer<typeof blog1Schema>> = ({
  music,
  musicVolume,
}) => {
  useState(() => loadFont());
  const { durationInFrames } = useVideoConfig();
  const timeline = buildTimeline();

  const cues: SfxCue[] = [];
  for (const seg of timeline) {
    if (seg.sceneChange) cues.push({ frame: seg.from, kind: "whoosh" });
    for (const z of seg.zooms ?? []) {
      if (z.sfx)
        cues.push({ frame: seg.from + segFrame(seg, z.at), kind: z.sfx });
    }
  }

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
          {seg.sceneChange ? (
            <Sequence durationInFrames={6}>
              <Flash />
            </Sequence>
          ) : null}
          {(seg.titles ?? []).map((t, j) => {
            const dur = Math.round((t.dur ?? 2.5) * FPS);
            return (
              <Sequence
                key={j}
                from={segFrame(seg, t.at)}
                durationInFrames={dur}
              >
                <Title
                  text={t.text}
                  sub={t.sub}
                  boxed={seg.layout === "boxed"}
                  durationInFrames={dur}
                />
              </Sequence>
            );
          })}
        </Sequence>
      ))}

      <Captions />
      <ProgressBar />
      <FadeOut frames={15} />

      {cues.map((c, i) => (
        <Sequence
          key={`s${i}`}
          from={Math.max(0, c.frame - SFX[c.kind].lead)}
          durationInFrames={30}
        >
          <Audio
            src={staticFile(SFX[c.kind].file)}
            volume={SFX[c.kind].volume}
          />
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
              [0, 15, durationInFrames - 30, durationInFrames],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
