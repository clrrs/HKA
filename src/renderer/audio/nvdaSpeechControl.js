const MEDIA_STOP_DEBOUNCE_MS = 250;

let lastStopAt = 0;

/**
 * Stop current NVDA speech right before media starts.
 * Debounced to avoid duplicate triggers from mirrored players.
 */
export function stopNvdaSpeechForMediaStart() {
  const now = Date.now();
  if (now - lastStopAt < MEDIA_STOP_DEBOUNCE_MS) {
    return;
  }
  lastStopAt = now;
  window.kioskApi?.send("stop-speech");
}

/**
 * Match the quote playback behavior: send Ctrl twice so active NVDA speech is
 * reliably silenced while leaving the latest live-region text on braille.
 */
export function stopNvdaSpeechAggressively() {
  window.kioskApi?.send("stop-speech");
  window.setTimeout(() => {
    window.kioskApi?.send("stop-speech");
  }, 40);
}
