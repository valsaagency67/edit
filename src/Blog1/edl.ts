// Lista de edición del Blog 1 — versión 3, estilo "mini vlog de un día".
// Referencia del cliente: arranca con un adelanto rapidísimo de los mejores
// momentos mientras se escribe el título, y después cuenta el día EN ORDEN,
// plano por plano (3-8 s cada uno), con la voz llevando la historia y
// subtítulos de una palabra, pequeños y limpios. Máximo 1 minuto.
//
// Tiempos en segundos del ORIGINAL (= del intermedio en public/blog1).
// Los subtítulos salen de captions.json filtrados al tramo [in, out].

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

/** Adelanto inicial: 3 frames por plano (solo tomas verticales). */
export const PREVIEW_FRAMES_EACH = 3;
export const PREVIEW: { clip: string; at: number }[] = [
  { clip: "C110", at: 2.0 },
  { clip: "C084", at: 8.0 },
  { clip: "C087", at: 4.0 },
  { clip: "C094", at: 64.0 },
  { clip: "C105", at: 1.2 },
  { clip: "C087", at: 12.5 },
  { clip: "C090", at: 25.0 },
  { clip: "C113", at: 1.0 },
  { clip: "C094", at: 95.0 },
  { clip: "C084", at: 30.5 },
  { clip: "C090", at: 2.0 },
  { clip: "C110", at: 9.0 },
  { clip: "C094", at: 130.0 },
  { clip: "C113", at: 8.5 },
];

export const TITLE = "mini vlog de un día con nosotros";

export const SEGMENTS: Segment[] = [
  // Mañana: arrancamos en el gym
  { clip: "C075", in: 1.35, out: 9.7, layout: "boxed", focusX: 0.5 },
  // La invitada
  { clip: "C076", in: 10.5, out: 17.1, layout: "boxed", focusX: 0.45 },
  // Entrenando
  { clip: "C084", in: 6.75, out: 11.3, layout: "cover" },
  { clip: "C087", in: 11.0, out: 14.3, layout: "cover" },
  { clip: "C090", in: 24.3, out: 28.7, layout: "cover" },
  { clip: "C094", in: 93.45, out: 96.6, layout: "cover" },
  // El spoiler
  { clip: "C084", in: 21.15, out: 28.7, layout: "cover" },
  // Más tarde: Pochoclo
  { clip: "C105", in: 0.45, out: 2.75, layout: "cover" },
  { clip: "C110", in: 0.0, out: 5.35, layout: "cover" },
  // Después del gym: la página web
  { clip: "C115", in: 0.0, out: 5.75, layout: "boxed", focusX: 0.42 },
  // Cierre en Apolo Gastro Bar
  { clip: "C116", in: 0.0, out: 2.65, layout: "boxed", focusX: 0.5 },
  { clip: "C116", in: 8.38, out: 12.25, layout: "boxed", focusX: 0.5 },
];
