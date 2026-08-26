/**
 * Reports how long auto-read (guided description playback) runs for each artifact
 * and flags the ones that outlast the App inactivity timer.
 *
 * Mirrors buildTextBlocks / buildAutoplayChunks / estimateChunkDurationMs from
 * ArtifactPopup.jsx. Run with: node scripts/audit_autoread_duration.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// artifacts.js is ESM source but package.json has no "type", so Node treats a .js
// import as CommonJS. Copy it to a .mjs temp file to load it as written.
const artifactsSrc = path.join(__dirname, "..", "src", "renderer", "data", "artifacts.js");
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hka-")), "artifacts.mjs");
fs.writeFileSync(tmp, fs.readFileSync(artifactsSrc));
const { themes, DESCRIPTION_MODE_COMBINED, GUIDED_DESCRIPTION_MODE_LETTERS } =
  await import(pathToFileURL(tmp).href);

const MISSING_COPY = "MISSING COPY";
const WORDS_PER_SEC = 2.4;
const SECTION_TRANSITION_MS = 1000;
const POST_READ_DWELL_MS = 4000;
const VIDEO_AUTOPLAY_PROMPT = "The video will now play.";
const HIDE_MISSING_GUIDED_SECTIONS = false;

// App.jsx
const DEFAULT_IDLE_SEC = 200;
const TOTAL_WARNING_SEC = 10 + 3 + 10 * 2;
const WARNING_AT_SEC = DEFAULT_IDLE_SEC - TOTAL_WARNING_SEC;

const GUIDED_HEADINGS = {
  photograph: "Photograph Description",
  document: "Document Description",
  object: "Object Description",
  video: "Video Description",
};

const textOrMissing = (v) =>
  v == null ? MISSING_COPY : String(v).trim() || MISSING_COPY;
const countWords = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const estimateChunkDurationMs = (t, bufferMs = SECTION_TRANSITION_MS) =>
  Math.round((countWords(t) / WORDS_PER_SEC) * 1000) + bufferMs;

function getGuidedTextForImage(artifact, images, imageIndex) {
  const fromImage = images[imageIndex]?.guidedDescription?.trim();
  if (fromImage) return fromImage;
  if (imageIndex === 0) {
    const fromArtifact = artifact?.guidedDescription?.trim();
    if (fromArtifact) return fromArtifact;
  }
  return MISSING_COPY;
}

function getBodyParagraphs(artifact) {
  const paragraphs = Array.isArray(artifact?.paragraphs)
    ? artifact.paragraphs.map((p) => String(p).trim()).filter(Boolean)
    : [];
  return paragraphs.length > 0
    ? paragraphs
    : [textOrMissing(artifact?.description)];
}

function buildTextBlocks(artifact, images, isCombined) {
  const bodyText = isCombined
    ? getBodyParagraphs(artifact)
    : [textOrMissing(artifact.description)];
  const blocks = bodyText.map((text, i) => ({
    key: `body-${i}`,
    kind: "body",
    text,
  }));
  if (isCombined) return blocks;

  const heading = GUIDED_HEADINGS[artifact.type] ?? "Guided Description";

  if (artifact.guidedDescriptionMode === GUIDED_DESCRIPTION_MODE_LETTERS) {
    const sections = artifact.letterSections ?? [];
    const total = sections.length > 0 ? sections.length : 1;
    for (let i = 0; i < total; i++) {
      const text = textOrMissing(sections[i]?.guidedDescription);
      if (HIDE_MISSING_GUIDED_SECTIONS && text === MISSING_COPY) continue;
      blocks.push({
        key: `guided-letter-${i}`,
        kind: "guided",
        heading: total > 1 ? `Letter ${i + 1} of ${total}` : "Letter",
        tagline: null,
        text,
      });
    }
    return blocks;
  }

  const isUnifiedDocument = artifact.type === "document" && images.length > 1;
  if (isUnifiedDocument) {
    const text = getGuidedTextForImage(artifact, images, 0);
    if (!HIDE_MISSING_GUIDED_SECTIONS || text !== MISSING_COPY) {
      blocks.push({ key: "guided-0", kind: "guided", heading, tagline: null, text });
    }
    return blocks;
  }

  const total = images.length > 0 ? images.length : 1;
  for (let i = 0; i < total; i++) {
    const text = getGuidedTextForImage(artifact, images, i);
    if (HIDE_MISSING_GUIDED_SECTIONS && text === MISSING_COPY) continue;
    blocks.push({
      key: `guided-${i}`,
      kind: "guided",
      heading,
      tagline: total > 1 ? `Image ${i + 1} of ${total}` : null,
      text,
    });
  }
  return blocks;
}

const getBlockSpeech = (block, isFirst) =>
  block.kind === "guided"
    ? [block.heading, block.tagline, block.text].filter(Boolean).join(". ")
    : isFirst
      ? `Artifact description. ${block.text}`
      : block.text;

function buildAutoplayChunks(artifact, blocks, isVideo) {
  let chunks = blocks.map((block, i) => ({
    text: getBlockSpeech(block, i === 0),
    section: block.kind === "guided" ? "guided" : "description",
  }));
  if (artifact.type === "document") {
    let sawGuided = false;
    chunks = chunks.filter((chunk) => {
      if (chunk.section !== "guided") return true;
      if (sawGuided) return false;
      sawGuided = true;
      return true;
    });
  }
  if (!isVideo) return chunks;
  const spoken = chunks.filter((c) => c.section === "description");
  spoken.push({ text: VIDEO_AUTOPLAY_PROMPT, section: "videoPrompt" });
  return spoken;
}

const rows = [];

for (const theme of Object.values(themes)) {
  const isCombined = theme.descriptionMode === DESCRIPTION_MODE_COMBINED;
  for (const artifact of theme.artifacts ?? []) {
    const isVideo = artifact.type === "video";
    const images = !isVideo ? artifact.images || [] : [];
    const blocks = buildTextBlocks(artifact, images, isCombined);
    const chunks = buildAutoplayChunks(artifact, blocks, isVideo);

    const readMs = chunks.reduce((sum, c) => sum + estimateChunkDurationMs(c.text), 0);
    const hasTranscript =
      typeof artifact.transcriptText === "string" &&
      artifact.transcriptText.trim().length > 0;
    const totalMs = readMs + (hasTranscript ? POST_READ_DWELL_MS : 0);
    const missing = blocks.filter((b) => b.text === MISSING_COPY).length;

    rows.push({
      theme: theme.id,
      id: artifact.id,
      title: artifact.title,
      chunks: chunks.length,
      missingBlocks: missing,
      sec: Math.round(totalMs / 1000),
    });
  }
}

rows.sort((a, b) => b.sec - a.sec);

console.log(
  `Inactivity warning fires at ${WARNING_AT_SEC}s of no key/mouse/focus activity; reset at ${DEFAULT_IDLE_SEC}s.\n` +
    `Auto-read emits no activity events, so anything at or past ${WARNING_AT_SEC}s is interrupted before it can land on the next-artifact arrow.\n`
);

const pad = (s, n) => String(s).padEnd(n);
console.log(
  `${pad("THEME", 10)}${pad("ID", 7)}${pad("CHUNKS", 8)}${pad("MISSING", 9)}${pad("SECONDS", 9)}FLAG  TITLE`
);
for (const r of rows) {
  const flag =
    r.sec >= DEFAULT_IDLE_SEC ? "RESET" : r.sec >= WARNING_AT_SEC ? "WARN " : "     ";
  console.log(
    `${pad(r.theme, 10)}${pad(r.id, 7)}${pad(r.chunks, 8)}${pad(r.missingBlocks, 9)}${pad(r.sec, 9)}${flag} ${r.title}`
  );
}

const overWarn = rows.filter((r) => r.sec >= WARNING_AT_SEC);
console.log(
  `\n${overWarn.length} of ${rows.length} artifacts outlast the inactivity warning threshold.`
);
