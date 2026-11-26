import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "./Background";
import { Captions } from "./Captions";
import { SceneHook } from "./SceneHook";
import { SceneProblem } from "./SceneProblem";
import { SceneSolution } from "./SceneSolution";
import { SceneResult } from "./SceneResult";
import { SceneOutro } from "./SceneOutro";
import { FPS, sec } from "./theme";
import { VOICEOVER_ENABLED, VOICE_LINES } from "./voiceover";

export const FACTURAPP_DURATION = sec(40);
export { FPS };

export const FacturApp: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <Audio
        src={staticFile("facturapp/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, durationInFrames - 60, durationInFrames],
            [
              0,
              VOICEOVER_ENABLED ? 0.22 : 0.5,
              VOICEOVER_ENABLED ? 0.22 : 0.5,
              0,
            ],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />
      <Sequence from={0} durationInFrames={sec(5)} name="1 · Gancho">
        <SceneHook />
      </Sequence>
      <Sequence from={sec(5)} durationInFrames={sec(10.5)} name="2 · Problema">
        <SceneProblem />
      </Sequence>
      <Sequence
        from={sec(15.5)}
        durationInFrames={sec(14.5)}
        name="3 · Solución"
      >
        <SceneSolution />
      </Sequence>
      <Sequence from={sec(30)} durationInFrames={sec(8)} name="4 · Resultado">
        <SceneResult />
      </Sequence>
      <Sequence from={sec(38)} durationInFrames={sec(2)} name="5 · Cierre">
        <SceneOutro />
      </Sequence>
      {VOICEOVER_ENABLED
        ? VOICE_LINES.map((l, i) => (
            <Sequence key={i} from={sec(l.from)} layout="none">
              <Audio
                src={staticFile(
                  `facturapp/vo/vo-${i < 10 ? "0" + i : "" + i}.mp3`,
                )}
              />
            </Sequence>
          ))
        : null}
      <Captions />
    </AbsoluteFill>
  );
};
