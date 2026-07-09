let onMediaInterrupt = null;

export function setMediaInterruptHandler(handler) {
  onMediaInterrupt = handler;
}

export function notifyMediaInterrupt() {
  onMediaInterrupt?.();
}
