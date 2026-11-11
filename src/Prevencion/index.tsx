import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { getVideoMetadata } from "@remotion/media-utils";
import React, { useEffect, useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { CLIPS, Clip, OUTRO_SECONDS } from "./data";
import { loadPrevencionFonts } from "./fonts";
import { clipFrames, FPS, getCuts, toFrame } from "./timing";
import {
  BRollImage,
  CaptionPage,
  Chips,
  LineaAtencion,
  Outro,
  PointCard,
  ProgressBar,
  StampOverlay,
  TitleChip,
} from "./Overlays";

export { FPS };

export const prevencionSchema = z.object({
  /** Líneas de atención (no se dicen en los clips; las envía el cliente). */
  lineasAtencion: z.array(z.object({ nombre: z.string(), numero: z.string() })),
  /** Video del caso real (ruta dentro de public/). Vacío = se omite. */
  casoSrc: z.string(),
  /** Calculado automáticamente a partir de casoSrc. */
  casoSeconds: z.number(),
});

type Props = z.infer<typeof prevencionSchema>;

type Segment =
  | { kind: "clip"; clip: Clip; from: number; duration: number }
  | { kind: "caso"; src: string; from: number; duration: number }
  | { kind: "outro"; from: number; duration: number };

const buildTimeline = (props: Props): Segment[] => {
  const out: Segment[] = [];
  let cursor = 0;
  CLIPS.forEach((clip, i) => {
    const duration = clipFrames(clip);
    out.push({ kind: "clip", clip, from: cursor, duration });
    cursor += duration;
    // El caso real va justo después de la introducción ("A continuación te
    // voy a presentar un caso...").
    if (i === 0 && props.casoSrc && props.casoSeconds > 0) {
      const d = Math.round(props.casoSeconds * FPS);
      out.push({ kind: "caso", src: props.casoSrc, from: cursor, duration: d });
      cursor += d;
    }
  });
  out.push({
    kind: "outro",
    from: cursor,
    duration: Math.round(OUTRO_SECONDS * FPS),
  });
  return out;
};

const totalFrames = (segments: Segment[]) => {
  const last = segments[segments.length - 1];
  return last.from + last.duration;
};

export const calculatePrevencionMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  let casoSeconds = 0;
  if (props.casoSrc) {
    const meta = await getVideoMetadata(staticFile(props.casoSrc));
    casoSeconds = meta.durationInSeconds;
  }
  const next = { ...props, casoSeconds };
  return {
    fps: FPS,
    durationInFrames: totalFrames(buildTimeline(next)),
    props: next,
  };
};

/** Entrada de cada corte: zoom + desenfoque + destello. */
const TRANSITION = 7;

const ClipSegment: React.FC<{
  readonly clip: Clip;
  readonly duration: number;
  readonly lineas: readonly LineaAtencion[];
}> = ({ clip, duration, lineas }) => {
  const frame = useCurrentFrame();
  const cuts = useMemo(() => getCuts(clip), [clip]);

  const punch = clip.punches.reduce((acc, s) => {
    const d = frame - toFrame(clip, s);
    return (
      acc +
      interpolate(d, [0, 3, 14], [0, 0.07, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  }, 0);

  const push = interpolate(frame, [0, duration], [0, 0.05]);
  const enter = interpolate(frame, [0, TRANSITION], [0.2, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const blur = interpolate(frame, [0, 5], [10, 0], {
    extrapolateRight: "clamp",
  });

  const stampFrames = clip.stamps.map((s) => ({
    ...s,
    start: toFrame(clip, s.from),
    end: toFrame(clip, s.to),
  }));

  const shake = stampFrames.reduce((acc, s) => {
    const d = frame - s.start;
    if (d < 0 || d > 9) {
      return acc;
    }
    return acc + Math.sin(d * 2.6) * 18 * (1 - d / 9);
  }, 0);

  // Los subtítulos se ocultan mientras hay un sello.
  const stampActive = stampFrames.some(
    (s) => frame >= s.start && frame < s.end,
  );

  const pages = useMemo(() => {
    const captions: Caption[] = clip.words.map(([text, start, end], i) => ({
      text: (i === 0 ? "" : " ") + text,
      startMs: (toFrame(clip, start) / FPS) * 1000,
      endMs:
        (Math.max(toFrame(clip, end), toFrame(clip, start) + 2) / FPS) * 1000,
      timestampMs: null,
      confidence: 1,
    }));
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 900,
    }).pages;
  }, [clip]);

  const durationMs = (duration / FPS) * 1000;

  const brolls = (clip.broll ?? []).map((b) => {
    const from = toFrame(clip, b.from);
    return { ...b, from, duration: Math.max(1, toFrame(clip, b.to) - from) };
  });

  const validas = lineas.filter((l) => l.numero.trim() !== "");
  const pointers = (clip.pointers ?? []).map((ptr) => {
    const from = toFrame(clip, ptr.at);
    return {
      ...ptr,
      from,
      duration: Math.max(1, toFrame(clip, ptr.to) - from),
      // undefined = esta línea no existe (no se muestra); null = pendiente.
      card: validas.length === 0 ? null : (validas[ptr.linea] ?? undefined),
    };
  });

  const chips = clip.chips.map((c) => ({
    text: c.text,
    tone: c.tone,
    frame: toFrame(clip, c.at),
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateX(${shake}px) scale(${clip.baseZoom + push + punch + enter})`,
          transformOrigin: "50% 30%",
          filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        }}
      >
        {cuts.map((cut, i) => (
          <Sequence
            key={cut.start}
            from={cut.from}
            durationInFrames={cut.duration}
            premountFor={15}
          >
            {/* Cada salto cambia un poco el encuadre para disimular el corte. */}
            <AbsoluteFill
              style={{
                transform: `scale(${i % 2 === 1 ? 1.09 : 1})`,
                transformOrigin: "50% 30%",
              }}
            >
              <OffthreadVideo
                src={staticFile(clip.src)}
                trimBefore={Math.round(cut.start * FPS)}
                // Micro-fundido para que los cortes no hagan "clic".
                volume={(f) =>
                  interpolate(
                    f,
                    [0, 2, cut.duration - 3, cut.duration - 1],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  )
                }
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </Sequence>
        ))}

        {/* Dentro del zoom, para que sigan al dedo. */}
        {pointers.map((ptr) =>
          ptr.card === undefined ? null : (
            <Sequence
              key={`ptr-${ptr.at}`}
              from={ptr.from}
              durationInFrames={ptr.duration}
            >
              <PointCard linea={ptr.card} x={ptr.x} y={ptr.y} />
            </Sequence>
          ),
        )}
      </AbsoluteFill>

      {/* Imágenes de apoyo: cubren el video, la voz sigue debajo. */}
      {brolls.map((b) => (
        <Sequence key={b.src} from={b.from} durationInFrames={b.duration}>
          <BRollImage src={b.src} duration={b.duration} />
        </Sequence>
      ))}

      {/* Viñeta para que el texto respire */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <TitleChip text={clip.title} />

      {pages.map((page, i) => {
        const next = pages[i + 1];
        const start = Math.round((page.startMs / 1000) * FPS);
        const endMs = Math.min(
          next ? next.startMs : durationMs,
          page.startMs + page.durationMs + 500,
        );
        const end = Math.round((endMs / 1000) * FPS);
        if (end <= start) {
          return null;
        }
        return (
          <Sequence
            key={page.startMs}
            from={start}
            durationInFrames={end - start}
            layout="none"
          >
            <CaptionPage page={page} hidden={stampActive} />
          </Sequence>
        );
      })}

      <Chips chips={chips} />

      {stampFrames.map((s) => (
        <Sequence
          key={s.text}
          from={s.start}
          durationInFrames={s.end - s.start}
        >
          <StampOverlay text={s.text} />
        </Sequence>
      ))}

      {/* Destello del corte */}
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: interpolate(frame, [0, 5], [0.6, 0], {
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Efectos de sonido (generados, sin licencias de terceros) */}
      {chips.map((c) => (
        <Sequence key={`pop-${c.text}`} from={c.frame} durationInFrames={8}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      ))}
      {brolls.map((b) => (
        <Sequence
          key={`whoosh-${b.src}`}
          from={Math.max(0, b.from - 3)}
          durationInFrames={14}
        >
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
      {pointers.map((ptr) => (
        <Sequence
          key={`pop-ptr-${ptr.at}`}
          from={ptr.from}
          durationInFrames={8}
        >
          <Audio src={staticFile("sfx/pop.wav")} volume={0.5} />
        </Sequence>
      ))}
      {stampFrames.map((s) => (
        <Sequence key={`impact-${s.text}`} from={s.start} durationInFrames={14}>
          <Audio src={staticFile("sfx/impact.wav")} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const CasoSegment: React.FC<{ readonly src: string }> = ({ src }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Fondo desenfocado: el video es casi cuadrado y la pantalla vertical. */}
    <AbsoluteFill
      style={{ filter: "blur(40px) brightness(0.5)", transform: "scale(1.3)" }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 1000,
          height: 938,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
    <TitleChip text="CASO EN COLOMBIA" top={300} />
  </AbsoluteFill>
);

export const Prevencion: React.FC<Props> = (props) => {
  useEffect(() => {
    loadPrevencionFonts();
  }, []);

  const segments = useMemo(() => buildTimeline(props), [props]);
  const total = totalFrames(segments);
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {segments.map((seg) => (
        <Sequence
          key={`${seg.kind}-${seg.from}`}
          from={seg.from}
          durationInFrames={seg.duration}
          premountFor={fps}
        >
          {seg.kind === "clip" ? (
            <ClipSegment
              clip={seg.clip}
              duration={seg.duration}
              lineas={props.lineasAtencion}
            />
          ) : seg.kind === "caso" ? (
            <CasoSegment src={seg.src} />
          ) : (
            <Outro lineas={props.lineasAtencion} />
          )}
        </Sequence>
      ))}

      {/* Whoosh antes de cada corte */}
      {segments.slice(1).map((seg) => (
        <Sequence
          key={`whoosh-${seg.from}`}
          from={Math.max(0, seg.from - 6)}
          durationInFrames={14}
        >
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}

      <ProgressBar total={total} />
    </AbsoluteFill>
  );
};
