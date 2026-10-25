import React from "react";
import { AbsoluteFill, Freeze, Html5Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import raw from "./derechos.json";
import { CaptionView, CardView, COLORS, Firma, Flash, Progress } from "./Peticion";

// Video de Juan Felipe «¿Dónde acudir cuando te vulneran tus derechos?»: cinco tomas a cámara con la voz
// de seguido (scripts/build_derechos.py, tiempos en derechos.json) y las reglas fijas del cliente
// (CLAUDE.md): subtítulos con resaltado amarillo, tarjetas rojas y azules a la altura del pecho,
// destello en los cortes, sin zooms, firma y barra de duración.

export const DERECHOS_FPS = raw.fps;
export const derechosDuration = Math.round(raw.duration * raw.fps);

const f = (s: number) => Math.round(s * DERECHOS_FPS);
const CLIP_FRAMES: Record<string, number> = raw.clips;

// Toma cortada en sincronía con la voz; si la escena dura más (cola final), se congela su último cuadro.
const Toma: React.FC<{ src: string; dur: number }> = ({ src, dur }) => {
  const usable = CLIP_FRAMES[src] - 1;
  const video = (trim: number) => (
    <OffthreadVideo src={staticFile(`jf2/${src}.mp4`)} trimBefore={trim} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

export const Derechos: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {/* Voz (RNNoise + enhance_voice.py, -16 LUFS), música propia ~17 dB abajo y foley alineado. */}
    <Html5Audio src={staticFile("jf2/voz.wav")} />
    <Html5Audio src={staticFile("jf2/musica.wav")} />
    <Html5Audio src={staticFile("jf2/foley.wav")} volume={0.8} />

    {raw.scenes.map((sc, i) =>
      sc.shots.map((s) => (
        <Sequence key={`${sc.key}-${s.start}`} from={f(s.start)} durationInFrames={Math.max(1, f(s.end) - f(s.start))} premountFor={15}>
          <Toma src={s.src} dur={f(s.end) - f(s.start)} />
          {i > 0 ? <Flash /> : null}
        </Sequence>
      )),
    )}

    {raw.scenes.map((sc) =>
      sc.cards.map((c) => (
        <Sequence key={`card-${c.start}`} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
          <CardView icon={c.icon} kicker={c.kicker} text={c.text} color={COLORS[c.color]} dur={Math.max(1, f(c.end) - f(c.start))} />
        </Sequence>
      )),
    )}

    {raw.scenes.map((sc) =>
      sc.captions.map((c) => (
        <Sequence key={`cap-${c.start}`} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
          <CaptionView pieces={pieces(c.text)} dur={Math.max(1, f(c.end) - f(c.start))} />
        </Sequence>
      )),
    )}

    <Firma />
    <Progress />
  </AbsoluteFill>
);
