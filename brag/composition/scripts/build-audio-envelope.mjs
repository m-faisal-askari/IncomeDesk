import fs from "node:fs";

const sourcePath = "assets/music/audio-envelope.json";
const outputPath = "assets/music/audio-envelope.js";
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const envelope = source.items?.[0]?.envelope;

if (!envelope || !Array.isArray(envelope.values) || !Number.isFinite(envelope.hopMs)) {
  throw new Error("The HyperFrames audio envelope is missing or malformed.");
}

const frameCount = Math.ceil((21 * 1000) / envelope.hopMs);
const samples = envelope.values
  .slice(0, frameCount)
  .map((db) => Math.round(Math.max(0, Math.min(1, (db + 48) / 36)) * 10000) / 10000);

const payload = { hopMs: envelope.hopMs, values: samples };
fs.writeFileSync(outputPath, `window.__audioEnvelope = ${JSON.stringify(payload)};\n`, "utf8");
console.log(`Wrote ${outputPath} (${samples.length} envelope samples)`);
