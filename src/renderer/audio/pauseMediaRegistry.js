import { useEffect } from "react";

const registered = new Set();
const wasPlaying = new Set();

export function registerPausableMedia(element) {
  if (!element) return () => {};
  registered.add(element);
  return () => {
    registered.delete(element);
    wasPlaying.delete(element);
  };
}

export function pauseRegisteredMedia() {
  wasPlaying.clear();
  for (const el of registered) {
    if (!el.paused) {
      wasPlaying.add(el);
      el.pause();
    }
  }
}

export function resumeRegisteredMedia() {
  for (const el of wasPlaying) {
    if (registered.has(el)) {
      el.play().catch(() => {});
    }
  }
  wasPlaying.clear();
}

export function usePausableMedia(mediaRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    let unregister = () => {};

    const attach = () => {
      const el = mediaRef.current;
      if (!el) return;
      unregister();
      unregister = registerPausableMedia(el);
    };

    attach();
    const frameId = mediaRef.current ? null : requestAnimationFrame(attach);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      unregister();
    };
  }, [mediaRef, enabled]);
}
