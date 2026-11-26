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
            [0, 0.5, 0.5, 0],
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
      <Sequence from={sec(5)} durationInFrames={sec(10)} name="2 · Problema">
        <SceneProblem />
      </Sequence>
      <Sequence from={sec(15)} durationInFrames={sec(15)} name="3 · Solución">
        <SceneSolution />
      </Sequence>
      <Sequence from={sec(30)} durationInFrames={sec(8)} name="4 · Resultado">
        <SceneResult />
      </Sequence>
      <Sequence from={sec(38)} durationInFrames={sec(2)} name="5 · Cierre">
        <SceneOutro />
      </Sequence>
      <Captions />
    </AbsoluteFill>
  );
};
