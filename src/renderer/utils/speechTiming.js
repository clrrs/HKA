// ~138 WPM. Tuned for the kiosk NVDA voice (rate ~29).
const WORDS_PER_SEC = 138 / 60;

/** Punctuation-only run NVDA does not speak but pauses on. */
export const SPEECH_PAUSE = ": . : . :";
/** Length of one SPEECH_PAUSE, measured on the kiosk NVDA voice. */
export const SPEECH_PAUSE_MS = 800;
/** NVDA's lag between a focus move and the start of the focused name's speech. */
export const FOCUS_READ_LEAD_MS = 200;

export function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateSpeechDurationMs(text) {
  return Math.round((countWords(text) / WORDS_PER_SEC) * 1000);
}

function cleanParts(parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean);
}

/**
 * One output for several pieces of copy: speech gets SPEECH_PAUSE between the
 * pieces, braille gets the same pieces without the pause marks.
 */
export function combineAnnouncement(parts) {
  const clean = cleanParts(parts);
  return {
    speech: clean.join(` ${SPEECH_PAUSE} `),
    braille: clean.join(" "),
  };
}

/**
 * Estimated start of each piece inside combineAnnouncement(parts).speech, plus
 * the total. Indices match `parts`; an empty piece is skipped in the speech and
 * takes no time. Pause marks are timed with
 * SPEECH_PAUSE_MS, never word-counted (they would read as 5 words).
 */
export function partStartOffsetsMs(parts) {
  const starts = [];
  let at = 0;
  let spoken = 0;
  for (const part of parts) {
    const text = String(part || "").trim();
    if (text && spoken > 0) at += SPEECH_PAUSE_MS;
    starts.push(at);
    if (text) {
      at += estimateSpeechDurationMs(text);
      spoken += 1;
    }
  }
  return { starts, totalMs: at };
}
