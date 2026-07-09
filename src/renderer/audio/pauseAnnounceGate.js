let appPaused = false;

export function setAppPaused(paused) {
  appPaused = paused;
}

export function isAppPaused() {
  return appPaused;
}
