// Lista de edición del Blog 1 (vertical 9:16).
// Versión 2: escenas COMPLETAS en el orden en que se grabaron, para que se
// entienda la trama. Solo se recorta tiempo muerto al inicio/fin de cada clip.
//
// Tiempos en segundos del ORIGINAL (A001_..._Cxxx.mov). Los subtítulos salen
// de captions.json (scripts/captions-blog1.py) filtrados al tramo [in, out].

export type Word = [text: string, start: number, end: number];

export type Moment = {
  /** segundo del original */
  at: number;
};

export type Segment = {
  clip: string;
  in: number;
  out: number;
  /** cover = llena 9:16 · boxed = ventana con fondo difuminado (tomas horizontales) */
  layout: "cover" | "boxed";
  /** centro horizontal del encuadre, 0 = izquierda, 1 = derecha */
  focusX?: number;
  /** destello blanco + whoosh al entrar (cambio de escena) */
  sceneChange?: boolean;
  /** títulos que aparecen dentro de la escena */
  titles?: (Moment & { text: string; sub?: string; dur?: number })[];
  /** acercamientos suaves para enfatizar una frase (sin cortar) */
  zooms?: (Moment & { dur?: number; scale?: number; sfx?: "pop" | "impact" })[];
};

export const SEGMENTS: Segment[] = [
  // 1. Arranque
  {
    clip: "C074",
    in: 0,
    out: 4.05,
    layout: "cover",
    titles: [{ at: 0.2, text: "BLOG 1", dur: 3.6 }],
  },
  // 2. Intro: "un día a día con nosotros"
  {
    clip: "C075",
    in: 0.9,
    out: 12.88,
    layout: "boxed",
    sceneChange: true,
    titles: [{ at: 4.1, text: "UN DÍA A DÍA", sub: "CON NOSOTROS", dur: 3 }],
  },
  // 3. La invitada: Valery
  {
    clip: "C076",
    in: 0.6,
    out: 32.5,
    layout: "boxed",
    sceneChange: true,
    titles: [{ at: 10.6, text: "INVITADA: VALERY", sub: "MODELO", dur: 3.5 }],
    zooms: [{ at: 5.2, dur: 1.8, sfx: "pop" }],
  },
  // 4. Entrenando + el spoiler del chivo
  {
    clip: "C084",
    in: 0,
    out: 35.55,
    layout: "cover",
    sceneChange: true,
    titles: [{ at: 21.2, text: "PEQUEÑO SPOILER", dur: 4 }],
    zooms: [
      { at: 6.8, dur: 2.4 },
      { at: 13.4, dur: 1.5, sfx: "impact" },
      { at: 25.6, dur: 3, scale: 1.15 },
      { at: 30.0, dur: 2.2, sfx: "pop" },
    ],
  },
  // 5. "Eso es Rocky" – dame rostro
  {
    clip: "C087",
    in: 0,
    out: 21.9,
    layout: "cover",
    sceneChange: true,
    zooms: [
      { at: 11.0, dur: 3.2 },
      { at: 17.4, dur: 2, scale: 1.15, sfx: "pop" },
    ],
  },
  // 6. 200 kilos – báilalo Rocky
  {
    clip: "C090",
    in: 0,
    out: 35.8,
    layout: "cover",
    sceneChange: true,
    titles: [{ at: 0.4, text: "200 KILOS", dur: 2.6 }],
    zooms: [{ at: 24.3, dur: 4.4 }],
  },
  // 7. Con Valery: el baño, el piercing, espacio personal...
  {
    clip: "C094",
    in: 0.3,
    out: 136.5,
    layout: "cover",
    sceneChange: true,
    titles: [
      { at: 63.6, text: "ESPACIO PERSONAL", sub: "2 METROS", dur: 3.5 },
      { at: 106.7, text: "EL MÁS BARBADO", sub: "DE COLOMBIA", dur: 3 },
    ],
    zooms: [
      { at: 0.5, dur: 3.2 },
      { at: 36.7, dur: 2.3, sfx: "pop" },
      { at: 69.6, dur: 4, scale: 1.12, sfx: "pop" },
      { at: 93.5, dur: 3, scale: 1.15, sfx: "impact" },
      { at: 115.6, dur: 3 },
      { at: 135.0, dur: 1.4, sfx: "pop" },
    ],
  },
  // 8. Cantando en la máquina – "lo decimos motivando"
  {
    clip: "C099",
    in: 0,
    out: 42.7,
    layout: "boxed",
    focusX: 0.5,
    sceneChange: true,
    zooms: [{ at: 28.5, dur: 3.3, sfx: "pop" }],
  },
  // 9. Más tarde... ¡Pochoclo!
  {
    clip: "C105",
    in: 0,
    out: 3.68,
    layout: "cover",
    sceneChange: true,
    titles: [{ at: 0, text: "MÁS TARDE...", dur: 1.8 }],
  },
  // 10. Pochoclo, la celebridad
  {
    clip: "C110",
    in: 0,
    out: 17.4,
    layout: "cover",
    sceneChange: true,
    titles: [{ at: 1.4, text: "POCHOCLO", sub: "LA CELEBRIDAD", dur: 3.5 }],
    zooms: [{ at: 7.5, dur: 3 }],
  },
  // 11. Pochoclo llega al gym
  {
    clip: "C113",
    in: 0,
    out: 15.68,
    layout: "cover",
    sceneChange: true,
    zooms: [{ at: 0.6, dur: 1.8, sfx: "impact" }],
  },
  // 12. Trabajando en la página web
  {
    clip: "C115",
    in: 0,
    out: 15.75,
    layout: "boxed",
    sceneChange: true,
  },
  // 13. Cierre en Apolo Gastro Bar
  {
    clip: "C116",
    in: 0,
    out: 12.9,
    layout: "boxed",
    sceneChange: true,
    titles: [{ at: 1.7, text: "APOLO GASTRO BAR", dur: 3 }],
  },
];
