import { CAPTIONS } from "./Captions";

// Para activar la voz: genera un MP3 por línea en public/facturapp/vo/vo-00.mp3 … vo-10.mp3
// (un archivo por entrada de CAPTIONS, mismo orden) y pon VOICEOVER_ENABLED = true.
export const VOICEOVER_ENABLED = false;

/** Texto limpio (sin marcas *) de cada línea, en el orden de CAPTIONS. */
export const VOICE_LINES = CAPTIONS.map((c) => ({
  from: c.from,
  to: c.to,
  text: c.text.replace(/\*/g, ""),
}));
