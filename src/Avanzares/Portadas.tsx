import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// 5 portadas alternativas (1080x1920) en rojo y blanco.
// Lo importante queda dentro de la zona central 1080x1350 (y 285-1635) que
// Instagram muestra en la cuadrícula del perfil.

const fontFamily = "Montserrat";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/montserrat-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});

const RED = "#AE2C36";
const RED_DARK = "#7A1A23";
const WHITE = "#FFFFFF";
const LOGO_BLANCO = staticFile("avanzares/logo_blanco.png");
const LOGO_ROJO = staticFile("avanzares/logo_rojo.png");
const foto = (f: string) => staticFile(`avanzares/portadas/${f}`);

const PRODUCTOS = "Arequipes · Cremas de whisky · Vino · Conservas";

const base: React.CSSProperties = {
  fontFamily,
  alignItems: "center",
  textTransform: "uppercase",
};

const Estrellas: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <div style={{ color, fontSize: size, letterSpacing: size * 0.15 }}>★★★★★</div>
);

// 1 · Tipográfico: solo texto grande, sin fotos.
export const Portada1: React.FC = () => (
  <AbsoluteFill style={{ ...base, background: RED }}>
    <Img
      src={LOGO_BLANCO}
      style={{ position: "absolute", top: 300, width: 300 }}
    />
    <div
      style={{
        position: "absolute",
        top: 610,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        fontWeight: 900,
        lineHeight: 0.95,
      }}
    >
      <div style={{ color: WHITE, fontSize: 150 }}>Lo que</div>
      <div
        style={{
          background: WHITE,
          color: RED,
          fontSize: 150,
          padding: "10px 40px 18px",
          borderRadius: 24,
          transform: "rotate(-2deg)",
        }}
      >
        dicen
      </div>
      <div style={{ color: WHITE, fontSize: 112, marginTop: 6 }}>nuestros</div>
      <div style={{ color: WHITE, fontSize: 112 }}>clientes</div>
    </div>
    <div style={{ position: "absolute", top: 1380 }}>
      <Estrellas color={WHITE} size={70} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1500,
        color: WHITE,
        fontWeight: 700,
        fontSize: 29,
        letterSpacing: 1,
        opacity: 0.9,
      }}
    >
      {PRODUCTOS}
    </div>
  </AbsoluteFill>
);

// 2 · Foto del stand a pantalla completa con degradado rojo.
export const Portada2: React.FC = () => (
  <AbsoluteFill style={{ ...base, background: RED }}>
    <Img
      src={foto("pareja_sonrie.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(122,26,35,0.7) 0%, rgba(122,26,35,0) 24%, rgba(122,26,35,0) 60%, ${RED} 80%, ${RED} 100%)`,
      }}
    />
    <Img
      src={LOGO_BLANCO}
      style={{
        position: "absolute",
        top: 300,
        width: 300,
        filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 1250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontWeight: 900,
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: WHITE,
          color: RED,
          fontSize: 44,
          padding: "8px 26px",
          borderRadius: 999,
          letterSpacing: 3,
        }}
      >
        Opiniones reales
      </div>
      <div
        style={{ color: WHITE, fontSize: 104, lineHeight: 1, marginTop: 22 }}
      >
        ¿Qué opinan
      </div>
      <div style={{ color: WHITE, fontSize: 104, lineHeight: 1 }}>
        de Huroban?
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: 1700,
        color: WHITE,
        fontWeight: 700,
        fontSize: 29,
        letterSpacing: 1,
      }}
    >
      {PRODUCTOS}
    </div>
  </AbsoluteFill>
);

// 3 · Testimonio grande sobre fondo blanco.
export const Portada3: React.FC = () => (
  <AbsoluteFill style={{ ...base, background: WHITE }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        width: "100%",
        height: 230,
        background: RED,
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 230,
        background: RED,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 300,
        color: RED,
        fontWeight: 900,
        fontSize: 300,
        lineHeight: 1,
        fontFamily: "Georgia, serif",
      }}
    >
      “
    </div>
    <div
      style={{
        position: "absolute",
        top: 560,
        width: 900,
        textAlign: "center",
        color: RED,
        fontWeight: 900,
        fontSize: 100,
        lineHeight: 1.05,
      }}
    >
      Lo mejor que he probado en mi vida
    </div>
    <div
      style={{
        position: "absolute",
        top: 1060,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <Estrellas color={RED} size={64} />
      <div
        style={{
          color: "#3A3A3A",
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: 3,
        }}
      >
        — Cristian, cliente
      </div>
    </div>
    <Img
      src={LOGO_ROJO}
      style={{ position: "absolute", top: 1300, width: 330 }}
    />
  </AbsoluteFill>
);

// 4 · Burbujas de reseñas con estrellas.
const RESENAS: { texto: string; lado: "izq" | "der" }[] = [
  { texto: "¡El whisky de café es súper delicioso!", lado: "izq" },
  { texto: "Lo mejor que he probado en mi vida", lado: "der" },
  { texto: "100% recomendado", lado: "izq" },
  { texto: "Productos muy sabrosos", lado: "der" },
];

export const Portada4: React.FC = () => (
  <AbsoluteFill
    style={{
      ...base,
      background: `radial-gradient(circle at 50% 45%, ${RED} 0%, ${RED} 50%, ${RED_DARK} 100%)`,
    }}
  >
    <Img
      src={LOGO_BLANCO}
      style={{ position: "absolute", top: 295, width: 250 }}
    />
    <div
      style={{
        position: "absolute",
        top: 545,
        color: WHITE,
        fontWeight: 900,
        fontSize: 76,
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      ¿Qué dicen de nosotros?
    </div>
    <div
      style={{
        position: "absolute",
        top: 720,
        width: 920,
        display: "flex",
        flexDirection: "column",
        gap: 34,
      }}
    >
      {RESENAS.map((r, i) => (
        <div
          key={r.texto}
          style={{
            alignSelf: r.lado === "izq" ? "flex-start" : "flex-end",
            maxWidth: 700,
            background: WHITE,
            color: "#222",
            borderRadius: 36,
            borderBottomLeftRadius: r.lado === "izq" ? 6 : 36,
            borderBottomRightRadius: r.lado === "der" ? 6 : 36,
            padding: "22px 34px 24px",
            boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
            transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
            textTransform: "none",
          }}
        >
          <Estrellas color={RED} size={34} />
          <div
            style={{
              fontWeight: 800,
              fontSize: 44,
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            {r.texto}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1700,
        color: WHITE,
        fontWeight: 700,
        fontSize: 29,
        letterSpacing: 1,
      }}
    >
      {PRODUCTOS}
    </div>
  </AbsoluteFill>
);

// 5 · Foto de productos arriba, bloque rojo abajo.
export const Portada5: React.FC = () => (
  <AbsoluteFill style={{ ...base, background: RED }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        width: "100%",
        height: 1080,
        overflow: "hidden",
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
      }}
    >
      <Img
        src={foto("productos_mesa.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 60%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 60%)",
        }}
      />
    </div>
    <Img
      src={LOGO_BLANCO}
      style={{
        position: "absolute",
        top: 300,
        width: 260,
        filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 1015,
        background: WHITE,
        color: RED,
        fontWeight: 900,
        fontSize: 52,
        padding: "14px 40px",
        borderRadius: 999,
        letterSpacing: 2,
        boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
      }}
    >
      100% recomendado
    </div>
    <div
      style={{
        position: "absolute",
        top: 1150,
        color: WHITE,
        fontWeight: 900,
        fontSize: 96,
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      Nuestros clientes
      <br />
      lo dicen
    </div>
    <div style={{ position: "absolute", top: 1490 }}>
      <Estrellas color={WHITE} size={60} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1700,
        color: WHITE,
        fontWeight: 700,
        fontSize: 29,
        letterSpacing: 1,
      }}
    >
      {PRODUCTOS}
    </div>
  </AbsoluteFill>
);
