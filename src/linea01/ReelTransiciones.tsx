import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import {
  linearTiming,
  TransitionSeries,
  type TransitionPresentation,
} from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { pushCut } from "@remotion/transitions/push-cut";
import { fade } from "@remotion/transitions/fade";
import { barrido } from "./barrido";
import { z } from "zod";
import { MARCA } from "./material";
import { fontFamily } from "./fuente";

const clipSchema = z.object({
  tipo: z.enum(["foto", "video"]),
  src: z.string(),
  // Segundos que dura el clip en pantalla.
  duracion: z.number().positive(),
  // Solo videos: segundo del original donde arranca el clip.
  inicio: z.number().min(0).default(0),
});

export const reelSchema = z.object({
  clips: z.array(clipSchema).min(1),
  // Pista de música (en public/). Vacío = sin audio. El audio original de los videos siempre va silenciado.
  musica: z.string().default(""),
  volumenMusica: z.number().min(0).max(1).default(1),
  // 0 = corte seco en el beat (como el TikTok de referencia de cambios de outfit).
  transicionFrames: z.number().int().min(0).default(10),
  mostrarMarca: z.boolean().default(true),
  // "variado" alterna transiciones; "barrido" usa siempre el whip pan con desenfoque.
  estiloTransicion: z.enum(["variado", "barrido"]).default("variado"),
});

type ReelProps = z.infer<typeof reelSchema>;

const TRANSICIONES: TransitionPresentation<Record<string, unknown>>[] = [
  pushCut(),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-bottom-left" }),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-bottom" }),
  fade(),
] as TransitionPresentation<Record<string, unknown>>[];

export const calcularDuracionReel: CalculateMetadataFunction<ReelProps> = ({
  props,
}) => {
  const fps = 30;
  const total = props.clips.reduce(
    (acc, c) => acc + Math.round(c.duracion * fps),
    0,
  );
  const solapes = (props.clips.length - 1) * props.transicionFrames;
  return { durationInFrames: total - solapes, fps };
};

// Foto con zoom lento (Ken Burns) para que no quede estática.
const FotoAnimada: React.FC<{ src: string; par: boolean }> = ({ src, par }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const escala = interpolate(
    frame,
    [0, durationInFrames],
    par ? [1.0, 1.12] : [1.12, 1.0],
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${escala})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ clip: ReelProps["clips"][number]; i: number }> = ({
  clip,
  i,
}) => {
  const { fps } = useVideoConfig();
  if (clip.tipo === "foto") {
    return <FotoAnimada src={clip.src} par={i % 2 === 0} />;
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={clip.src}
        muted
        trimBefore={Math.round(clip.inicio * fps)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

export const ReelTransiciones: React.FC<ReelProps> = ({
  clips,
  musica,
  volumenMusica,
  transicionFrames,
  mostrarMarca,
  estiloTransicion,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {clips.flatMap((clip, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`c${i}`}
              durationInFrames={Math.round(clip.duracion * fps)}
            >
              <Clip clip={clip} i={i} />
            </TransitionSeries.Sequence>,
          ];
          if (i < clips.length - 1 && transicionFrames > 0) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={
                  estiloTransicion === "barrido"
                    ? (barrido() as TransitionPresentation<
                        Record<string, unknown>
                      >)
                    : TRANSICIONES[i % TRANSICIONES.length]
                }
                timing={linearTiming({ durationInFrames: transicionFrames })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
      {mostrarMarca ? (
        <div
          style={{
            position: "absolute",
            top: 140,
            width: "100%",
            textAlign: "center",
            color: "white",
            fontFamily,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 14,
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {MARCA}
        </div>
      ) : null}
      {musica ? <Audio src={musica} volume={volumenMusica} /> : null}
    </AbsoluteFill>
  );
};
