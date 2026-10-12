import { Composition } from "remotion";
import { CampaignVideo, FPS, TOTAL } from "./campaign/CampaignVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="JFC-Vigilante"
      component={CampaignVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={TOTAL}
    />
  );
};
