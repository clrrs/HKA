import React, { useEffect, useCallback } from "react";
import SceneContainer from "./components/SceneContainer";
import { useKeyboardNav } from "./state/useSceneManager";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export default function App() {
  useKeyboardNav();

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
    <div className="app">
      <div id="app-scaler" className="app-scaler">
        <SceneContainer />
      </div>
    </div>
  );
}

