import { useEffect, useLayoutEffect, useRef } from "react";
import { useAppState } from "./StateProvider";
import {
  ensureInputLogTools,
  getElementSummary,
  logInputEvent,
} from "./interactionLog";
import { moveSettingsFocus } from "../utils/settingsFocus";

/** Focus after inert/overlay teardown. Chromium often ignores a single .focus() in that same turn. */
export function scheduleFocus(el, { stealWindow = false } = {}) {
  if (!el) return () => {};
  const apply = () => {
    if (stealWindow) window.focus();
    if (!el || !document.contains(el)) return;
    if (el.closest("[inert]")) return;
    el.focus({ preventScroll: true });
  };
  apply();
  const raf = requestAnimationFrame(apply);
  const t1 = window.setTimeout(apply, 50);
  const t2 = window.setTimeout(apply, 150);
  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(t1);
    window.clearTimeout(t2);
  };
}

/**
 * Focus a target that was hidden or inert until this commit (scene change,
 * overlay closing). NVDA speaks focus that lands in a subtree the same frame
 * it is revealed, but braille keeps showing the previous element. So focus
 * waits on the silent park (App) for two frames, then moves.
 */
export function scheduleFocusAfterReveal(el, { stealWindow = false } = {}) {
  if (!el) return () => {};
  if (document.activeElement !== el) {
    const park = document.querySelector("[data-focus-park]");
    if (park && !park.closest("[inert]")) park.focus({ preventScroll: true });
  }
  let raf2 = 0;
  let cancelFocus = () => {};
  const raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      cancelFocus = scheduleFocus(el, { stealWindow });
    });
  });
  return () => {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    cancelFocus();
  };
}

export function useSceneFocus(sceneId, isActive) {
  const lastFocusedRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!isActive) return;
    
    const sceneEl = document.querySelector(`[data-scene="${sceneId}"]`);
    if (!sceneEl) return;
    // The scene already placed focus itself (e.g. the theme tip).
    if (sceneEl.contains(document.activeElement)) return;
    
    const first = sceneEl.querySelector('[data-autofocus]') ||
      sceneEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

    // The scene was display:none until this commit.
    const cancel = first ? scheduleFocusAfterReveal(first) : () => {};
    return () => {
      cancel();
      lastFocusedRef.current = document.activeElement;
    };
  }, [sceneId, isActive]);
}

export function useKeyboardNav() {
  const {
    scene,
    subscene,
    goToScene,
    goBack,
    toggleSettings,
    showSettings,
    speechMode,
    togglePaused,
    lastTtsToggleRef,
  } = useAppState();

  useEffect(() => {
    const ENABLE_TEST_SHORTCUTS = true;
    ensureInputLogTools();

    const handleKeyDown = (e) => {
      if (e.repeat) return; // ignore key repeat (keypad hold)
      const key = e.key.toLowerCase();

      // Test-only backdoor shortcuts (always active)
      if (ENABLE_TEST_SHORTCUTS) {
        if (key === "1") {
          e.preventDefault();
          goToScene("instruction");
          return;
        }
        if (key === "2") {
          e.preventDefault();
          goToScene("home"); // theme selection (home)
          return;
        }
        if (key === "3") {
          e.preventDefault();
          goToScene("quote", { theme: "adventure" });
          return;
        }
      }

      // Shift — NVDA handles speech; app syncs media/timers only
      if (key === "shift") {
        if (scene === "attract" || scene === "quote") {
          return;
        }
        togglePaused();
        return;
      }

      if (scene === "quote" || scene === "attract") return;

      // Settings (A) - toggle settings overlay
      if (key === "a") {
        e.preventDefault();
        toggleSettings();
        return;
      }

      // Home / theme selection (S or Home key) — guard against synthetic S from toggle-tts (Insert+S)
      if (key === "s" || key === "home") {
        if (Date.now() - lastTtsToggleRef.current < 500) return;
        e.preventDefault();
        goToScene("home");
        return;
      }

      // Back (K) - simulate Shift+Tab
      if (key === "k") {
        e.preventDefault();
        if (showSettings) {
          const panel = document.querySelector(".settings-panel");
          const nextEl = moveSettingsFocus(panel, "prev");
          if (nextEl) {
            logInputEvent({
              source: "useKeyboardNav",
              scene,
              subscene,
              key,
              action: "navigate-prev-focus",
              target: getElementSummary(nextEl),
              details: `from=${getElementSummary(document.activeElement)}`,
            });
            nextEl.focus();
          }
          return;
        }
        const container =
          document.querySelector(".artifact-popup-transcript") ||
          document.querySelector(".carousel-zoom") ||
          document.querySelector(".artifact-popup") ||
          document;
        const noWraparound =
          scene === "home" ||
          scene === "theme" ||
          container.classList?.contains("artifact-popup") ||
          container.classList?.contains("artifact-popup-transcript");
        const rawFocusables = Array.from(
          container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const focusables =
          container.classList &&
          (container.classList.contains("artifact-popup") ||
            container.classList.contains("artifact-popup-transcript") ||
            container.classList.contains("carousel-zoom"))
            ? rawFocusables
            : rawFocusables.filter((el) => el.offsetParent !== null);
        const idx = focusables.indexOf(document.activeElement);
        let nextEl = null;
        if (idx > 0) nextEl = focusables[idx - 1];
        else if (focusables.length && !noWraparound) nextEl = focusables[focusables.length - 1];
        if (nextEl) {
          if (container !== document) {
            logInputEvent({
              source: "useKeyboardNav",
              scene,
              subscene,
              key,
              action: "navigate-prev-focus",
              target: getElementSummary(nextEl),
              details: `from=${getElementSummary(document.activeElement)}`,
            });
          }
          nextEl.focus();
        }
        return;
      }

      // Select (J) - simulate Enter
      if (key === "j") {
        e.preventDefault();
        const activeContainer =
          document.activeElement?.closest(
            ".artifact-popup-transcript, .carousel-zoom, .artifact-popup"
          ) || null;
        if (activeContainer) {
          logInputEvent({
            source: "useKeyboardNav",
            scene,
            subscene,
            key,
            action: "select-active",
            target: getElementSummary(document.activeElement),
          });
        }
        document.activeElement?.click();
        return;
      }

      // Next (L) - simulate Tab
      if (key === "l") {
        e.preventDefault();
        if (showSettings) {
          const panel = document.querySelector(".settings-panel");
          const nextEl = moveSettingsFocus(panel, "next");
          if (nextEl) {
            logInputEvent({
              source: "useKeyboardNav",
              scene,
              subscene,
              key,
              action: "navigate-next-focus",
              target: getElementSummary(nextEl),
              details: `from=${getElementSummary(document.activeElement)}`,
            });
            nextEl.focus();
          }
          return;
        }
        const container =
          document.querySelector(".artifact-popup-transcript") ||
          document.querySelector(".carousel-zoom") ||
          document.querySelector(".artifact-popup") ||
          document;
        const noWraparound =
          scene === "home" ||
          scene === "theme" ||
          container.classList?.contains("artifact-popup") ||
          container.classList?.contains("artifact-popup-transcript");
        const rawFocusables = Array.from(
          container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const focusables =
          container.classList &&
          (container.classList.contains("artifact-popup") ||
            container.classList.contains("artifact-popup-transcript") ||
            container.classList.contains("carousel-zoom"))
            ? rawFocusables
            : rawFocusables.filter((el) => el.offsetParent !== null);
        const idx = focusables.indexOf(document.activeElement);
        let nextEl = null;
        if (idx < focusables.length - 1) nextEl = focusables[idx + 1];
        else if (focusables.length && !noWraparound) nextEl = focusables[0];
        if (nextEl) {
          if (container !== document) {
            logInputEvent({
              source: "useKeyboardNav",
              scene,
              subscene,
              key,
              action: "navigate-next-focus",
              target: getElementSummary(nextEl),
              details: `from=${getElementSummary(document.activeElement)}`,
            });
          }
          nextEl.focus();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    scene,
    subscene,
    goToScene,
    goBack,
    toggleSettings,
    showSettings,
    speechMode,
    togglePaused,
    lastTtsToggleRef,
  ]);
}

