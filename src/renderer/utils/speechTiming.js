// ~120 WPM. Tuned for the kiosk NVDA voice (rate ~29); was 2.4 (~144 WPM).
const WORDS_PER_SEC = 2.0;

export function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateSpeechDurationMs(text) {
  return Math.round((countWords(text) / WORDS_PER_SEC) * 1000);
}
