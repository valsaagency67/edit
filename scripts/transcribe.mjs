// Transcribe media/audio/*.wav (español, timestamps por palabra) a public/subs/*.json
// en formato Caption de @remotion/captions, más un resumen legible en TRANSCRIPCIONES.md.
// Uso: node scripts/transcribe.mjs   (requiere whisper.cpp/ y el modelo descargado)
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
} from "../whisper-config.mjs";

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

const audioDir = path.join(process.cwd(), "media", "audio");
const subsDir = path.join(process.cwd(), "public", "subs");
mkdirSync(subsDir, { recursive: true });

const fmt = (ms) => (ms / 1000).toFixed(2).padStart(6, " ");
let md = "# Transcripciones\n";

for (const wav of readdirSync(audioDir).filter((f) => f.endsWith(".wav")).sort()) {
  const name = wav.replace(/\.wav$/, "");
  const out = path.join(subsDir, `${name}.json`);
  let captions;
  if (existsSync(out)) {
    captions = (await import(out, { with: { type: "json" } })).default;
  } else {
    console.log("Transcribiendo", name);
    const whisperCppOutput = await transcribe({
      inputPath: path.join(audioDir, wav),
      model: WHISPER_MODEL,
      whisperPath: WHISPER_PATH,
      whisperCppVersion: WHISPER_VERSION,
      tokenLevelTimestamps: true,
      splitOnWord: true,
      language: WHISPER_LANG,
      printOutput: false,
    });
    captions = toCaptions({ whisperCppOutput }).captions;
    writeFileSync(out, JSON.stringify(captions, null, 2));
  }
  md += `\n## ${name}\n\n`;
  // Una línea por frase (corta en puntuación o pausas > 0.6 s).
  let line = [];
  const flush = () => {
    if (line.length) {
      md += `- \`${fmt(line[0].startMs)}–${fmt(line.at(-1).endMs)}\` ${line.map((c) => c.text).join("").trim()}\n`;
      line = [];
    }
  };
  captions.forEach((c, i) => {
    const prev = captions[i - 1];
    if (prev && c.startMs - prev.endMs > 600) flush();
    line.push(c);
    if (/[.?!]$/.test(c.text.trim())) flush();
  });
  flush();
}
writeFileSync(path.join(process.cwd(), "TRANSCRIPCIONES.md"), md);
console.log("Listo: public/subs/*.json y TRANSCRIPCIONES.md");
