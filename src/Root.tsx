import { Composition, Still, staticFile } from "remotion";
import { Blog1Collage } from "./Blog1/Collage";
import { Blog1Cover, coverSchema } from "./Blog1/Cover";
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
      <Still
        id="Blog1Collage"
        component={Blog1Collage}
        width={1080}
        height={1920}
      />
      <Still
        id="Blog1Cover"
        component={Blog1Cover}
        schema={coverSchema}
        width={1080}
        height={1920}
        defaultProps={{ image: "blog1/cover-C105-1.8.png" }}
      />
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
