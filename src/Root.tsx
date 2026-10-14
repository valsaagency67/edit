import { Composition } from "remotion";
import { CampaignVideo, durationFor, FPS } from "./campaign/CampaignVideo";
import { Cover } from "./campaign/Cover";
import { Highlight } from "./campaign/Highlights";
import { Policia, POLICIA_FPS, policiaDuration } from "./campaign/Policia";

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
      {/* Petición: censura y llegada de la Policía (IMG_1698, gris): npm run render:policia */}
      <Composition
        id="JFC-Policia"
        component={Policia}
        width={1080}
        height={1920}
        fps={POLICIA_FPS}
        durationInFrames={policiaDuration}
      />
      {/* Portadas de historias destacadas: npm run render:destacadas */}
      <Composition
        id="Destacada-INFO"
        component={Highlight}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        defaultProps={{ icon: "info", color: "red" as const }}
      />
      <Composition
        id="Destacada-JUVENTUD"
        component={Highlight}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        defaultProps={{ icon: "people", color: "blue" as const }}
      />
      <Composition
        id="Destacada-TERRITORIO"
        component={Highlight}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        defaultProps={{ icon: "pin", color: "red" as const }}
      />
    </>
  );
};
