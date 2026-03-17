import React, { useEffect, useRef } from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme } from "../../data/artifacts";

export default function QuoteScene() {
  const { currentTheme, goToScene, scene } = useAppState();
  const theme = getTheme(currentTheme);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (scene === "quote") {
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  }, [scene]);

  useEffect(() => {
    if (scene !== "quote" || !theme) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleEnded = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        goToScene("travel");
      }, 1000);
    };

    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("ended", handleEnded);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [goToScene, scene, theme]);

  if (!theme) return null;

  return (
    <div className="quote-scene" role="region" aria-label={`${theme.label} theme quote`}>
      <div className="quote-scene-text" tabIndex={0} aria-live="polite">
        {theme.quote}
      </div>
      <p className="quote-scene-attribution" aria-hidden="true">
        — Helen Keller
      </p>
      <audio
        ref={audioRef}
        src="AdventureQuoteVO.m4a"
        preload="auto"
      />
    </div>
  );
}
