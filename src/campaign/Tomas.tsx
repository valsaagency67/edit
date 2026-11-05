import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CaptionView,
  CardView,
  COLORS,
  Firma,
  Flash,
  Progress,
} from "./Peticion";
import { Bebas, Montserrat } from "./font";

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
    cards: (Range & {
      icon: string;
      kicker: string;
      text: string;
      color: string;
      bottom?: number;
    })[];
    // img: foto en public/<dir>/fotos/; o emoji + label: imagen animada hecha con un ícono grande.
    photos?: (Range & { img?: string; emoji?: string; label?: string })[];
    effects?: (Range & { gray?: boolean; distort?: boolean })[];
    kinetic?: (Range & { text: string; color: string })[];
  }[];
  outro?: Range & { kicker: string; text: string };
};

// Toma cortada en sincronía con la voz; si la escena dura más (cola final), se congela su último cuadro.
const Toma: React.FC<{
  dir: string;
  src: string;
  dur: number;
  frames: number;
}> = ({ dir, src, dur, frames }) => {
  const usable = frames - 1;
  const video = (trim: number) => (
    <OffthreadVideo
      src={staticFile(`${dir}/${src}.mp4`)}
      trimBefore={trim}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
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

// Foto de apoyo (las manda el cliente, en public/<dir>/fotos/): la toma sigue detrás oscurecida y la foto
// entra y sale con desenfoque, centrada en y=1150 con borde blanco. Entre fotos seguidas no hay fundido.
const IO = 6;
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
// Imagen animada para una palabra clave sin foto (el cliente pidió imágenes de lo que va diciendo): tarjeta
// blanca con un ícono grande que entra con rebote y flota, y la palabra en Bebas sobre rojo.
const Ilustracion: React.FC<{ emoji: string; label: string }> = ({
  emoji,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const float = Math.sin(frame / 7) * 12;
  return (
    <div
      style={{
        width: 620,
        borderRadius: 28,
        border: "10px solid white",
        background:
          "radial-gradient(circle at 50% 35%, #FFF6C9 0%, #FCD116 55%, #F39200 100%)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Noto Color Emoji'",
          fontSize: 280,
          lineHeight: 1.15,
          paddingTop: 30,
          transform: `translateY(${float}px) scale(${0.5 + 0.5 * pop}) rotate(${(1 - pop) * -20}deg)`,
          filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.3))",
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          alignSelf: "stretch",
          marginTop: 20,
          background: COLORS.red,
          color: "white",
          fontFamily: Bebas,
          fontSize: 92,
          lineHeight: 1,
          padding: "16px 20px 6px",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const PhotoView: React.FC<{
  src?: string;
  emoji?: string;
  label?: string;
  dur: number;
  fadeIn: boolean;
  fadeOut: boolean;
  center: number;
}> = ({ src, emoji, label, dur, fadeIn, fadeOut, center }) => {
  const frame = useCurrentFrame();
  const inn = fadeIn ? interpolate(frame, [0, IO], [0, 1], clamp) : 1;
  const out = fadeOut ? interpolate(frame, [dur - IO, dur], [1, 0], clamp) : 1;
  const o = Math.min(inn, out);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "black", opacity: 0.6 * o }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          top: center - 960, // la capa mide 1920: su centro queda en «center»
          opacity: o,
          filter: `blur(${(1 - o) * 12}px)`,
        }}
      >
        {emoji ? (
          <Ilustracion emoji={emoji} label={label ?? ""} />
        ) : (
          <Img
            src={staticFile(src ?? "")}
            style={{
              border: "10px solid white",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Escrito final sobre el último cuadro congelado (oscurecido): la frase en blanco y la consigna en Bebas
// sobre rojo; entra con desenfoque y se queda hasta el final.
const Outro: React.FC<{ kicker: string; text: string }> = ({
  kicker,
  text,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, IO + 2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "black", opacity: 0.55 * o }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 18,
          opacity: o,
          filter: `blur(${(1 - o) * 12}px)`,
        }}
      >
        <div
          style={{
            fontFamily: Montserrat,
            fontWeight: 600,
            fontSize: 76,
            color: "white",
            textShadow: "0 4px 18px rgba(0,0,0,0.6)",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            maxWidth: 940,
            fontFamily: Bebas,
            fontSize: 150,
            lineHeight: 1.02,
            color: "white",
            background: COLORS.red,
            padding: "8px 34px 0",
            textTransform: "uppercase",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Palabra clave animada (donde no hay foto ni tarjeta): bloque en Bebas sobre rojo o azul, arriba de la
// cabeza (y=110). Entra con desenfoque y un desliz corto hacia arriba (sin zoom) y sale con fundido.
const KineticView: React.FC<{ text: string; color: string; dur: number }> = ({
  text,
  color,
  dur,
}) => {
  const frame = useCurrentFrame();
  const o = Math.min(
    interpolate(frame, [0, IO], [0, 1], clamp),
    interpolate(frame, [dur - 5, dur], [1, 0], clamp),
  );
  const y = interpolate(frame, [0, IO], [30, 0], clamp);
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "flex-start", top: 110 }}
    >
      <div
        style={{
          opacity: o,
          filter: `blur(${(1 - o) * 10}px)`,
          transform: `translateY(${y}px) rotate(-2deg)`,
          fontFamily: Bebas,
          fontSize: 130,
          lineHeight: 1,
          color: "white",
          background: color,
          padding: "10px 36px 0",
          textTransform: "uppercase",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// «*palabra» = resaltada en amarillo (formato de CaptionView).
const pieces = (text: string) =>
  text.split(" ").map((w, i, all) => ({
    t: w.replace("*", "") + (i < all.length - 1 ? " " : ""),
    y: w.startsWith("*"),
  }));

// dir: carpeta de public/ con las tomas y voz/musica/foley.wav; captionTop: altura de los subtítulos;
// captionBox: subtítulos sobre fondo oscuro translúcido; captionPop: las palabras en amarillo saltan;
// photoCenter: altura del centro de las fotos de apoyo.
// Los tramos «effects» con gray pasan la toma a blanco y negro (la voz se distorsiona en el armado).
export const TomasVideo: React.FC<{
  data: TomasData;
  dir: string;
  captionTop?: number;
  captionBox?: boolean;
  captionPop?: boolean;
  photoCenter?: number;
}> = ({
  data,
  dir,
  captionTop,
  captionBox,
  captionPop,
  photoCenter = 1150,
}) => {
  const frame = useCurrentFrame();
  const f = (s: number) => Math.round(s * data.fps);
  const gray = data.scenes.some((sc) =>
    (sc.effects ?? []).some(
      (e) => e.gray && frame >= f(e.start) && frame < f(e.end),
    ),
  );
  const len = (r: Range) => Math.max(1, f(r.end) - f(r.start));
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Voz (RNNoise + enhance_voice.py, -16 LUFS), música propia ~17 dB abajo y foley alineado. */}
      <Html5Audio src={staticFile(`${dir}/voz.wav`)} />
      <Html5Audio src={staticFile(`${dir}/musica.wav`)} />
      <Html5Audio src={staticFile(`${dir}/foley.wav`)} volume={0.8} />

      <AbsoluteFill
        style={{ filter: gray ? "grayscale(1) contrast(1.15)" : undefined }}
      >
        {data.scenes.map((sc, i) =>
          sc.shots.map((s) => (
            <Sequence
              key={`${sc.key}-${s.start}`}
              from={f(s.start)}
              durationInFrames={len(s)}
              premountFor={15}
            >
              <Toma
                dir={dir}
                src={s.src}
                dur={len(s)}
                frames={data.clips[s.src]}
              />
              {i > 0 ? <Flash /> : null}
            </Sequence>
          )),
        )}
      </AbsoluteFill>

      {data.scenes.map((sc) =>
        (sc.photos ?? []).map((p, k, all) => (
          <Sequence
            key={`photo-${p.start}`}
            from={f(p.start)}
            durationInFrames={len(p)}
          >
            <PhotoView
              src={p.img ? `${dir}/fotos/${p.img}.jpg` : undefined}
              emoji={p.emoji}
              label={p.label}
              dur={len(p)}
              fadeIn={k === 0 || f(all[k - 1].end) !== f(p.start)}
              fadeOut={k === all.length - 1 || f(all[k + 1].start) !== f(p.end)}
              center={photoCenter}
            />
          </Sequence>
        )),
      )}

      {data.scenes.map((sc) =>
        (sc.kinetic ?? []).map((k) => (
          <Sequence
            key={`kin-${k.start}`}
            from={f(k.start)}
            durationInFrames={len(k)}
          >
            <KineticView text={k.text} color={COLORS[k.color]} dur={len(k)} />
          </Sequence>
        )),
      )}

      {data.scenes.map((sc) =>
        sc.cards.map((c) => (
          <Sequence
            key={`card-${c.start}`}
            from={f(c.start)}
            durationInFrames={len(c)}
          >
            <CardView
              icon={c.icon}
              kicker={c.kicker}
              text={c.text}
              color={COLORS[c.color]}
              dur={len(c)}
              bottom={c.bottom}
            />
          </Sequence>
        )),
      )}

      {data.scenes.map((sc) =>
        sc.captions.map((c) => (
          <Sequence
            key={`cap-${c.start}`}
            from={f(c.start)}
            durationInFrames={len(c)}
          >
            <CaptionView
              pieces={pieces(c.text)}
              dur={len(c)}
              top={captionTop}
              boxed={captionBox}
              pop={captionPop}
            />
          </Sequence>
        )),
      )}

      {data.outro ? (
        <Sequence from={f(data.outro.start)} durationInFrames={len(data.outro)}>
          <Outro kicker={data.outro.kicker} text={data.outro.text} />
        </Sequence>
      ) : null}

      <Firma />
      <Progress />
    </AbsoluteFill>
  );
};
