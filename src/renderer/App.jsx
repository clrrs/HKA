import React, { useEffect, useCallback, useState, useRef } from "react";
import SceneContainer from "./components/SceneContainer";
import AccessibilityMenu from "./components/AccessibilityMenu";
import { useKeyboardNav } from "./state/useSceneManager";
import { useAppState } from "./state/StateProvider";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export default function App() {
  useKeyboardNav();
  const { scene, showSettings, toggleSettings, resetToStart } = useAppState();
  const [idleCountdown, setIdleCountdown] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const settingsPanelRef = useRef(null);

  const rescale = useCallback(() => {
    const el = document.getElementById("app-scaler");
    if (!el) return;
    const scale = Math.min(
      window.innerWidth / DESIGN_W,
      window.innerHeight / DESIGN_H
    );
    el.style.transform = `scale(${scale})`;
  }, []);

  useEffect(() => {
    rescale();
    window.addEventListener("resize", rescale);
    return () => window.removeEventListener("resize", rescale);
  }, [rescale]);

  useEffect(() => {
    // Disable inactivity timer while on the start scene
    if (scene === "start") {
      setIdleCountdown(null);
      lastActivityRef.current = Date.now();
      return;
    }

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIdleCountdown(null);
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "focusin"];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, true);
    });

    const intervalId = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);

      if (elapsedSeconds >= 60) {
        resetToStart();
        lastActivityRef.current = Date.now();
        setIdleCountdown(null);
        return;
      }

      if (elapsedSeconds >= 50) {
        const remaining = 60 - elapsedSeconds;
        setIdleCountdown(remaining >= 1 && remaining <= 10 ? remaining : null);
      } else {
        setIdleCountdown(null);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity, true);
      });
      clearInterval(intervalId);
    };
  }, [resetToStart, scene]);

  const handleSettingsKeyDown = (e) => {
    if (e.repeat) return;
    if (!showSettings || e.key !== "Tab") return;

    const panel = settingsPanelRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);

    if (!focusables.length) return;

    const currentIndex = focusables.indexOf(document.activeElement);
    let nextIndex;

    if (e.shiftKey) {
      // Move backwards
      if (currentIndex <= 0) {
        nextIndex = focusables.length - 1;
      } else {
        nextIndex = currentIndex - 1;
      }
    } else {
      // Move forwards
      if (currentIndex === -1 || currentIndex === focusables.length - 1) {
        nextIndex = 0;
      } else {
        nextIndex = currentIndex + 1;
      }
    }

    e.preventDefault();
    focusables[nextIndex].focus();
  };

  useEffect(() => {
    if (!showSettings) return;
    const panel = settingsPanelRef.current;
    if (!panel) return;

    const first = panel.querySelector("[data-autofocus]") ||
      panel.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    if (first) {
      setTimeout(() => {
        first.focus();
      }, 50);
    }
  }, [showSettings]);

  return (
    <div className="app" role="application">
      <div id="app-scaler" className="app-scaler">
        <SceneContainer />
        {showSettings && (
          <div
            className="settings-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-settings-title"
          >
            <div className="settings-backdrop" onClick={toggleSettings} />
            <div
              className="settings-panel"
              ref={settingsPanelRef}
              role="document"
              onKeyDown={handleSettingsKeyDown}
            >
              <button
                type="button"
                className="settings-close-btn"
                onClick={toggleSettings}
                aria-label="Close accessibility settings"
                data-autofocus
              >
                ×
              </button>
              <h2 id="accessibility-settings-title">Accessibility Settings</h2>
              <AccessibilityMenu />
            </div>
          </div>
        )}
        {idleCountdown !== null && (
          <div className="idle-overlay" aria-hidden="false">
            <div className="idle-countdown" aria-live="assertive">
              {idleCountdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

