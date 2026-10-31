import React from "react";
import { AbsoluteFill, Freeze, Html5Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { CaptionView, CardView, COLORS, Firma, Flash, Progress } from "./Peticion";

// Video de Juan Felipe hecho de tomas a cámara con la voz de seguido (scripts/tomas.py arma el JSON) y
// las reglas fijas del cliente (CLAUDE.md): subtítulos con resaltado amarillo, tarjetas rojas y azules,
// destello en los cortes, sin zooms, firma y barra de duración. Lo usan Derechos y Museo.

type Range = { start: number; end: number };
export type TomasData = {
  fps: number;
  duration: number;
  clips: Record<string, number>;
  scenes: {
    key: string;
    shots: (Range & { src: string })[];
    captions: (Range & { text: string })[];
    cards: (Range & { icon: string; kicker: string; text: string; color: string; bottom?: number })[];
  }[];
};

// Toma cortada en sincronía con la voz; si la escena dura más (cola final), se congela su último cuadro.
const Toma: React.FC<{ dir: string; src: string; dur: number; frames: number }> = ({ dir, src, dur, frames }) => {
  const usable = frames - 1;
  const video = (trim: number) => (
    <OffthreadVideo src={staticFile(`${dir}/${src}.mp4`)} trimBefore={trim} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
  if (dur <= usable) return <AbsoluteFill>{video(0)}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={usable}>{video(0)}</Sequence>
      <Sequence from={usable}>
        <Freeze frame={0}>{video(usable - 1)}</Freeze>
      </Sequence>
    </AbsoluteFill>
  );
};

// «*palabra» = resaltada en amarillo (formato de CaptionView).
const pieces = (text: string) =>
  text.split(" ").map((w, i, all) => ({ t: w.replace("*", "") + (i < all.length - 1 ? " " : ""), y: w.startsWith("*") }));

// dir: carpeta de public/ con las tomas y voz/musica/foley.wav; captionTop: altura de los subtítulos;
// captionBox: subtítulos sobre fondo oscuro translúcido.
export const TomasVideo: React.FC<{ data: TomasData; dir: string; captionTop?: number; captionBox?: boolean }> = ({
  data,
  dir,
  captionTop,
  captionBox,
}) => {
  const f = (s: number) => Math.round(s * data.fps);
  const len = (r: Range) => Math.max(1, f(r.end) - f(r.start));
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Voz (RNNoise + enhance_voice.py, -16 LUFS), música propia ~17 dB abajo y foley alineado. */}
      <Html5Audio src={staticFile(`${dir}/voz.wav`)} />
      <Html5Audio src={staticFile(`${dir}/musica.wav`)} />
      <Html5Audio src={staticFile(`${dir}/foley.wav`)} volume={0.8} />

      {data.scenes.map((sc, i) =>
        sc.shots.map((s) => (
          <Sequence key={`${sc.key}-${s.start}`} from={f(s.start)} durationInFrames={len(s)} premountFor={15}>
            <Toma dir={dir} src={s.src} dur={len(s)} frames={data.clips[s.src]} />
            {i > 0 ? <Flash /> : null}
          </Sequence>
        )),
      )}

      {data.scenes.map((sc) =>
        sc.cards.map((c) => (
          <Sequence key={`card-${c.start}`} from={f(c.start)} durationInFrames={len(c)}>
            <CardView icon={c.icon} kicker={c.kicker} text={c.text} color={COLORS[c.color]} dur={len(c)} bottom={c.bottom} />
          </Sequence>
        )),
      )}

      {data.scenes.map((sc) =>
        sc.captions.map((c) => (
          <Sequence key={`cap-${c.start}`} from={f(c.start)} durationInFrames={len(c)}>
            <CaptionView pieces={pieces(c.text)} dur={len(c)} top={captionTop} boxed={captionBox} />
          </Sequence>
        )),
      )}

      <Firma />
      <Progress />
    </AbsoluteFill>
  );
};
