import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TheBoldFont } from "../load-font";
import { COLORS, globalWords } from "./timeline";

type GWord = (typeof globalWords)[number];

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const STOP = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "un",
  "una",
  "con",
  "en",
  "a",
  "tu",
  "te",
  "lo",
  "que",
  "es",
  "se",
]);

const isKeyword = (w: GWord) => {
  const n = norm(w.text);
  if (!n || STOP.has(n)) return false;
  return w.keywords
    .split(/\s+/)
    .map(norm)
    .some(
      (k) =>
        k.length > 1 &&
        (k === n || (k.length > 3 && n.startsWith(k.slice(0, 4)))),
    );
};

/** Group words into pages of up to 3 words, breaking on pauses and scene changes. */
const buildPages = (words: GWord[]) => {
  const pages: GWord[][] = [];
  let cur: GWord[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const gap = prev ? w.startMs - prev.endMs : 0;
    if (
      cur.length >= 3 ||
      (prev && (gap > 220 || prev.sceneId !== w.sceneId))
    ) {
      if (cur.length) pages.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) pages.push(cur);
  return pages;
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const pages = useMemo(() => buildPages(globalWords), []);

  const idx = pages.findIndex((p, i) => {
    const next = pages[i + 1];
    const end = next
      ? Math.min(next[0].startMs, p[p.length - 1].endMs + 700)
      : p[p.length - 1].endMs + 700;
    return ms >= p[0].startMs && ms < end;
  });
  if (idx === -1) return null;
  const page = pages[idx];
  const pageFrame = frame - Math.round((page[0].startMs / 1000) * fps);

  return (
    <div
      style={{
        position: "absolute",
        top: 1470,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 18,
        fontFamily: TheBoldFont,
      }}
    >
      {page.map((w, i) => {
        const active = ms >= w.startMs && ms < w.endMs + 60;
        const said = ms >= w.startMs;
        const key = isKeyword(w);
        const pop = spring({
          frame:
            pageFrame -
            Math.round(((w.startMs - page[0].startMs) / 1000) * fps),
          fps,
          config: { damping: 10, stiffness: 220 },
        });
        const bg = key && said ? COLORS.orange : COLORS.white;
        return (
          <div
            key={`${w.startMs}-${i}`}
            style={{
              fontSize: 78,
              padding: "10px 26px 4px",
              borderRadius: 18,
              background: bg,
              color: key && said ? COLORS.white : COLORS.ink,
              border: `5px solid ${COLORS.ink}`,
              boxShadow: `0 10px 0 ${COLORS.ink}`,
              transform: `scale(${(0.5 + 0.5 * pop) * (active ? 1.12 : 1)}) rotate(${active ? -2 : 0}deg)`,
              opacity: said ? 1 : 0.0,
              textTransform: "lowercase",
            }}
          >
            {w.text}
          </div>
        );
      })}
    </div>
  );
};
