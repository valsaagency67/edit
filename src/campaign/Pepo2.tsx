import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Montserrat } from "./font";
import raw from "./pepo2.json";
import { TomasData, TomasVideo } from "./Tomas";

// IVA a la canasta familiar en la «ley de rescate» de Abelardo (carpeta de Drive «Pepo 2», scripts/build_pepo2.py),
// con el estilo de los videos de Óscar Benavides (media/ref/referencia-6.mp4): el gancho en blanco y negro y
// después color, subtítulos blancos sin resaltar, la cara de Abelardo recortada cuando se le nombra y animaciones
// sencillas (un emoji que salta con una etiqueta) según lo que dice. Muy pocos efectos de sonido.

type Win = { start: number; end: number; label: string; emoji?: string };
const data = raw as unknown as TomasData & { stickers: Win[]; abelardo: Win[] };
const FPS = data.fps;
const f = (s: number) => Math.round(s * FPS);
const RED = "#E30613";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const PEPO2_FPS = FPS;
export const pepo2Duration = Math.round(data.duration * FPS);

// Emoji grande que entra con rebote y flota, con una etiqueta blanca; a la derecha, a la altura del pecho, sin
// tapar la cara.
const Sticker: React.FC<{ w: Win; dur: number }> = ({ w, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 9, stiffness: 170 } });
  const out = interpolate(frame, [dur - 5, dur], [1, 0], clamp);
  const float = Math.sin(frame / 8) * 10;
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 780,
        width: 380,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: out,
        transform: `translateY(${float}px) scale(${0.3 + 0.7 * k}) rotate(${(1 - k) * 18}deg)`,
      }}
    >
      <div style={{ fontFamily: "'Noto Color Emoji'", fontSize: 210, lineHeight: 1.1, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.45))" }}>
        {w.emoji}
      </div>
      <div
        style={{
          marginTop: 6,
          background: "white",
          color: "#111",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 38,
          padding: "8px 20px",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {w.label}
      </div>
    </div>
  );
};

// Cara de Abelardo recortada: entra desde abajo a la izquierda con un rebote, con su nombre en rojo.
const Abelardo: React.FC<{ w: Win; dur: number }> = ({ w, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const out = interpolate(frame, [dur - 5, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 700,
        width: 440,
        opacity: out,
        transform: `translateY(${(1 - k) * 260}px) rotate(${(1 - k) * -8}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("pepo2/fotos/abelardo.png")}
        style={{ width: 440, filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.55))" }}
      />
      <div
        style={{
          marginTop: -24,
          background: RED,
          color: "white",
          fontFamily: Montserrat,
          fontWeight: 800,
          fontSize: 32,
          padding: "8px 18px",
          borderRadius: 10,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}
      >
        {w.label}
      </div>
    </div>
  );
};

export const Pepo2: React.FC = () => {
  const seq = (w: Win, key: string, node: (dur: number) => React.ReactNode) => {
    const dur = Math.max(1, f(w.end) - f(w.start));
    return (
      <Sequence key={key} from={f(w.start)} durationInFrames={dur}>
        {node(dur)}
      </Sequence>
    );
  };
  return (
    <TomasVideo
      data={data}
      dir="pepo2"
      captionTop={1360}
      captionBena
      punch={1.16}
      punchOrigin="50% 30%"
      overlay={
        <AbsoluteFill>
          {data.stickers.map((w, i) => seq(w, `s${i}`, (d) => <Sticker w={w} dur={d} />))}
          {data.abelardo.map((w, i) => seq(w, `a${i}`, (d) => <Abelardo w={w} dur={d} />))}
        </AbsoluteFill>
      }
    />
  );
};
