import { Composition } from "remotion";
import { CampaignVideo, durationFor, FPS } from "./campaign/CampaignVideo";
import { CarruselIva, IVA_SLIDES } from "./campaign/CarruselIva";
import { CarruselIva2, IVA2_SLIDES } from "./campaign/CarruselIva2";
import { Cover } from "./campaign/Cover";
import { CoverDerechos } from "./campaign/CoverDerechos";
import { CoverMarcha } from "./campaign/CoverMarcha";
import { CoverMilagro } from "./campaign/CoverMilagro";
import { CoverMuseo } from "./campaign/CoverMuseo";
import { CoverPeticion } from "./campaign/CoverPeticion";
import { Derechos, DERECHOS_FPS, derechosDuration } from "./campaign/Derechos";
import { Highlight } from "./campaign/Highlights";
import { Marcha, MARCHA_FPS, marchaDuration } from "./campaign/Marcha";
import { Milagro, MILAGRO_FPS, milagroDuration } from "./campaign/Milagro";
import { Pepo, PEPO_FPS, pepoDuration } from "./campaign/Pepo";
import { CoverPepo } from "./campaign/CoverPepo";
import { Museo, MUSEO_FPS, museoDuration } from "./campaign/Museo";
import { Policia, POLICIA_FPS, policiaDuration } from "./campaign/Policia";
import { Peticion, PETICION_FPS, peticionDuration } from "./campaign/Peticion";
import { Nia, NIA_FPS, niaDuration } from "./nia/Nia";
import { NiaEstilo } from "./nia/NiaEstilo";
import { NiaPortada } from "./nia/NiaPortada";

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
      <Composition id="NIA-Portada" component={NiaPortada} width={1080} height={1920} fps={30} durationInFrames={1} />
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
      {/* Juan Felipe: «¿Dónde acudir cuando te vulneran tus derechos?»: npm run build:derechos && npm run render:derechos */}
      <Composition id="JFC-Derechos" component={Derechos} width={1080} height={1920} fps={DERECHOS_FPS} durationInFrames={derechosDuration} />
      <Composition id="JFC-Derechos-Portada" component={CoverDerechos} width={1080} height={1920} fps={30} durationInFrames={1} />
      {/* Fallo del Museo Nacional: npm run build:museo && npm run render:museo */}
      <Composition id="JFC-Museo" component={Museo} width={1080} height={1920} fps={MUSEO_FPS} durationInFrames={museoDuration} />
      <Composition id="JFC-Museo-Portada" component={CoverMuseo} width={1080} height={1920} fps={30} durationInFrames={1} />
      {/* Fondo Milagro: npm run build:milagro && npm run render:milagro */}
      <Composition id="JFC-Milagro" component={Milagro} width={1080} height={1920} fps={MILAGRO_FPS} durationInFrames={milagroDuration} />
      <Composition id="JFC-Milagro-Portada" component={CoverMilagro} width={1080} height={1920} fps={30} durationInFrames={1} />
      {/* Cultura política (Pepo1, estilo del video argentino): npm run build:pepo && npm run render:pepo */}
      <Composition id="JFC-Pepo" component={Pepo} width={1080} height={1920} fps={PEPO_FPS} durationInFrames={pepoDuration} />
      <Composition id="JFC-Pepo-Portada" component={CoverPepo} width={1080} height={1920} fps={30} durationInFrames={1} />
      {/* Carrusel del IVA a la canasta (1080x1350): npm run render:carrusel-iva */}
      {Array.from({ length: IVA_SLIDES }, (_, k) => (
        <Composition key={k} id={`IVA-${k + 1}`} component={CarruselIva} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{ slide: k + 1 }} />
      ))}
      {Array.from({ length: IVA2_SLIDES }, (_, k) => (
        <Composition key={k} id={`IVA2-${k + 1}`} component={CarruselIva2} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{ slide: k + 1 }} />
      ))}
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
