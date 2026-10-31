import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Anton, Bebas, Montserrat } from "./font";
import { Bandera } from "./Peticion";

// Carrusel de Instagram (1080x1350, 4:5) sobre el IVA a la canasta en la «Ley de Rescate Económico» del
// gobierno De la Espriella, radicada el 29 de octubre de 2026. Datos de prensa (La Silla Vacía, El Tiempo,
// Portafolio, Publimetro, Blu Radio, Infobae): desde el 1 de enero de 2028 desaparece la tarifa del 5 %
// (café, azúcar, aceites, pastas, chocolate de mesa pasan al 19 %) y salen de los excluidos frutas y
// verduras frescas, granos secos, sal y maíz. Es un proyecto: falta el trámite en el Congreso. Cada lámina
// es una composición (IVA-1 … IVA-7); npm run render:carrusel-iva.
export const RED = "#E30613";
export const BLUE = "#1D3E9E";
export const YELLOW = "#FCD116";
export const NAVY = "#0B1736";
export const SHADOW = "0 6px 22px rgba(0,0,0,0.55)";
export const EMOJI = "'Noto Color Emoji'";
export const IVA_SLIDES = 7;

// Fondo común de los carruseles: degradado azul noche, franja de la bandera, numeración n/total y firma.
export const Fondo: React.FC<{
  children: React.ReactNode;
  n: number;
  total?: number;
}> = ({ children, n, total = IVA_SLIDES }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 80% 10%, #1F3B8C 0%, ${NAVY} 55%, #050B1D 100%)`,
      color: "white",
      fontFamily: Montserrat,
    }}
  >
    {/* Franja de la bandera arriba y numeración. */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <Bandera height={14} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 46,
        right: 56,
        fontWeight: 700,
        fontSize: 30,
        opacity: 0.7,
      }}
    >
      {n}/{total}
    </div>
    {children}
    <div
      style={{
        position: "absolute",
        left: 64,
        bottom: 56,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: Anton,
          fontSize: 40,
          lineHeight: 1,
          color: "white",
        }}
      >
        Juan Felipe Castaño
      </div>
      <Bandera height={6} />
    </div>
  </AbsoluteFill>
);

// Bloque de titular en Bebas: fondo de color, levemente inclinado (estilo cartel).
export const Bloque: React.FC<{
  bg: string;
  color?: string;
  size: number;
  tilt?: number;
  children: React.ReactNode;
}> = ({ bg, color = "white", size, tilt = 0, children }) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: Bebas,
      fontSize: size,
      lineHeight: 0.95,
      padding: `${size * 0.06}px ${size * 0.16}px 0`,
      transform: `rotate(${tilt}deg)`,
      boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
    }}
  >
    {children}
  </div>
);

export type Item = { e: string; t: string };
export const Fichas: React.FC<{
  items: Item[];
  cols: number;
  size?: number;
  tag?: string;
  tagBg?: string;
}> = ({ items, cols, size = 220, tag, tagBg = RED }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gap: 22,
      justifyContent: "center",
    }}
  >
    {items.map((it) => (
      <div
        key={it.t}
        style={{
          position: "relative",
          height: size,
          borderRadius: 22,
          background: "rgba(255,255,255,0.07)",
          border: `3px solid ${YELLOW}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{ fontFamily: EMOJI, fontSize: size * 0.42, lineHeight: 1 }}
        >
          {it.e}
        </div>
        <div
          style={{
            fontFamily: Montserrat,
            fontWeight: 800,
            fontSize: size * 0.12,
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {it.t}
        </div>
        {tag ? (
          <div
            style={{
              position: "absolute",
              top: -16,
              right: -12,
              background: tagBg,
              color: "white",
              fontFamily: Bebas,
              fontSize: size * 0.2,
              padding: "2px 12px 0",
              borderRadius: 8,
              transform: "rotate(6deg)",
            }}
          >
            {tag}
          </div>
        ) : null}
      </div>
    ))}
  </div>
);

export const Nota: React.FC<{ children: React.ReactNode; bottom?: number }> = ({
  children,
  bottom = 150,
}) => (
  <div
    style={{
      position: "absolute",
      left: 64,
      right: 64,
      bottom,
      fontSize: 26,
      fontWeight: 500,
      opacity: 0.75,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

// Juan Felipe con camisa (recorte del final de IMG_0744, el de la portada de Derechos: serio, puños al
// pecho), a la derecha, de la cabeza a la cintura; el borde de abajo se desvanece.
export const JFCamisa: React.FC<{
  top: number;
  right?: number;
  height?: number;
}> = ({ top, right = -40, height = 1500 }) => (
  <Img
    src={staticFile("cover/iva-jf.png")}
    style={{
      position: "absolute",
      height,
      right,
      top,
      maskImage: "linear-gradient(180deg, black 38%, transparent 52%)",
      WebkitMaskImage: "linear-gradient(180deg, black 38%, transparent 52%)",
      filter: "drop-shadow(0 0 30px rgba(252,209,22,0.5))",
    }}
  />
);

const Portada: React.FC = () => (
  <Fondo n={1}>
    <JFCamisa top={640} />
    <div style={{ position: "absolute", top: 110, left: 64, right: 64 }}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        Ley de Rescate de Abelardo
      </div>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 150,
          lineHeight: 0.9,
          marginTop: 14,
          textShadow: SHADOW,
        }}
      >
        LE QUIEREN PONER
      </div>
      <div style={{ marginTop: 12 }}>
        <Bloque bg={YELLOW} color={NAVY} size={230} tilt={-2}>
          IVA DEL 19%
        </Bloque>
      </div>
      <div style={{ marginTop: 18 }}>
        <Bloque bg={RED} size={150} tilt={-2}>
          A TU MERCADO
        </Bloque>
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 730,
        display: "grid",
        gridTemplateColumns: "repeat(2, 130px)",
        gap: 14,
      }}
    >
      {["☕", "🍅", "🧅", "🫘", "🍝", "🍫"].map((e) => (
        <div
          key={e}
          style={{
            height: 130,
            borderRadius: 18,
            background: "rgba(255,255,255,0.08)",
            border: `3px solid ${YELLOW}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: EMOJI,
            fontSize: 70,
          }}
        >
          {e}
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 1168,
        fontWeight: 800,
        fontSize: 32,
        color: YELLOW,
      }}
    >
      Desliza →
    </div>
  </Fondo>
);

const Que: React.FC = () => (
  <Fondo n={2}>
    <div style={{ position: "absolute", top: 130, left: 64, right: 64 }}>
      <Bloque bg={BLUE} size={120} tilt={-1.5}>
        ¿QUÉ PASÓ?
      </Bloque>
      <div
        style={{
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.3,
          marginTop: 60,
        }}
      >
        El <b style={{ color: YELLOW }}>29 de octubre</b> el gobierno De la
        Espriella radicó en el Congreso la{" "}
        <b style={{ color: YELLOW }}>«Ley de Rescate Económico»</b>.
      </div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.3,
          marginTop: 40,
        }}
      >
        Además de recortes, trae <b style={{ color: YELLOW }}>más impuestos</b>:
        entre ellos, IVA del{" "}
        <b style={{ background: RED, padding: "0 12px" }}>19%</b> a alimentos
        que hoy pagan 5% o no pagan nada.
      </div>
      <div
        style={{
          marginTop: 46,
          background: YELLOW,
          color: NAVY,
          padding: "26px 34px",
          transform: "rotate(-1.5deg)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontFamily: Bebas, fontSize: 88, lineHeight: 0.95 }}>
          «MÁS TRIBUTARIA QUE RECORTE»
        </div>
        <div style={{ fontWeight: 700, fontSize: 30, marginTop: 8 }}>
          — La Silla Vacía
        </div>
      </div>
    </div>
    <Nota>Fuentes: La Silla Vacía, El Tiempo, Portafolio.</Nota>
  </Fondo>
);

const Cinco: React.FC = () => (
  <Fondo n={3}>
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        Desde el 1 de enero de 2028
      </div>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Bloque bg="rgba(255,255,255,0.15)" size={170}>
          5%
        </Bloque>
        <div style={{ fontFamily: Bebas, fontSize: 140, color: YELLOW }}>→</div>
        <Bloque bg={RED} size={170} tilt={-2}>
          19%
        </Bloque>
      </div>
    </div>
    <div style={{ position: "absolute", top: 450, left: 0, right: 0 }}>
      <Fichas
        cols={3}
        size={290}
        items={[
          { e: "☕", t: "Café" },
          { e: "🍬", t: "Azúcar" },
          { e: "🫒", t: "Aceites" },
          { e: "🍝", t: "Pastas" },
          { e: "🍫", t: "Chocolate de mesa" },
        ]}
      />
    </div>
    <Nota>Desaparece la tarifa del 5%: todo eso pasa a la tarifa general.</Nota>
  </Fondo>
);

const Excluidos: React.FC = () => (
  <Fondo n={4}>
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        Hoy no pagan IVA. Pagarían
      </div>
      <div style={{ marginTop: 14 }}>
        <Bloque bg={RED} size={200} tilt={-2}>
          19%
        </Bloque>
      </div>
    </div>
    <div style={{ position: "absolute", top: 470, left: 0, right: 0 }}>
      <Fichas
        cols={4}
        size={228}
        items={[
          { e: "🍅", t: "Tomate" },
          { e: "🧅", t: "Cebolla" },
          { e: "🍌", t: "Frutas" },
          { e: "🥬", t: "Verduras" },
          { e: "🫘", t: "Fríjol" },
          { e: "🥣", t: "Lenteja" },
          { e: "🧂", t: "Sal" },
          { e: "🌽", t: "Maíz" },
        ]}
      />
    </div>
    <Nota>
      Salen de la lista de excluidos: frutas y verduras frescas, granos secos,
      sal y maíz.
    </Nota>
  </Fondo>
);

const Siguen: React.FC = () => (
  <Fondo n={5}>
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        Lo que seguiría
      </div>
      <div style={{ marginTop: 14 }}>
        <Bloque bg={BLUE} size={170} tilt={-1.5}>
          SIN IVA
        </Bloque>
      </div>
    </div>
    <div style={{ position: "absolute", top: 440, left: 0, right: 0 }}>
      <Fichas
        cols={4}
        size={228}
        items={[
          { e: "🍚", t: "Arroz" },
          { e: "🥔", t: "Papa" },
          { e: "🍠", t: "Yuca" },
          { e: "🥩", t: "Carne" },
          { e: "🍗", t: "Pollo" },
          { e: "🐟", t: "Pescado" },
          { e: "🥚", t: "Huevos" },
          { e: "🥛", t: "Leche" },
        ]}
      />
    </div>
    <Nota bottom={170}>También panela, pan, arepa y agua.</Nota>
  </Fondo>
);

const Dicen: React.FC = () => (
  <Fondo n={6}>
    <div style={{ position: "absolute", top: 140, left: 64, right: 64 }}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        El Gobierno dice:
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 62,
          fontWeight: 700,
          fontStyle: "italic",
          lineHeight: 1.2,
          borderLeft: `10px solid ${YELLOW}`,
          paddingLeft: 30,
        }}
      >
        «La canasta básica está fuera de esta discusión».
      </div>
      <div style={{ marginTop: 70 }}>
        <Bloque bg={RED} size={130} tilt={-1.5}>
          PERO…
        </Bloque>
      </div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.3,
          marginTop: 40,
        }}
      >
        El <b style={{ color: YELLOW }}>café</b>, el{" "}
        <b style={{ color: YELLOW }}>azúcar</b>, el{" "}
        <b style={{ color: YELLOW }}>fríjol</b>, el{" "}
        <b style={{ color: YELLOW }}>tomate</b> y la{" "}
        <b style={{ color: YELLOW }}>cebolla</b> están en la mesa de las
        familias todos los días.
      </div>
    </div>
    <Nota>Promete devolver el IVA a hogares de bajos ingresos.</Nota>
  </Fondo>
);

const Cierre: React.FC = () => (
  <Fondo n={7}>
    <div
      style={{
        position: "absolute",
        top: 260,
        left: 64,
        right: 64,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 38,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: YELLOW,
        }}
      >
        Todavía no es ley
      </div>
      <div
        style={{
          fontSize: 54,
          fontWeight: 600,
          lineHeight: 1.3,
          marginTop: 30,
        }}
      >
        Se discute en el Congreso. Todavía estamos a tiempo de
      </div>
      <div style={{ marginTop: 30 }}>
        <Bloque bg={RED} size={210} tilt={-2}>
          FRENARLA
        </Bloque>
      </div>
      <div style={{ fontFamily: EMOJI, fontSize: 90, marginTop: 60 }}>
        🔁 💬
      </div>
      <div
        style={{
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 20,
        }}
      >
        Comparte para que tu familia{" "}
        <span style={{ color: YELLOW }}>se entere</span>.
      </div>
    </div>
  </Fondo>
);

const SLIDES = [Portada, Que, Cinco, Excluidos, Siguen, Dicen, Cierre];

export const CarruselIva: React.FC<{ slide: number }> = ({ slide }) => {
  const S = SLIDES[slide - 1];
  return <S />;
};
