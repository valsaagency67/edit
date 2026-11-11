// Guion y tiempos del video "Prevención de la violencia contra la mujer".
// Todos los textos salen de lo que se dice en los clips (transcripción
// revisada a mano). Tiempos en segundos del clip original.

export type Word = readonly [text: string, start: number, end: number];

export type ChipTone = "brand" | "danger" | "check";

export type Chip = {
  readonly text: string;
  readonly at: number;
  readonly tone: ChipTone;
};

export type Stamp = {
  readonly text: string;
  readonly from: number;
  readonly to: number;
};

export type Clip = {
  readonly src: string;
  /**
   * Tramos del clip (en segundos) que se conservan, en orden. Lo que queda
   * fuera son pausas, "eee", "eh" y "ya".
   */
  readonly keep: readonly (readonly [number, number])[];
  /** Título de sección arriba (gancho visual). */
  readonly title: string;
  /** Encuadre: 1 = plano completo, >1 = más cerrado (efecto jump-cut). */
  readonly baseZoom: number;
  readonly words: readonly Word[];
  /** Momentos (s) con golpe de zoom. */
  readonly punches: readonly number[];
  readonly chips: readonly Chip[];
  readonly stamps: readonly Stamp[];
  /** Muestra la tarjeta con la línea de atención entre estos tiempos. */
  readonly hotline?: readonly [number, number];
};

export const CLIPS: readonly Clip[] = [
  {
    src: "psa/01-intro-caso.mov",
    keep: [[0.3, 4.6]],
    title: "ABUSO CONTRA LA MUJER",
    baseZoom: 1.12,
    words: [
      ["A", 0.3, 0.42],
      ["continuación", 0.42, 0.8],
      ["te", 0.8, 1.0],
      ["voy", 1.0, 1.08],
      ["a", 1.08, 1.12],
      ["presentar", 1.12, 1.44],
      ["un", 1.44, 1.52],
      ["caso", 1.52, 1.76],
      ["que", 1.76, 2.22],
      ["se", 2.22, 2.32],
      ["dio", 2.32, 2.44],
      ["aquí", 2.44, 2.58],
      ["en", 2.58, 2.62],
      ["Colombia", 2.62, 3.02],
      ["de", 3.02, 3.26],
      ["abuso", 3.26, 3.52],
      ["contra", 3.52, 3.92],
      ["la", 3.92, 4.08],
      ["mujer.", 4.08, 4.3],
    ],
    punches: [1.52, 2.62, 3.26],
    chips: [],
    stamps: [],
  },
  {
    src: "psa/02-no-son-normales.mov",
    keep: [
      [0.55, 1.7],
      [2.8, 5.62],
    ],
    title: "NO ES NORMAL",
    baseZoom: 1,
    words: [
      ["Sufrir", 0.45, 0.64],
      ["alguno", 0.64, 0.96],
      ["de", 0.96, 1.0],
      ["estos", 1.0, 1.12],
      ["casos,", 1.12, 1.46],
      ["estas", 2.84, 2.98],
      ["problemáticas", 2.98, 3.46],
      ["no", 3.46, 3.66],
      ["son", 3.66, 3.76],
      ["normales", 3.76, 4.26],
      ["y", 4.26, 4.36],
      ["no", 4.36, 4.46],
      ["es", 4.46, 4.5],
      ["algo", 4.5, 4.64],
      ["que", 4.64, 4.78],
      ["debes", 4.78, 4.94],
      ["dejar", 4.94, 5.14],
      ["pasar.", 5.14, 5.4],
    ],
    punches: [0.45, 4.94],
    chips: [],
    stamps: [{ text: "NO SON NORMALES", from: 3.46, to: 4.6 }],
  },
  {
    src: "psa/03-tipos.mov",
    keep: [
      [0.56, 3.16],
      [3.36, 5.42],
      [5.82, 6.66],
      [7.22, 8.0],
    ],
    title: "TIPOS DE VIOLENCIA",
    baseZoom: 1.12,
    words: [
      ["Es", 0.56, 0.62],
      ["que", 0.62, 0.7],
      ["estos", 0.7, 0.88],
      ["casos", 0.88, 1.08],
      ["no", 1.08, 1.22],
      ["solamente", 1.22, 1.54],
      ["se", 1.54, 1.74],
      ["ven", 1.74, 1.88],
      ["mediante", 1.88, 2.52],
      ["lo", 2.52, 2.64],
      ["físico,", 2.64, 3.28],
      ["sino", 3.28, 3.5],
      ["que", 3.5, 3.66],
      ["se", 3.66, 3.74],
      ["pueden", 3.74, 3.96],
      ["ver", 3.96, 4.18],
      ["como", 4.18, 4.4],
      ["psicológico,", 4.46, 5.4],
      ["económico", 5.86, 6.62],
      ["y", 7.24, 7.34],
      ["sexual.", 7.34, 7.95],
    ],
    punches: [2.64, 4.46, 5.86, 7.34],
    chips: [
      { text: "Físico", at: 2.64, tone: "brand" },
      { text: "Psicológico", at: 4.46, tone: "brand" },
      { text: "Económico", at: 5.86, tone: "brand" },
      { text: "Sexual", at: 7.34, tone: "brand" },
    ],
    stamps: [],
  },
  {
    src: "psa/04-manifestaciones.mov",
    keep: [
      [0.42, 3.8],
      [3.94, 5.34],
      [5.5, 6.4],
    ],
    title: "CÓMO SE MANIFIESTA",
    baseZoom: 1,
    words: [
      ["Se", 0.46, 0.54],
      ["pueden", 0.5, 0.74],
      ["manifestar", 0.74, 1.38],
      ["mediante", 1.38, 1.64],
      ["insultos,", 1.64, 2.22],
      ["golpes,", 2.32, 2.72],
      ["humillaciones", 2.86, 3.52],
      ["y", 3.56, 3.8],
      ["control", 3.96, 4.44],
      ["de", 4.4, 4.56],
      ["la", 4.56, 4.66],
      ["persona.", 4.66, 5.16],
      ["¡No", 5.52, 5.6],
      ["permitas", 5.56, 6.02],
      ["eso!", 6.02, 6.24],
    ],
    punches: [1.64, 2.32, 2.86, 3.96],
    chips: [
      { text: "Insultos", at: 1.64, tone: "danger" },
      { text: "Golpes", at: 2.32, tone: "danger" },
      { text: "Humillaciones", at: 2.86, tone: "danger" },
      { text: "Control", at: 3.96, tone: "danger" },
    ],
    stamps: [{ text: "¡NO PERMITAS ESO!", from: 5.52, to: 6.4 }],
  },
  {
    src: "psa/05-prevenir.mov",
    keep: [
      [0.06, 2.16],
      [2.98, 3.94],
      [4.8, 7.12],
      [7.52, 8.34],
      [8.78, 10.26],
    ],
    title: "¿CÓMO PREVENIR?",
    baseZoom: 1.12,
    words: [
      ["¿Cómo", 0.15, 0.32],
      ["podemos", 0.32, 0.66],
      ["prevenir?", 0.66, 1.02],
      ["Reconociendo", 1.16, 1.96],
      ["las", 3.0, 3.14],
      ["señales", 3.14, 3.5],
      ["de", 3.5, 3.62],
      ["alerta,", 3.62, 4.4],
      ["promoviendo", 4.82, 5.52],
      ["el", 5.52, 5.88],
      ["respeto", 5.88, 6.44],
      ["y", 6.44, 6.54],
      ["la", 6.54, 6.6],
      ["igualdad", 6.6, 7.1],
      ["y", 7.52, 7.62],
      ["promoviendo", 7.62, 8.3],
      ["relaciones", 8.8, 9.16],
      ["libres", 9.16, 9.68],
      ["de", 9.68, 9.84],
      ["violencia.", 9.84, 10.24],
    ],
    punches: [0.66, 3.14, 5.88, 9.16],
    chips: [
      { text: "Señales de alerta", at: 3.14, tone: "check" },
      { text: "Respeto e igualdad", at: 5.88, tone: "check" },
      { text: "Relaciones libres de violencia", at: 8.8, tone: "check" },
    ],
    stamps: [],
  },
  {
    src: "psa/06-sin-miedo.mov",
    keep: [
      [0.82, 3.14],
      [3.44, 4.78],
      [4.96, 6.34],
      [7.24, 8.68],
      [9.04, 9.86],
    ],
    title: "NO VIVIR CON MIEDO",
    baseZoom: 1,
    words: [
      ["Recuerda", 0.85, 1.18],
      ["que", 1.18, 1.3],
      ["las", 1.3, 1.4],
      ["mujeres", 1.4, 1.74],
      ["no", 1.74, 2.14],
      ["deben", 2.14, 2.32],
      ["vivir", 2.32, 2.52],
      ["con", 2.52, 2.72],
      ["miedo.", 2.72, 3.02],
      ["Si", 3.34, 3.56],
      ["conoces", 3.56, 4.08],
      ["a", 4.08, 4.24],
      ["alguien", 4.24, 4.56],
      ["que", 4.56, 4.78],
      ["sufre", 5.06, 5.58],
      ["esto,", 5.58, 6.08],
      ["apóyalo,", 7.28, 7.82],
      ["oriéntalo,", 7.94, 8.48],
      ["ayúdalo.", 9.04, 9.62],
    ],
    punches: [1.74, 7.28, 7.94, 9.04],
    chips: [
      { text: "Apóyalo", at: 7.28, tone: "brand" },
      { text: "Oriéntalo", at: 7.94, tone: "brand" },
      { text: "Ayúdalo", at: 9.04, tone: "brand" },
    ],
    stamps: [],
  },
  {
    src: "psa/07-linea-atencion.mov",
    keep: [
      [0.02, 0.84],
      [1.02, 2.52],
      [3.36, 5.58],
      [6.04, 9.1],
    ],
    title: "",
    baseZoom: 1.12,
    words: [
      ["Mira,", 0.08, 0.7],
      ["esta", 1.04, 1.2],
      ["es", 1.18, 1.28],
      ["una", 1.28, 1.38],
      ["línea", 1.38, 1.5],
      ["de", 1.5, 1.64],
      ["atención", 1.64, 2.16],
      ["y", 3.4, 3.48],
      ["que", 3.44, 3.52],
      ["te", 3.52, 3.64],
      ["protegerán,", 3.64, 4.16],
      ["porque", 4.16, 4.42],
      ["recuerda,", 4.42, 4.92],
      ["no", 4.92, 5.0],
      ["estás", 5.0, 5.16],
      ["sola,", 5.16, 5.44],
      ["y", 6.06, 6.18],
      ["recuerda", 6.18, 6.74],
      ["que", 7.0, 7.08],
      ["la", 7.04, 7.18],
      ["violencia", 7.18, 7.52],
      ["se", 7.52, 7.66],
      ["reconoce", 7.66, 8.24],
      ["y", 8.24, 8.44],
      ["se", 8.44, 8.54],
      ["denuncia.", 8.54, 8.96],
    ],
    punches: [0.08, 1.38, 7.66, 8.54],
    chips: [
      { text: "Se reconoce", at: 7.66, tone: "check" },
      { text: "Se denuncia", at: 8.54, tone: "check" },
    ],
    stamps: [{ text: "NO ESTÁS SOLA", from: 4.92, to: 6.2 }],
    hotline: [1.38, 4.6],
  },
  {
    src: "psa/08-cierre.mov",
    keep: [[0.45, 2.62]],
    title: "",
    baseZoom: 1,
    words: [
      ["El", 0.52, 0.64],
      ["respeto", 0.58, 1.04],
      ["protege,", 1.04, 1.52],
      ["la", 1.52, 1.62],
      ["indiferencia", 1.62, 2.1],
      ["no.", 2.1, 2.5],
    ],
    punches: [0.58, 2.1],
    chips: [],
    stamps: [],
  },
];

export const OUTRO_SECONDS = 4;
