import React, { useEffect, useRef } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import {
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechAfterBrailleSettle,
  stopNvdaSpeechAggressively,
} from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";
import { useAnnounce } from "../../state/AnnouncerProvider";
import { getTheme } from "../../data/artifacts";
import { estimateSpeechDurationMs } from "../../utils/speechTiming";
import { scheduleFocus } from "../../state/useSceneManager";

const QUOTE_VO_DIR = "Quote VOs";

const QUOTE_VO_FILE_BY_THEME_ID = {
  change: "APH_Change_Scratch Aud.mp3",
  together: "APH_Together_Scratch Aud.mp3",
  adventure: "APH_Adventure_Scratch Aud.mp3",
  work: "APH_Work_Scratch Aud.mp3"
};

const QUOTE_INTRO_ANNOUNCEMENT = "Short quote scene autoplaying now.";
const QUOTE_INTRO_PAUSE_MS = 1000;
const DOCUMENT_TITLE = "Helen Keller Archive";

function quoteVoSrc(themeId) {
  const file = QUOTE_VO_FILE_BY_THEME_ID[themeId];
  if (!file) return "";
  const path = [QUOTE_VO_DIR, file].map(encodeURIComponent).join("/");
  return `./${path}`;
}

export default function QuoteScene() {
  const { currentTheme, goToScene, scene, speechMode } = useAppState();
  const announce = useAnnounce();
  const theme = getTheme(currentTheme);
  const audioRef = useRef(null);
  const quoteTextRef = useRef(null);
  const quoteEntryRef = useRef(null);
  const timeoutRef = useRef(null);

  useHeadphoneSinkEffect(
    audioRef,
    scene === "quote" ? currentTheme : scene
  );

  // Blank document title while on quote so NVDA does not announce it when
  // focus leaves the previous (now inert) home control.
  useEffect(() => {
    if (scene !== "quote") return undefined;
    const previousTitle = document.title;
    document.title = "\u00a0";
    return () => {
      document.title = previousTitle || DOCUMENT_TITLE;
    };
  }, [scene]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (scene !== "quote") {
      audioEl.pause();
      audioEl.currentTime = 0;
      return;
    }

    let cancelled = false;
    let cancelSpeechStops = () => {};
    let cancelEntryFocus = () => {};
    let introTimer = null;

    // Park focus immediately so it never falls to the document (title speech).
    cancelEntryFocus = scheduleFocus(quoteEntryRef.current);

    const startQuotePlayback = () => {
      if (cancelled) return;
      // Move to quote text for braille, then silence NVDA and play VO.
      quoteTextRef.current?.focus({ preventScroll: true });
      audioEl.currentTime = 0;
      stopNvdaSpeechAggressively();

      cancelSpeechStops = stopNvdaSpeechAfterBrailleSettle({
        settleMs: 150,
        followUpMs: 180,
        onSettled: () => {
          if (cancelled) return;
          const playPromise = audioEl.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        },
      });
    };

    if (speechMode) {
      // Focus first, then announce, so the intro timer matches spoken content.
      window.setTimeout(() => {
        if (cancelled) return;
        announce(QUOTE_INTRO_ANNOUNCEMENT, {
          politeness: "assertive",
          source: "quote-scene-intro",
        });
      }, 50);
      const waitMs =
        50 +
        estimateSpeechDurationMs(QUOTE_INTRO_ANNOUNCEMENT) +
        QUOTE_INTRO_PAUSE_MS;
      introTimer = window.setTimeout(startQuotePlayback, waitMs);
    } else {
      startQuotePlayback();
    }

    return () => {
      cancelled = true;
      if (introTimer) window.clearTimeout(introTimer);
      cancelEntryFocus();
      cancelSpeechStops();
    };
  }, [scene, theme?.id, speechMode, announce]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || scene !== "quote") return () => {};

    return guardNvdaSpeechSilenceWhilePlaying(audioEl);
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
        goToScene("theme");
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
      <div
        ref={quoteEntryRef}
        className="sr-only"
        tabIndex={0}
        aria-label={`${theme.label} theme quote`}
      />
      <div
        ref={quoteTextRef}
        className="quote-scene-text"
        tabIndex={0}
      >
        {theme.quote}
      </div>
      <p className="quote-scene-attribution" aria-hidden="true">
        — Helen Keller
      </p>
      <audio
        key={theme.id}
        ref={audioRef}
        src={quoteVoSrc(theme.id)}
        onPlay={stopNvdaSpeechAggressively}
        preload="auto"
      />
    </div>
  );
}
