const MEDIA_STOP_DEBOUNCE_MS = 250;

/** Wait for focus / live-region braille to settle before silencing speech. */
export const BRAILLE_OUTPUT_SETTLE_MS = 150;

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
 * Send Ctrl twice so active NVDA speech is reliably silenced while leaving
 * the latest focus / live-region text on braille.
 */
export function stopNvdaSpeechAggressively() {
  window.kioskApi?.send("stop-speech");
  window.setTimeout(() => {
    window.kioskApi?.send("stop-speech");
  }, 40);
}

/**
 * Quote / media start: wait for a11y output to reach braille, then cut speech
 * and optionally fire again shortly after play (late focus announcements).
 */
export function stopNvdaSpeechAfterBrailleSettle(options = {}) {
  const {
    settleMs = BRAILLE_OUTPUT_SETTLE_MS,
    followUpMs = 120,
    onSettled,
  } = options;

  const timers = [];

  timers.push(
    window.setTimeout(() => {
      stopNvdaSpeechAggressively();
      onSettled?.();
      if (followUpMs > 0) {
        timers.push(
          window.setTimeout(() => {
            stopNvdaSpeechAggressively();
          }, followUpMs)
        );
      }
    }, settleMs)
  );

  return () => {
    for (const id of timers) clearTimeout(id);
  };
}
