/**
 * Short UI earcons (headphone-routed when AudioRoutingProvider is ready).
 * Does not stop NVDA speech — clips are brief and should not cut VO.
 */

export const EARCON = {
  popupOpen: "popupOpen",
  popupClose: "popupClose",
  idleTimer: "idleTimer",
  home: "home",
  nextArtifact: "nextArtifact",
  previousArtifact: "previousArtifact",
  darkLightMode: "darkLightMode",
  scrollText: "scrollText",
};

const EARCON_SRC = {
  [EARCON.popupOpen]: "/sfx/popUpOpen.mp3",
  [EARCON.popupClose]: "/sfx/popUpClose.mp3",
  [EARCON.idleTimer]: "/sfx/idleTimer.mp3",
  [EARCON.home]: "/sfx/home.mp3",
  [EARCON.nextArtifact]: "/sfx/nextArtifact.mp3",
  [EARCON.previousArtifact]: "/sfx/previousArtifact.mp3",
  [EARCON.darkLightMode]: "/sfx/darkLightMode.mp3",
  [EARCON.scrollText]: "/sfx/scrollText.wav",
};

let applySink = null;
let current = null;

/** Register headphone sink binder from AudioRoutingProvider. */
export function bindEarconSink(fn) {
  applySink = typeof fn === "function" ? fn : null;
}

export function playEarcon(id) {
  const src = EARCON_SRC[id];
  if (!src) return;

  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }

  const audio = new Audio(src);
  current = audio;
  audio.addEventListener(
    "ended",
    () => {
      if (current === audio) current = null;
    },
    { once: true }
  );

  const start = () => {
    audio.play().catch(() => {});
  };

  if (applySink) {
    Promise.resolve(applySink(audio)).then(start).catch(start);
  } else {
    start();
  }
}
