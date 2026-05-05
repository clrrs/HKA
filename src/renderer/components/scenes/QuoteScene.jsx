import React, { useEffect, useRef } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import { useAppState } from "../../state/StateProvider";
import { getTheme } from "../../data/artifacts";

const QUOTE_VO_DIR = "Quote VOs";

const QUOTE_VO_FILE_BY_THEME_ID = {
  change: "APH_Change_Scratch Aud.mp3",
  together: "APH_Together_Scratch Aud.mp3",
  adventure: "APH_Adventure_Scratch Aud.mp3",
  work: "APH_Work_Scratch Aud.mp3"
};

function quoteVoSrc(themeId) {
  const file = QUOTE_VO_FILE_BY_THEME_ID[themeId];
  if (!file) return "";
  const path = [QUOTE_VO_DIR, file].map(encodeURIComponent).join("/");
  return `./${path}`;
}

export default function QuoteScene() {
  const { currentTheme, goToScene, scene } = useAppState();
  const theme = getTheme(currentTheme);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useHeadphoneSinkEffect(
    audioRef,
    scene === "quote" ? currentTheme : scene
  );

  const stopSpeechForQuote = () => {
    // Quote scene uses an aggressive stop to reliably cut active NVDA speech.
    window.kioskApi?.send("stop-speech");
    setTimeout(() => {
      window.kioskApi?.send("stop-speech");
    }, 40);
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (scene === "quote") {
      audioEl.currentTime = 0;
      stopSpeechForQuote();
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  }, [scene, theme?.id]);

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
        key={theme.id}
        ref={audioRef}
        src={quoteVoSrc(theme.id)}
        onPlay={stopSpeechForQuote}
        preload="auto"
      />
    </div>
  );
}
