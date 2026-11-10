import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import {
  calculatePrevencionMetadata,
  FPS,
  Prevencion,
  prevencionSchema,
} from "./Prevencion";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="PrevencionViolencia"
        component={Prevencion}
        calculateMetadata={calculatePrevencionMetadata}
        schema={prevencionSchema}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{
          lineaAtencion: "",
          casoSrc: "",
          casoSeconds: 0,
        }}
      />
    </>
  );
};
