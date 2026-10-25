import { Composition, Folder, Still, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { CarruselSlide, carruselSchema } from "./linea01/CarruselSlide";
import {
  ReelTransiciones,
  calcularDuracionReel,
  reelSchema,
} from "./linea01/ReelTransiciones";
import { OUTFITS, foto } from "./linea01/material";

// Each <Composition> is an entry in the sidebar!

const fotosReel = [
  ...OUTFITS.jeanCeleste,
  ...OUTFITS.vinotintoCafe,
  ...OUTFITS.rojoBlanco,
];

// Duración (s) de cada plano en el TikTok de referencia: cortes en 0.77, 1.77, 2.9, 3.8 y 4.5 s.
const CORTES_REFERENCIA = [0.767, 1.0, 1.133, 0.9, 0.7, 0.833];
const PORTADAS = [
  OUTFITS.jeanCeleste[0],
  OUTFITS.vinotintoCafe[0],
  OUTFITS.rojoBlanco[0],
];

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
      <Folder name="Linea01">
        {(Object.keys(OUTFITS) as (keyof typeof OUTFITS)[]).flatMap((outfit) =>
          OUTFITS[outfit].map((_, indice) => (
            <Still
              key={`${outfit}-${indice}`}
              id={`Carrusel-${outfit}-${indice + 1}`}
              component={CarruselSlide}
              schema={carruselSchema}
              width={1080}
              height={1350}
              defaultProps={{ outfit, indice }}
            />
          )),
        )}
        <Composition
          id="ReelFotos"
          component={ReelTransiciones}
          schema={reelSchema}
          calculateMetadata={calcularDuracionReel}
          width={1080}
          height={1920}
          defaultProps={{
            clips: fotosReel.map((f) => ({
              tipo: "foto" as const,
              src: foto(f),
              duracion: 1.2,
              inicio: 0,
            })),
            musica: "",
            volumenMusica: 1,
            transicionFrames: 10,
            mostrarMarca: true,
          }}
        />
        {/* Cambios de outfit en corte seco al ritmo del TikTok de referencia (ssstik ...161).
            Placeholders con fotos hasta tener los .MOV: reemplazar por clips tipo "video". */}
        <Composition
          id="TransicionOutfits"
          component={ReelTransiciones}
          schema={reelSchema}
          calculateMetadata={calcularDuracionReel}
          width={1080}
          height={1920}
          defaultProps={{
            clips: CORTES_REFERENCIA.map((duracion, i) => ({
              tipo: "foto" as const,
              src: foto(PORTADAS[i % PORTADAS.length]),
              duracion,
              inicio: 0,
            })),
            musica: staticFile("linea01/audio/ref_161.wav"),
            volumenMusica: 1,
            transicionFrames: 0,
            mostrarMarca: false,
          }}
        />
        {/* IMG_0684.MOV (mueve los dedos): solo cambia el audio por el del TikTok ssstik ...939. */}
        <Composition
          id="VideoDedos"
          component={ReelTransiciones}
          schema={reelSchema}
          calculateMetadata={calcularDuracionReel}
          width={1080}
          height={1920}
          defaultProps={{
            clips: [
              {
                tipo: "foto" as const,
                src: foto(PORTADAS[0]),
                duracion: 8.67,
                inicio: 0,
              },
            ],
            musica: staticFile("linea01/audio/ref_939.wav"),
            volumenMusica: 1,
            transicionFrames: 0,
            mostrarMarca: false,
          }}
        />
      </Folder>
    </>
  );
};
