import { Composition } from "remotion";
import { CampaignVideo, durationFor, FPS } from "./campaign/CampaignVideo";
import { Cover } from "./campaign/Cover";
import { CoverMarcha } from "./campaign/CoverMarcha";
import { CoverPeticion } from "./campaign/CoverPeticion";
import { Highlight } from "./campaign/Highlights";
import { Marcha, MARCHA_FPS, marchaDuration } from "./campaign/Marcha";
import { Policia, POLICIA_FPS, policiaDuration } from "./campaign/Policia";
import { Peticion, PETICION_FPS, peticionDuration } from "./campaign/Peticion";
import { Nia, NIA_FPS, niaDuration } from "./nia/Nia";
import { NiaEstilo } from "./nia/NiaEstilo";

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
      {/* Video completo de la petición (todas las tomas, en gris): npm run render:peticion */}
      <Composition
        id="JFC-Peticion"
        component={Peticion}
        width={1080}
        height={1920}
        fps={PETICION_FPS}
        durationInFrames={peticionDuration}
      />
      <Composition
        id="JFC-Peticion-Portada"
        component={CoverPeticion}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
      />
      {/* Marcha frente al CAM con texto cinético: npm run build:marcha && npm run render:marcha */}
      <Composition
        id="JFC-Marcha"
        component={Marcha}
        width={1080}
        height={1920}
        fps={MARCHA_FPS}
        durationInFrames={marchaDuration}
      />
      <Composition
        id="JFC-Marcha-Portada"
        component={CoverMarcha}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
      />
      {/* Nia: «La filosofía se vive en la calle»: npm run build:nia && npm run render:nia */}
      <Composition id="NIA" component={Nia} width={1080} height={1920} fps={NIA_FPS} durationInFrames={niaDuration} />
      {/* Nia: propuesta de estilo pastel (cuadros de muestra) */}
      <Composition
        id="NIA-Estilo"
        component={NiaEstilo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        defaultProps={{ variante: "gancho" as "gancho" | "subtitulo" }}
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
