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
// Son 5 outfits, así que el último plano se queda con los dos tramos finales (0.7 + 0.833).
const CORTES_REFERENCIA = [0.767, 1.0, 1.133, 0.9, 1.533];
// Tramos ya recortados de los .MOV a 1080x1920 sin audio (ver LINEA01.md), con el encuadre igualado.
const CLIPS_OUTFITS = [
  "IMG_0595", // celeste + jean
  "IMG_0552", // amarillo + jean
  "IMG_0553", // rojo + jean
  "IMG_0676", // vinotinto + café
  "IMG_0703", // blanco/rojo + leggins rojo
];
const clip = (nombre: string) => staticFile(`linea01/clips/${nombre}.mp4`);

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
        {/* Cambios de outfit en corte seco al ritmo del TikTok de referencia (ssstik ...161). */}
        <Composition
          id="TransicionOutfits"
          component={ReelTransiciones}
          schema={reelSchema}
          calculateMetadata={calcularDuracionReel}
          width={1080}
          height={1920}
          defaultProps={{
            clips: CORTES_REFERENCIA.map((duracion, i) => ({
              tipo: "video" as const,
              src: clip(CLIPS_OUTFITS[i]),
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
                tipo: "video" as const,
                src: clip("IMG_0684"),
                duracion: 8.67,
                // La mano se aparta ~0.5 s después que en la referencia: así el "reveal" cae igual.
                inicio: 0.5,
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
