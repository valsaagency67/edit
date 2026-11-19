import script from "./script.json";
import voice from "./voice.json";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const COLORS = {
  orange: "#ff8a1f",
  orangeDeep: "#ff5e1a",
  pink: "#ff3d8b",
  cyan: "#36f1ff",
  purple: "#2a0f45",
  night: "#12061f",
  white: "#ffffff",
  ink: "#1b0b26",
};

export type VisualType =
  | "hook"
  | "phone"
  | "topics"
  | "clips"
  | "script"
  | "calendar"
  | "comments"
  | "warning"
  | "cta";

export type Word = { text: string; startMs: number; endMs: number };

export type Scene = {
  id: string;
  title: string;
  subtitle: string;
  visual: VisualType;
  transition: boolean;
  text: string;
  /** frame (global) where the scene starts */
  from: number;
  /** frames before the voice starts */
  lead: number;
  durationInFrames: number;
  voiceMs: number;
  words: Word[];
};

type VoiceEntry = { durationMs: number; words: Word[] };
const voiceData = voice as Record<string, VoiceEntry>;

const TAIL = 6;
const FINAL_TAIL = 45;

export const scenes: Scene[] = (() => {
  let cursor = 0;
  return script.scenes.map((s, i) => {
    const v = voiceData[s.id];
    if (!v) {
      throw new Error(
        `No hay voz para la escena "${s.id}". Ejecuta: python3 scripts/gta6_voice.py`,
      );
    }
    const transition = Boolean((s as { transition?: boolean }).transition);
    const lead = transition ? 14 : 3;
    const tail = i === script.scenes.length - 1 ? FINAL_TAIL : TAIL;
    const durationInFrames =
      lead + Math.ceil((v.durationMs / 1000) * FPS) + tail;
    const scene: Scene = {
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      visual: s.visual as VisualType,
      transition,
      text: s.text,
      from: cursor,
      lead,
      durationInFrames,
      voiceMs: v.durationMs,
      words: v.words,
    };
    cursor += durationInFrames;
    return scene;
  });
})();

export const TOTAL_FRAMES = scenes.reduce(
  (acc, s) => acc + s.durationInFrames,
  0,
);

/** Frame (relative to the scene start) where the n-th word matching `text` is spoken. */
export const wordFrame = (scene: Scene, text: string, nth = 0): number => {
  const norm = (t: string) =>
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9ñ]/g, "");
  const target = norm(text);
  const matches = scene.words.filter((w) => norm(w.text) === target);
  const w = matches[Math.min(nth, matches.length - 1)];
  if (!w) return scene.lead;
  return scene.lead + Math.round((w.startMs / 1000) * FPS);
};

/** All words on the global timeline (ms). */
export const globalWords = scenes.flatMap((s) =>
  s.words.map((w) => {
    const offset = ((s.from + s.lead) / FPS) * 1000;
    return {
      text: w.text,
      startMs: w.startMs + offset,
      endMs: w.endMs + offset,
      sceneId: s.id,
      keywords: `${s.title} ${s.subtitle}`,
    };
  }),
);
