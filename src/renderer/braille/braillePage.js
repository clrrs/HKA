/** Shared braille page composition helpers (pure; safe for Node tests). */

export const BRAILLE_PAGE_MAX_CHARS = 32000;
export const BRAILLE_TRUNCATION_MARKER = " … [end]";
export const BRAILLE_PART_SEPARATOR = " — ";

/**
 * Normalize to one linear braille page: collapse whitespace/newlines, trim.
 */
export function normalizeBraillePage(text) {
  if (typeof text !== "string") return "";
  let out = text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!out) return "";
  if (out.length > BRAILLE_PAGE_MAX_CHARS) {
    const keep = Math.max(0, BRAILLE_PAGE_MAX_CHARS - BRAILLE_TRUNCATION_MARKER.length);
    out = `${out.slice(0, keep)}${BRAILLE_TRUNCATION_MARKER}`;
  }
  return out;
}

/**
 * Join non-empty parts with a stable separator; drops duplicates of adjacent identical parts.
 */
export function joinBrailleParts(parts, separator = BRAILLE_PART_SEPARATOR) {
  const cleaned = [];
  for (const part of parts || []) {
    if (part == null) continue;
    const text = String(part).replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (cleaned.length && cleaned[cleaned.length - 1] === text) continue;
    cleaned.push(text);
  }
  return normalizeBraillePage(cleaned.join(separator));
}

/**
 * Merge a status into an existing page without duplicating the status text.
 */
export function withBrailleStatus(page, status) {
  const base = normalizeBraillePage(page || "");
  const note = normalizeBraillePage(status || "");
  if (!note) return base;
  if (!base) return note;
  if (base.startsWith(note) || base.includes(`${BRAILLE_PART_SEPARATOR}${note}`)) {
    return base;
  }
  return joinBrailleParts([note, base]);
}

/**
 * Build the stable idle warning page. Digits keep updating in speech/visual UI only.
 */
export function buildIdleBraillePage() {
  return joinBrailleParts([
    "Still there?",
    "Press any key to stay.",
    "Returning to start in 10 seconds.",
  ]);
}

/**
 * Home theme focus composite: list context + name + description/CTA.
 */
export function buildHomeThemeBraillePage({
  listLabel = "Theme selection list",
  name,
  description,
  includeListLabel = true,
}) {
  return joinBrailleParts([
    includeListLabel ? listLabel : null,
    name,
    "button",
    description,
  ]);
}

/**
 * Theme artifact circle composite from existing name + describedby copy.
 */
export function buildThemeArtifactBraillePage({ listLabel = "Artifact selection", name, description }) {
  return joinBrailleParts([listLabel, name, "button", description]);
}

/**
 * Artifact open / auto-read: one page with everything speech will eventually say.
 */
export function buildArtifactOpenBraillePage({
  title,
  alt,
  storyChunks = [],
  endHint = "Use left and right keys to navigate artifact tool bar.",
}) {
  const storyText = (storyChunks || [])
    .map((chunk) => (typeof chunk === "string" ? chunk : chunk?.text))
    .filter(Boolean)
    .join(" ");
  return joinBrailleParts([
    title ? `${title} opened.` : null,
    alt,
    storyText,
    endHint,
  ]);
}

export function buildSettingsClosedBraillePage(restoredControlPage) {
  return withBrailleStatus(restoredControlPage, "Settings closed.");
}

export function buildTipBraillePage(tipMessage) {
  return normalizeBraillePage(tipMessage || "");
}
