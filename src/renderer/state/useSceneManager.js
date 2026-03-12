import { useEffect, useRef } from "react";
import { useAppState } from "./StateProvider";

export function useSceneFocus(sceneId, isActive) {
  const lastFocusedRef = useRef(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const sceneEl = document.querySelector(`[data-scene="${sceneId}"]`);
    if (!sceneEl) return;
    
    const first = sceneEl.querySelector('[data-autofocus]') ||
      sceneEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    
    if (first) {
      // Small timeout to ensure visible
      setTimeout(() => { 
        first.focus(); 
      }, 50);
    }
    
    return () => { 
      lastFocusedRef.current = document.activeElement; 
    };
  }, [sceneId, isActive]);
}

export function useKeyboardNav() {
  const { scene, goToScene, goBack, toggleSettings, showSettings, toggleSpeechMode } = useAppState();

  useEffect(() => {
    let lastTtsToggle = 0;
    const ENABLE_TEST_SHORTCUTS = true;

    const handleKeyDown = (e) => {
      if (e.repeat) return; // ignore key repeat (keypad hold)
      const key = e.key.toLowerCase();

      // Test-only backdoor shortcuts (always active)
      if (ENABLE_TEST_SHORTCUTS) {
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
        if (Date.now() - lastTtsToggle < 500) return;
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
        if (idx > 0) focusables[idx - 1].focus();
        else if (focusables.length) focusables[focusables.length - 1].focus();
        return;
      }

      // Select (J) - simulate Enter
      if (key === "j") {
        e.preventDefault();
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
        if (idx < focusables.length - 1) focusables[idx + 1].focus();
        else if (focusables.length) focusables[0].focus();
        return;
      }

      // TTS (Q) - toggle NVDA speech via Electron IPC and in-app state
      if (key === "q") {
        e.preventDefault();
        lastTtsToggle = Date.now();
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
  }, [scene, goToScene, goBack, toggleSettings, showSettings, toggleSpeechMode]);
}

