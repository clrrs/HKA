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
  const { scene, goToScene, goBack, toggleSettings } = useAppState();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Settings (A) - toggle settings overlay
      if (key === "a") {
        e.preventDefault();
        toggleSettings();
        return;
      }

      // Home (S)
      if (key === "s") {
        e.preventDefault();
        goToScene("home");
        return;
      }

      // Back (K) - simulate Shift+Tab
      if (key === "k") {
        e.preventDefault();
        const focusables = Array.from(
          document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null);
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
        const focusables = Array.from(
          document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null);
        const idx = focusables.indexOf(document.activeElement);
        if (idx < focusables.length - 1) focusables[idx + 1].focus();
        else if (focusables.length) focusables[0].focus();
        return;
      }

      // TTS (Q) - toggle NVDA speech via Electron IPC
      if (key === "q") {
        e.preventDefault();
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
  }, [scene, goToScene, goBack, toggleSettings]);
}

