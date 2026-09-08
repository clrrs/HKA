const WORDS_PER_SEC = 2.4;

export function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateSpeechDurationMs(text) {
  return Math.round((countWords(text) / WORDS_PER_SEC) * 1000);
}
