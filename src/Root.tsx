import { Composition, staticFile } from "remotion";
import { Blog1, blog1Schema } from "./Blog1";
import { FPS, totalFrames } from "./Blog1/clips";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Blog1"
        component={Blog1}
        schema={blog1Schema}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={totalFrames()}
        defaultProps={{ music: "", musicVolume: 0.16 }}
      />
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
    </>
  );
};
