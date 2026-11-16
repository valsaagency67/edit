import { Composition, staticFile } from "remotion";
import { AvanzaresVideo, FPS, TOTAL_FRAMES } from "./Avanzares";
import { Portada } from "./Avanzares/Portada";
import {
  Portada1,
  Portada2,
  Portada3,
  Portada4,
  Portada5,
} from "./Avanzares/Portadas";

const PORTADAS = [Portada1, Portada2, Portada3, Portada4, Portada5];
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
        id="PortadaSaboresSorprendentes"
        component={Portada}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      {PORTADAS.map((C, i) => (
        <Composition
          key={i}
          id={`PortadaOpcion${i + 1}`}
          component={C}
          durationInFrames={1}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
      <Composition
        id="SaboresSorprendentes"
        component={AvanzaresVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
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
