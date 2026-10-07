import React, { useEffect, useRef } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import {
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechAggressively,
} from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";
import { useAnnounce } from "../../state/AnnouncerProvider";
import { getTheme } from "../../data/artifacts";
import {
  QUOTE_THEME_IDS,
  preloadQuoteScreens,
  quoteScreenSrc,
} from "../../data/quoteScreens";
import { estimateSpeechDurationMs } from "../../utils/speechTiming";
import { scheduleFocus } from "../../state/useSceneManager";

const QUOTE_VO_DIR = "Quote VOs";

const QUOTE_VO_FILE_BY_THEME_ID = {
  change: "3HK7_Quotes-Change_v01.mp3",
  together: "3HK7_Quotes-Together_v01.mp3",
  adventure: "3HK7_Quotes-Adventure_v01.mp3",
  work: "3HK7_Quotes-Work_v01.mp3"
};

const QUOTE_INTRO_ANNOUNCEMENT = "Short quote scene autoplaying now.";
/** Same pause nudge used after role "button" on theme/artifact circles. */
const QUOTE_SPEECH_PAUSE = ": . : . :";

const QUOTE_APPEARANCES = ["dark", "light"];

function quoteVoSrc(themeId) {
  const file = QUOTE_VO_FILE_BY_THEME_ID[themeId];
  if (!file) return "";
  const path = [QUOTE_VO_DIR, file].map(encodeURIComponent).join("/");
  return `./${path}`;
}

function quoteSceneAnnouncement(quote) {
  const trimmed = String(quote || "").trim();
  if (!trimmed) return `${QUOTE_INTRO_ANNOUNCEMENT} ${QUOTE_SPEECH_PAUSE}`;
  return `${QUOTE_INTRO_ANNOUNCEMENT} ${QUOTE_SPEECH_PAUSE} ${trimmed}`;
}

export default function QuoteScene() {
  const { currentTheme, goToScene, scene, speechMode, prefs } = useAppState();
  const announce = useAnnounce();
  const theme = getTheme(currentTheme);
  const audioRef = useRef(null);
  const quoteEntryRef = useRef(null);
  const timeoutRef = useRef(null);
  const appearance = prefs?.theme === "light" ? "light" : "dark";
  const activeImageSrc = theme ? quoteScreenSrc(theme.id, appearance) : "";

  useEffect(() => {
    preloadQuoteScreens();
  }, []);

  useHeadphoneSinkEffect(
    audioRef,
    scene === "quote" ? currentTheme : scene
  );

  useEffect(() => {
    const audioEl = audioRef.current;

    if (scene !== "quote") {
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      return;
    }

    if (!audioEl) return;

    let cancelled = false;
    let cancelEntryFocus = () => {};
    let announceTimer = null;
    let introTimer = null;
    const extraStopIds = [];

    // Park focus and leave it there — braille comes from the live announcement,
    // not from moving focus onto the quote text.
    cancelEntryFocus = scheduleFocus(quoteEntryRef.current);

    const hushAndPlay = () => {
      if (cancelled) return;

      audioEl.currentTime = 0;
      stopNvdaSpeechAggressively();
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }

      for (const delay of [100, 280, 520, 900]) {
        extraStopIds.push(
          window.setTimeout(() => {
            if (!cancelled) stopNvdaSpeechAggressively();
          }, delay)
        );
      }
    };

    if (speechMode) {
      // One live announcement: intro, pause nudge, then quote (for braille).
      // Timer covers the intro only — hush+VO fire in the ": . : . :" buffer
      // before the quote would be spoken.
      announceTimer = window.setTimeout(() => {
        if (cancelled) return;
        announce(quoteSceneAnnouncement(theme?.quote), {
          politeness: "assertive",
          source: "quote-scene-intro",
        });
      }, 50);
      const waitMs = 50 + estimateSpeechDurationMs(QUOTE_INTRO_ANNOUNCEMENT);
      introTimer = window.setTimeout(hushAndPlay, waitMs);
    } else {
      hushAndPlay();
    }

    return () => {
      cancelled = true;
      if (announceTimer) window.clearTimeout(announceTimer);
      if (introTimer) window.clearTimeout(introTimer);
      cancelEntryFocus();
      for (const id of extraStopIds) window.clearTimeout(id);
    };
  }, [scene, theme?.id, theme?.quote, speechMode, announce]);

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

  return (
    <div className="quote-scene">
      {/* Keep every mockup mounted so the first theme click never waits on decode. */}
      {QUOTE_THEME_IDS.map((themeId) =>
        QUOTE_APPEARANCES.map((mode) => {
          const src = quoteScreenSrc(themeId, mode);
          const isActive = Boolean(activeImageSrc) && src === activeImageSrc;
          return (
            <img
              key={`${themeId}-${mode}`}
              className={`quote-scene-image${isActive ? " quote-scene-image--active" : ""}`}
              src={src}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          );
        })
      )}
      {theme ? (
        <>
          {/* Silent focus park: stays focused for the whole quote scene.
              role="application" so NVDA doesn't add "section". */}
          <div
            ref={quoteEntryRef}
            className="sr-only"
            tabIndex={0}
            role="application"
            aria-label={"\u00a0"}
          />
          <audio
            key={theme.id}
            ref={audioRef}
            src={quoteVoSrc(theme.id)}
            onPlay={stopNvdaSpeechAggressively}
            preload="auto"
          />
        </>
      ) : null}
    </div>
  );
}
