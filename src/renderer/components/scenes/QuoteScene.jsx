import React, { useEffect, useRef } from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme } from "../../data/artifacts";

export default function QuoteScene() {
  const { currentTheme, goToScene, scene } = useAppState();
  const theme = getTheme(currentTheme);
  const readyRef = useRef(false);

  useEffect(() => {
    if (scene !== "quote" || !theme) {
      readyRef.current = false;
      return;
    }

    // Short delay prevents the keypress that activated the quote scene
    // (e.g. holding J to select a theme) from immediately dismissing it.
    readyRef.current = false;
    const armTimer = setTimeout(() => { readyRef.current = true; }, 250);

    const dismiss = () => {
      if (!readyRef.current) return;
      goToScene("travel");
    };

    window.addEventListener("keydown", dismiss);
    window.addEventListener("mousedown", dismiss);
    window.addEventListener("touchstart", dismiss);

    return () => {
      clearTimeout(armTimer);
      readyRef.current = false;
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("mousedown", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, [goToScene, scene, theme]);

  if (!theme) return null;

  return (
    <div className="quote-scene" role="region" aria-label={`${theme.label} theme quote`}>
      <div className="quote-scene-text" tabIndex={0} aria-live="polite">
        {theme.quote}
      </div>
      <p className="quote-scene-hint" aria-hidden="true">
        Press any key to continue
      </p>
    </div>
  );
}
