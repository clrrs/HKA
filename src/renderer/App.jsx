import React, { useEffect, useCallback } from "react";
import SceneContainer from "./components/SceneContainer";
import AccessibilityMenu from "./components/AccessibilityMenu";
import { useKeyboardNav } from "./state/useSceneManager";
import { useAppState } from "./state/StateProvider";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export default function App() {
  useKeyboardNav();
  const { showSettings, toggleSettings } = useAppState();

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
      </div>
    </div>
  );
}

