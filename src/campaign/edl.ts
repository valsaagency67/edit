// Edición (EDL) de los dos videos. Tiempos en segundos del archivo ORIGINAL
// (los masters en public/master/ conservan la misma línea de tiempo).
// Los segmentos salen de detectar silencios (> 0.35 s a -35 dB) para hacer
// jump cuts: se elimina cada pausa y se alterna el encuadre en cada corte.

export type Clip = {
  file: string;
  segments: [number, number][];
  // Textos que aparecen al inicio del clip (solo textos del cliente/perfil).
  texts?: { text: string; at?: number; dur?: number; tone?: "hook" | "info" }[];
};

export type Edit = {
  hook: string;
  clips: Clip[];
};

const ABOGADO = {
  text: "ABOGADO JAVERIANO",
  at: 0.3,
  dur: 2.4,
  tone: "info",
} as const;
const LIDERAZGO = {
  text: "LIDERAZGO SOCIAL EN PALMIRA",
  at: 0.3,
  dur: 2.6,
  tone: "info",
} as const;

const C = {
  vigilante: {
    file: "IMG_1697",
    segments: [
      [1.0, 6.1],
      [6.45, 19.1],
    ],
  },
  discusion: {
    file: "IMG_1697",
    segments: [
      [19.45, 27.15],
      [27.5, 31.65],
      [32.1, 42.55],
      [42.9, 49.25],
      [49.6, 52.6],
    ],
  },
  c1713: { file: "IMG_1713", segments: [[0.75, 7.7]] },
  c1696: {
    file: "IMG_1696",
    segments: [
      [1.45, 5.8],
      [6.38, 7.45],
      [7.95, 10.62],
    ],
  },
  c1702: {
    file: "IMG_1702",
    segments: [
      [0.45, 1.52],
      [2.15, 4.92],
      [5.6, 8.7],
    ],
  },
  c1704: {
    file: "IMG_1704",
    segments: [
      [0.55, 4.85],
      [5.35, 8.95],
    ],
  },
  c1706: {
    file: "IMG_1706",
    segments: [
      [0.8, 4.43],
      [4.75, 11.75],
    ],
  },
  c1710: {
    file: "IMG_1710",
    segments: [
      [1.45, 5.33],
      [5.8, 8.6],
      [8.95, 12.6],
    ],
  },
} satisfies Record<string, Clip>;

// Video 1: abre con el vigilante diciendo que no pueden estar ahí + 5 clips.
export const VIDEO_VIGILANTE: Edit = {
  hook: "¿NO PODEMOS ESTAR AQUÍ?",
  clips: [
    C.vigilante,
    { ...C.c1696, texts: [ABOGADO] },
    C.c1702,
    { ...C.c1704, texts: [LIDERAZGO] },
    C.c1706,
    C.c1710,
  ],
};

// Video 2: abre con Juan Felipe atacando al concejal de Palmira.
export const VIDEO_CONCEJAL: Edit = {
  hook: "PALMIRA, ESCUCHA ESTO",
  clips: [
    C.c1713,
    C.discusion,
    { ...C.c1704, texts: [ABOGADO] },
    { ...C.c1706, texts: [LIDERAZGO] },
    C.c1710,
  ],
};
