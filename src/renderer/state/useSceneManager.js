import { useEffect, useLayoutEffect, useRef } from "react";
import { useAppState } from "./StateProvider";
import {
  ensureInputLogTools,
  getElementSummary,
  logInputEvent,
} from "./interactionLog";

export function useSceneFocus(sceneId, isActive) {
  const lastFocusedRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!isActive) return;
    
    const sceneEl = document.querySelector(`[data-scene="${sceneId}"]`);
    if (!sceneEl) return;
    
    const first = sceneEl.querySelector('[data-autofocus]') ||
      sceneEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    
    if (first) {
      first.focus({ preventScroll: true });
    }
    
    return () => { 
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
    toggleSpeechMode,
    toggleIdleTimeoutDisabled,
    triggerTestEasterEgg,
  } = useAppState();
  const lastTtsToggleRef = useRef(0);
  const klEggRef = useRef({ step: 0, lastTs: 0 });
  const qEggRef = useRef({ streak: 0, lastTs: 0 });

  useEffect(() => {
    const ENABLE_TEST_SHORTCUTS = true;
    const KL_EGG_PATTERN = ["k", "l", "k", "l", "k", "l"];
    const KL_EGG_MAX_GAP_MS = 450;
    const Q_EGG_MAX_GAP_MS = 280;
    ensureInputLogTools();

    function processTestEasterEggKeys(key) {
      const now = Date.now();

      if (key !== "q") {
        qEggRef.current = { streak: 0, lastTs: 0 };
      }
      if (key !== "k" && key !== "l") {
        klEggRef.current = { step: 0, lastTs: 0 };
      }

      if (key === "q") {
        const qr = qEggRef.current;
        if (now - qr.lastTs > Q_EGG_MAX_GAP_MS) {
          qr.streak = 1;
        } else {
          qr.streak += 1;
        }
        qr.lastTs = now;
        if (qr.streak >= 7) {
          qr.streak = 0;
          triggerTestEasterEgg();
          return "triggered";
        }
        if (qr.streak >= 2) {
          return "suppress-q";
        }
        return null;
      }

      if (key === "k" || key === "l") {
        const st = klEggRef.current;
        if (now - st.lastTs > KL_EGG_MAX_GAP_MS) {
          st.step = key === "k" ? 1 : 0;
          st.lastTs = now;
          return null;
        }
        const expected = KL_EGG_PATTERN[st.step];
        if (key !== expected) {
          st.step = key === "k" ? 1 : 0;
          st.lastTs = now;
          return null;
        }
        st.step += 1;
        st.lastTs = now;
        if (st.step >= 6) {
          st.step = 0;
          triggerTestEasterEgg();
          return "triggered";
        }
        return null;
      }

      return null;
    }

    const handleKeyDown = (e) => {
      if (e.repeat) return; // ignore key repeat (keypad hold)
      const key = e.key.toLowerCase();

      let testEggResult = null;
      // Test-only backdoor shortcuts (always active)
      if (ENABLE_TEST_SHORTCUTS) {
        testEggResult = processTestEasterEggKeys(key);
        if (testEggResult === "triggered") {
          e.preventDefault();
          return;
        }

        if (key === "1") {
          e.preventDefault();
          goToScene("start");
          return;
        }
        if (key === "2") {
          e.preventDefault();
          goToScene("home");
          return;
        }
        if (key === "3") {
          e.preventDefault();
          goToScene("quote", { theme: "adventure" });
          return;
        }
        if (key === "0") {
          e.preventDefault();
          toggleIdleTimeoutDisabled();
          return;
        }
      }

      if (scene === "quote" || scene === "attract") return;

      // Settings (A) - toggle settings overlay
      if (key === "a") {
        e.preventDefault();
        toggleSettings();
        return;
      }

      // Home (S) — guard against synthetic S from toggle-tts (Insert+S); disabled on instruction scene
      if (key === "s") {
        if (scene === "instruction") return;
        if (Date.now() - lastTtsToggleRef.current < 500) return;
        e.preventDefault();
        goToScene("start");
        return;
      }

      // Back (K) - simulate Shift+Tab
      if (key === "k") {
        e.preventDefault();
        const container = showSettings
          ? document.querySelector(".settings-panel") || document
          : document.querySelector(".artifact-video-transcript-modal") ||
            document.querySelector(".artifact-video-modal") ||
            document.querySelector(".document-viewer-expanded") ||
            document.querySelector(".carousel-zoom") ||
            document.querySelector(".carousel-expanded") ||
            document;
        const rawFocusables = Array.from(
          container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const focusables =
          container.classList &&
          (container.classList.contains("carousel-expanded") ||
            container.classList.contains("carousel-zoom"))
            ? rawFocusables
            : rawFocusables.filter((el) => el.offsetParent !== null);
        const idx = focusables.indexOf(document.activeElement);
        let nextEl = null;
        if (idx > 0) nextEl = focusables[idx - 1];
        else if (focusables.length) nextEl = focusables[focusables.length - 1];
        if (nextEl) {
          if (scene === "artifact") {
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
        if (scene === "artifact") {
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
        const container = showSettings
          ? document.querySelector(".settings-panel") || document
          : document.querySelector(".artifact-video-transcript-modal") ||
            document.querySelector(".artifact-video-modal") ||
            document.querySelector(".document-viewer-expanded") ||
            document.querySelector(".carousel-zoom") ||
            document.querySelector(".carousel-expanded") ||
            document;
        const rawFocusables = Array.from(
          container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const focusables =
          container.classList &&
          (container.classList.contains("carousel-expanded") ||
            container.classList.contains("carousel-zoom"))
            ? rawFocusables
            : rawFocusables.filter((el) => el.offsetParent !== null);
        const idx = focusables.indexOf(document.activeElement);
        let nextEl = null;
        if (idx < focusables.length - 1) nextEl = focusables[idx + 1];
        else if (focusables.length) nextEl = focusables[0];
        if (nextEl) {
          if (scene === "artifact") {
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

      // TTS (Q) - toggle NVDA speech via Electron IPC and in-app state
      if (key === "q") {
        if (ENABLE_TEST_SHORTCUTS && testEggResult === "suppress-q") {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        lastTtsToggleRef.current = Date.now();
        toggleSpeechMode();
        window.kioskApi?.send("toggle-tts");
        return;
      }

      // Vol Up (W)
      if (key === "w") {
        e.preventDefault();
        window.kioskApi?.send("volume-up");
        return;
      }

      // Vol Down (I)
      if (key === "i") {
        e.preventDefault();
        window.kioskApi?.send("volume-down");
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
    toggleSpeechMode,
    toggleIdleTimeoutDisabled,
    triggerTestEasterEgg,
  ]);
}

