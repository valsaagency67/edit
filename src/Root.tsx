import { Composition } from "remotion";
import {
  calculateCampaignMetadata,
  CampaignVideo,
  FPS,
} from "./campaign/CampaignVideo";
import { VIDEO_VIGILANTE } from "./campaign/edl";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JFC-Vigilante"
        component={CampaignVideo}
        calculateMetadata={calculateCampaignMetadata}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{ edit: VIDEO_VIGILANTE }}
      />
    </>
  );
};
