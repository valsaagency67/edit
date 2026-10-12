import { Composition } from "remotion";
import { CampaignVideo, durationFor, FPS } from "./campaign/CampaignVideo";
import { Cover } from "./campaign/Cover";

// JFC-Vigilante: versión final (60 fps, render a 1080x1920).
// JFC-Vigilante-Borrador: revisión rápida (30 fps, se renderiza con --scale=0.5).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JFC-Vigilante"
        component={CampaignVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={durationFor(FPS)}
        defaultProps={{ fps: FPS }}
      />
      <Composition
        id="JFC-Vigilante-Borrador"
        component={CampaignVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={durationFor(30)}
        defaultProps={{ fps: 30 }}
      />
      <Composition
        id="JFC-Portada"
        component={Cover}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
      />
    </>
  );
};
