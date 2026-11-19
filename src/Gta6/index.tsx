import React, { useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "../load-font";
import { Background } from "./Background";
import { Captions } from "./Captions";
import { Headline } from "./Headline";
import { Mascot } from "./Mascot";
import { COLORS, Scene, TOTAL_FRAMES, scenes } from "./timeline";
import { TRANSITION_FRAMES, Transition } from "./Transition";
import { Visual } from "./Visuals";

export { TOTAL_FRAMES };

const NUMBER_SCENES = new Set(["uno", "dos", "tres", "cuatro", "cinco"]);

const SceneLayer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // punch-in zoom at each cut
  const punch = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const zoom = interpolate(punch, [0, 1], [1.08, 1]) + frame * 0.0004;
  const shake =
    NUMBER_SCENES.has(scene.id) && frame >= scene.lead && frame < scene.lead + 8
      ? Math.sin(frame * 5) * 10
      : 0;

  const mood =
    scene.id === "ojo" ? "worried" : scene.id === "hook" ? "wow" : "happy";

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom}) translate(${shake}px, ${shake / 2}px)`,
        transformOrigin: "50% 45%",
      }}
    >
      <Visual scene={scene} />
      <Sequence from={scene.lead > 3 ? scene.lead - 4 : 0} layout="none">
        <Headline
          title={scene.title}
          subtitle={scene.subtitle}
          big={scene.id === "hook" || scene.id === "cta"}
        />
      </Sequence>
      <Mascot
        words={scene.words}
        lead={scene.lead}
        x={scene.id === "hook" ? 540 : 860}
        y={1320}
        size={scene.id === "hook" ? 230 : 210}
        mood={mood}
      />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 14,
        background: "rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.orange})`,
          boxShadow: `0 0 16px ${COLORS.orange}`,
        }}
      />
    </div>
  );
};

export const Gta6Video: React.FC = () => {
  useEffect(() => {
    loadFont();
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <Background />

      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
          name={scene.id}
        >
          <SceneLayer scene={scene} />
          <Sequence from={scene.lead} layout="none">
            <Audio src={staticFile(`gta6/voice/${scene.id}.mp3`)} />
          </Sequence>
          <Sequence
            from={Math.max(0, scene.lead - 4)}
            durationInFrames={20}
            layout="none"
          >
            <Audio
              src={staticFile(
                NUMBER_SCENES.has(scene.id)
                  ? "gta6/sfx/ding.wav"
                  : "gta6/sfx/pop.wav",
              )}
              volume={0.45}
            />
          </Sequence>
        </Sequence>
      ))}

      {scenes
        .filter((s) => s.transition)
        .map((s) => (
          <Sequence
            key={`t-${s.id}`}
            from={s.from - Math.floor(TRANSITION_FRAMES / 2)}
            durationInFrames={TRANSITION_FRAMES}
            name={`transicion-${s.id}`}
          >
            <Transition />
            <Audio src={staticFile("gta6/sfx/whoosh.wav")} volume={0.7} />
          </Sequence>
        ))}

      <Sequence
        from={scenes[scenes.length - 1].from}
        durationInFrames={15}
        layout="none"
      >
        <Audio src={staticFile("gta6/sfx/boom.wav")} volume={0.6} />
      </Sequence>

      <Captions />
      <ProgressBar />

      <Audio src={staticFile("gta6/sfx/music.m4a")} volume={0.13} />
    </AbsoluteFill>
  );
};
