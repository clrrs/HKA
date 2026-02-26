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

  return (
    <div className="app" role="application">
      <div id="app-scaler" className="app-scaler">
        <SceneContainer />
        {showSettings && (
          <div className="settings-overlay" role="dialog" aria-label="Accessibility Settings">
            <div className="settings-backdrop" onClick={toggleSettings} />
            <div className="settings-panel">
              <h2 tabIndex={0}>Accessibility Settings</h2>
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

