import React from "react";
import { Bebas, Montserrat } from "./font";
import {
  Bloque,
  BLUE,
  EMOJI,
  Fichas,
  Fondo,
  Factura,
  Nota,
  NAVY,
  RED,
  SHADOW,
  YELLOW,
} from "./CarruselIva";

// Segundo carrusel del IVA (1080x1350), más extenso: qué trae la «Ley de Rescate Económico» además del IVA a
// la comida (renta, internet, tecnología, devolución del IVA) y la promesa de campaña. Datos de prensa del
// 29–31 de octubre de 2026 (La Silla Vacía, El Colombiano, Portafolio, Infobae, Tolima Estéreo, Vanguardia);
// todo atribuido y en condicional: es un proyecto que el Congreso todavía no ha discutido.
// Composiciones IVA2-1 … IVA2-10; npm run render:carrusel-iva2.
export const IVA2_SLIDES = 10;

const P: React.FC<{
  children: React.ReactNode;
  size?: number;
  mt?: number;
}> = ({ children, size = 50, mt = 34 }) => (
  <div
    style={{
      fontFamily: Montserrat,
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.32,
      marginTop: mt,
    }}
  >
    {children}
  </div>
);
const Y: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <b style={{ color: YELLOW }}>{children}</b>
);
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <b style={{ background: RED, padding: "0 10px" }}>{children}</b>
);
const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontWeight: 800,
      fontSize: 34,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: YELLOW,
    }}
  >
    {children}
  </div>
);
const Lamina: React.FC<{
  n: number;
  children: React.ReactNode;
  top?: number;
}> = ({ n, children, top = 120 }) => (
  <Fondo n={n} total={IVA2_SLIDES}>
    <div style={{ position: "absolute", top, bottom: 0, left: 64, right: 64 }}>
      {children}
    </div>
  </Fondo>
);
// Lista con viñeta de emoji.
const Lista: React.FC<{
  items: [string, React.ReactNode][];
  size?: number;
}> = ({ items, size = 48 }) => (
  <div
    style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}
  >
    {items.map(([e, t], i) => (
      <div
        key={i}
        style={{ display: "flex", gap: 22, alignItems: "flex-start" }}
      >
        <div style={{ fontFamily: EMOJI, fontSize: size * 1.3, lineHeight: 1 }}>
          {e}
        </div>
        <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.3 }}>
          {t}
        </div>
      </div>
    ))}
  </div>
);

const Portada: React.FC = () => (
  <Fondo n={1} total={IVA2_SLIDES}>
    <Factura top={700} />
    <div style={{ position: "absolute", top: 110, left: 64, right: 64 }}>
      <Kicker>Ley de Rescate de Abelardo</Kicker>
      <div
        style={{
          fontFamily: Bebas,
          fontSize: 140,
          lineHeight: 0.9,
          marginTop: 14,
          textShadow: SHADOW,
        }}
      >
        LO QUE NO TE
      </div>
      <div style={{ marginTop: 10 }}>
        <Bloque bg={YELLOW} color={NAVY} size={230} tilt={-2}>
          CUENTAN
        </Bloque>
      </div>
      <div style={{ marginTop: 18 }}>
        <Bloque bg={RED} size={110} tilt={-2}>
          IVA · RENTA · INTERNET
        </Bloque>
      </div>
    </div>
    <div style={{ position: "absolute", left: 64, top: 760, width: 420 }}>
      <P size={40} mt={0}>
        Te explicamos en <Y>10 puntos</Y> lo que trae para tu bolsillo.
      </P>
      <div
        style={{ fontWeight: 800, fontSize: 32, color: YELLOW, marginTop: 40 }}
      >
        Desliza →
      </div>
    </div>
  </Fondo>
);

const Que: React.FC = () => (
  <Lamina n={2}>
    <Bloque bg={BLUE} size={110} tilt={-1.5}>
      ¿QUÉ ES?
    </Bloque>
    <P mt={50}>
      El <Y>29 de octubre</Y> el gobierno De la Espriella radicó en el Congreso
      la <Y>«Ley de Rescate Económico»</Y>: más de 100 artículos para conseguir
      cerca de <Y>$40 billones</Y>.
    </P>
    <P>
      La venden como un plan de austeridad, pero según La Silla Vacía es{" "}
      <R>«más tributaria que recorte»</R>: el grueso de la plata, unos{" "}
      <Y>$25 billones</Y>, saldría del <Y>IVA</Y>.
    </P>
    <Nota>Fuentes: Infobae, La Silla Vacía.</Nota>
  </Lamina>
);

const Promesa: React.FC = () => (
  <Lamina n={3} top={150}>
    <Kicker>En campaña</Kicker>
    <div
      style={{
        marginTop: 24,
        fontSize: 64,
        fontWeight: 700,
        fontStyle: "italic",
        lineHeight: 1.2,
        borderLeft: `10px solid ${YELLOW}`,
        paddingLeft: 30,
      }}
    >
      Prometió no subir impuestos.
    </div>
    <div style={{ marginTop: 70 }}>
      <Bloque bg={RED} size={120} tilt={-1.5}>
        HOY PROPONE
      </Bloque>
    </div>
    <Lista
      size={54}
      items={[
        [
          "🛒",
          <>
            Más <Y>IVA</Y> a alimentos y servicios.
          </>,
        ],
        [
          "🧾",
          <>
            Que más gente pague <Y>renta</Y>.
          </>,
        ],
        [
          "🏥",
          <>
            Más aportes a <Y>salud</Y> para los asalariados.
          </>,
        ],
      ]}
    />
    <Nota>Fuente: El Colombiano.</Nota>
  </Lamina>
);

const Cinco: React.FC = () => (
  <Lamina n={4}>
    <Kicker>1 de enero de 2028: chao tarifa del 5%</Kicker>
    <div
      style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 26 }}
    >
      <Bloque bg="rgba(255,255,255,0.15)" size={150}>
        5%
      </Bloque>
      <div style={{ fontFamily: Bebas, fontSize: 120, color: YELLOW }}>→</div>
      <Bloque bg={RED} size={150} tilt={-2}>
        19%
      </Bloque>
    </div>
    <P mt={30}>Todo lo que hoy paga 5% pasaría a la tarifa general:</P>
    <div style={{ marginTop: 34 }}>
      <Fichas
        cols={3}
        size={200}
        items={[
          { e: "☕", t: "Café" },
          { e: "🍬", t: "Azúcar" },
          { e: "🫒", t: "Aceites" },
          { e: "🍝", t: "Pastas" },
          { e: "🍫", t: "Chocolate" },
          { e: "🩺", t: "Medicina prepagada" },
        ]}
      />
    </div>
  </Lamina>
);

const Excluidos: React.FC = () => (
  <Lamina n={5}>
    <Kicker>Lo que hoy no paga IVA</Kicker>
    <div style={{ marginTop: 18 }}>
      <Bloque bg={RED} size={130} tilt={-2}>
        PAGARÍA 19%
      </Bloque>
    </div>
    <P mt={30}>Salen de la lista de excluidos:</P>
    <Lista
      items={[
        [
          "🍅",
          <>
            <Y>Frutas y verduras frescas</Y>: tomate, cebolla…
          </>,
        ],
        [
          "🫘",
          <>
            <Y>Granos secos</Y>: fríjol, lenteja, garbanzo.
          </>,
        ],
        [
          "🧂",
          <>
            <Y>Sal</Y> y <Y>maíz</Y>.
          </>,
        ],
      ]}
    />
    <P mt={44}>
      Es decir: lo que va en la <Y>olla de todos los días</Y>.
    </P>
  </Lamina>
);

const Internet: React.FC = () => (
  <Lamina n={6}>
    <Kicker>Y no es solo la comida</Kicker>
    <div style={{ marginTop: 18 }}>
      <Bloque bg={BLUE} size={120} tilt={-1.5}>
        MÁS IVA A…
      </Bloque>
    </div>
    <Lista
      size={48}
      items={[
        [
          "📶",
          <>
            <Y>Internet de estratos 1, 2 y 3</Y>: perdería su beneficio de IVA.
          </>,
        ],
        [
          "💻",
          <>
            <Y>Computadores y celulares</Y>, incluso los de gama baja, según
            medios.
          </>,
        ],
        [
          "☁️",
          <>
            Servicios de <Y>nube</Y> y alojamiento web.
          </>,
        ],
        [
          "🩺",
          <>
            <Y>Medicina prepagada</Y>: de 5% a 19%.
          </>,
        ],
      ]}
    />
    <Nota>Fuentes: Tolima Estéreo, Portafolio, El Tiempo.</Nota>
  </Lamina>
);

const Renta: React.FC = () => (
  <Lamina n={7}>
    <Kicker>Si eres asalariado</Kicker>
    <div style={{ marginTop: 18 }}>
      <Bloque bg={RED} size={120} tilt={-1.5}>
        MÁS RENTA
      </Bloque>
    </div>
    <Lista
      size={44}
      items={[
        [
          "📉",
          <>
            La parte exenta del 25% baja de <Y>790 a 630 UVT</Y>.
          </>,
        ],
        [
          "✂️",
          <>
            El tope de deducciones baja de <Y>1.340 a 1.180 UVT</Y>.
          </>,
        ],
        [
          "👨‍👩‍👧",
          <>
            Desaparece la deducción por <Y>dependientes</Y>.
          </>,
        ],
      ]}
    />
    <div
      style={{
        marginTop: 44,
        background: YELLOW,
        color: NAVY,
        padding: "24px 30px",
        transform: "rotate(-1deg)",
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.3 }}>
        Alguien que gana <b>$6 millones</b> al mes pagaría cerca de{" "}
        <b>$2,1 millones más al año</b> entre renta y salud.
      </div>
      <div style={{ fontWeight: 700, fontSize: 26, marginTop: 8 }}>
        — Cálculo de La Silla Vacía
      </div>
    </div>
  </Lamina>
);

const Empresas: React.FC = () => (
  <Lamina n={8} top={150}>
    <Kicker>Mientras tanto…</Kicker>
    <P size={56} mt={24}>
      El impuesto de renta de las <Y>empresas</Y> bajaría:
    </P>
    <div
      style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 22 }}
    >
      <Bloque bg="rgba(255,255,255,0.15)" size={124}>
        35%
      </Bloque>
      <div style={{ fontFamily: Bebas, fontSize: 90, color: YELLOW }}>→</div>
      <Bloque bg={BLUE} size={124}>
        33%
      </Bloque>
      <div style={{ fontFamily: Bebas, fontSize: 90, color: YELLOW }}>→</div>
      <Bloque bg={BLUE} size={124} tilt={-2}>
        31%
      </Bloque>
    </div>
    <P size={40} mt={20}>
      (2027 y 2028)
    </P>
    <P size={58} mt={60}>
      O sea: <R>la familia paga más</R> y las empresas, <Y>menos</Y>.
    </P>
    <Nota>Fuente: Portafolio. Los bancos sí tendrían una sobretasa.</Nota>
  </Lamina>
);

const Devolucion: React.FC = () => (
  <Lamina n={9}>
    <Kicker>El Gobierno responde</Kicker>
    <div
      style={{
        marginTop: 24,
        fontSize: 50,
        fontWeight: 700,
        fontStyle: "italic",
        lineHeight: 1.25,
        borderLeft: `10px solid ${YELLOW}`,
        paddingLeft: 30,
      }}
    >
      «Le devolveremos el IVA a 19 millones de colombianos».
    </div>
    <P size={46} mt={40}>
      Con el «EfectIVA», desde 2028: <Y>100%</Y> a hogares en pobreza y entre{" "}
      <Y>30% y 50%</Y> a los vulnerables.
    </P>
    <div style={{ marginTop: 40 }}>
      <Bloque bg={RED} size={110} tilt={-1.5}>
        PERO…
      </Bloque>
    </div>
    <P size={48} mt={30}>
      Si eres de <Y>clase media</Y> o no estás en esa lista, pagas el{" "}
      <Y>19% completo</Y>. Y primero pagas; la devolución llega después.
    </P>
    <Nota>Fuentes: Infobae, Tolima Estéreo.</Nota>
  </Lamina>
);

const Cierre: React.FC = () => (
  <Lamina n={10} top={200}>
    <div style={{ textAlign: "center" }}>
      <Kicker>Todavía no es ley</Kicker>
      <P size={50} mt={30}>
        Tiene que pasar por el Congreso. Hasta partidos cercanos al Gobierno ya
        la cuestionan.
      </P>
      <div style={{ marginTop: 40 }}>
        <Bloque bg={RED} size={190} tilt={-2}>
          ESTAMOS A TIEMPO
        </Bloque>
      </div>
      <div style={{ fontFamily: EMOJI, fontSize: 80, marginTop: 50 }}>
        🔁 💬 📌
      </div>
      <P size={50} mt={20}>
        <Y>Comparte</Y> para que tu familia se entere y <Y>guárdalo</Y> para el
        debate.
      </P>
    </div>
  </Lamina>
);

const SLIDES = [
  Portada,
  Que,
  Promesa,
  Cinco,
  Excluidos,
  Internet,
  Renta,
  Empresas,
  Devolucion,
  Cierre,
];

export const CarruselIva2: React.FC<{ slide: number }> = ({ slide }) => {
  const S = SLIDES[slide - 1];
  return <S />;
};
