/**
 * Short UI earcons (headphone-routed when AudioRoutingProvider is ready).
 * Does not stop NVDA speech — clips are brief and should not cut VO.
 *
 * Uses a reused <audio> element. Sink is applied after src is set and before
 * play(), matching persistent media elements. Ephemeral `new Audio(src)` often
 * falls back to the default sink on Windows/Electron.
 */

export const EARCON = {
  popupOpen: "popupOpen",
  popupClose: "popupClose",
  idleTimer: "idleTimer",
  home: "home",
  nextArtifact: "nextArtifact",
  previousArtifact: "previousArtifact",
  darkLightMode: "darkLightMode",
  volumeTone: "volumeTone",
};

const EARCON_SRC = {
  [EARCON.popupOpen]: "/sfx/popUpOpen.mp3",
  [EARCON.popupClose]: "/sfx/popUpClose.mp3",
  [EARCON.idleTimer]: "/sfx/idleTimer.mp3",
  [EARCON.home]: "/sfx/home.mp3",
  [EARCON.nextArtifact]: "/sfx/nextArtifact2.mp3",
  [EARCON.previousArtifact]: "/sfx/previousArtifact.mp3",
  [EARCON.darkLightMode]: "/sfx/darkLightMode.mp3",
  [EARCON.volumeTone]: "/sfx/volumeTone2.mp3",
};

let applySink = null;
/** Reused element so headphone routing stays consistent across plays. */
let sharedAudio = null;
let playGeneration = 0;

function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

/** Register headphone sink binder from AudioRoutingProvider. */
export function bindEarconSink(fn) {
  applySink = typeof fn === "function" ? fn : null;
  if (!applySink) return;
  Promise.resolve(applySink(getSharedAudio())).catch(() => {});
}

export function playEarcon(id) {
  const src = EARCON_SRC[id];
  if (!src) return;

  const audio = getSharedAudio();
  const gen = ++playGeneration;

  audio.pause();
  audio.src = src;

  const start = () => {
    if (gen !== playGeneration) return;
    audio.play().catch(() => {});
  };

  if (applySink) {
    // Apply sink after src so a source change cannot wipe headphone routing.
    Promise.resolve(applySink(audio)).then(start).catch(start);
  } else {
    start();
  }
}
