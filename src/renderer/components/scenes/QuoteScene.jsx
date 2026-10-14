import React, { useEffect, useRef, useState } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import {
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechAggressively,
} from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";
import {
  getTheme,
  getThemeHeadingLabel,
  getThemeTipMessage,
} from "../../data/artifacts";
import {
  QUOTE_THEME_IDS,
  preloadQuoteScreens,
  quoteScreenSrc,
} from "../../data/quoteScreens";
import { combineAnnouncement, estimateSpeechDurationMs } from "../../utils/speechTiming";
import { scheduleFocusAfterReveal } from "../../state/useSceneManager";
import { SILENT_NAME } from "../../utils/silentName";

const QUOTE_VO_DIR = "Quote VOs";

const QUOTE_VO_FILE_BY_THEME_ID = {
  change: "3HK7_Quotes-Change_v01.mp3",
  together: "3HK7_Quotes-Together_v01.mp3",
  adventure: "3HK7_Quotes-Adventure_v01.mp3",
  work: "3HK7_Quotes-Work_v01.mp3"
};

const QUOTE_INTRO_ANNOUNCEMENT = "Short quote scene autoplaying now.";
/**
 * From the entry's focus to the hush: lands in the pause after the intro,
 * before the quote would be spoken (same offset the live-region version used).
 */
const QUOTE_INTRO_HUSH_MS = 50 + estimateSpeechDurationMs(QUOTE_INTRO_ANNOUNCEMENT);
/** Start the hush timer anyway if the entry's focus event never comes. */
const QUOTE_FOCUS_FALLBACK_MS = 300;

const QUOTE_APPEARANCES = ["dark", "light"];

function quoteVoSrc(themeId) {
  const file = QUOTE_VO_FILE_BY_THEME_ID[themeId];
  if (!file) return "";
  const path = [QUOTE_VO_DIR, file].map(encodeURIComponent).join("/");
  return `./${path}`;
}

/**
 * Everything from the quote scene up to the theme page as one braille block:
 * intro, quote, the first-visit tip, then the theme page copy. Speech is cut
 * after the intro; the theme page reads its own part when it lands.
 */
function quoteSceneBlock(theme, withTip) {
  return combineAnnouncement([
    QUOTE_INTRO_ANNOUNCEMENT,
    theme.quote,
    withTip ? getThemeTipMessage(theme.label) : null,
    getThemeHeadingLabel(theme),
  ]);
}

export default function QuoteScene() {
  const { currentTheme, goToScene, scene, speechMode, prefs, hasSeenThemeTip } =
    useAppState();
  const theme = getTheme(currentTheme);
  // Fixed for each visit: a name change while focused would be re-spoken.
  const entryKey = scene === "quote" && theme ? theme.id : null;
  const [entry, setEntry] = useState({ key: null, block: null });
  if (entryKey !== entry.key) {
    setEntry({
      key: entryKey,
      block: entryKey ? quoteSceneBlock(theme, !hasSeenThemeTip) : null,
    });
  }
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
    let introTimer = null;
    let fallbackTimer = null;
    const extraStopIds = [];

    // Focus the entry and leave it there: its name is the whole block, so
    // NVDA reads the intro and braille keeps everything. The scene was hidden
    // until now, so focus goes there after the reveal.
    const entryEl = quoteEntryRef.current;
    cancelEntryFocus = scheduleFocusAfterReveal(entryEl);

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

    // Hush + VO fire in the pause after the intro, timed from the focus that
    // starts the read.
    const startIntroTimer = () => {
      entryEl?.removeEventListener("focus", startIntroTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (cancelled || introTimer) return;
      introTimer = window.setTimeout(hushAndPlay, QUOTE_INTRO_HUSH_MS);
    };

    if (speechMode) {
      entryEl?.addEventListener("focus", startIntroTimer);
      fallbackTimer = window.setTimeout(startIntroTimer, QUOTE_FOCUS_FALLBACK_MS);
    } else {
      hushAndPlay();
    }

    return () => {
      cancelled = true;
      entryEl?.removeEventListener("focus", startIntroTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (introTimer) window.clearTimeout(introTimer);
      cancelEntryFocus();
      for (const id of extraStopIds) window.clearTimeout(id);
    };
  }, [scene, theme?.id, speechMode]);

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
          {/* Stays focused for the whole quote scene; its name is the block.
              role="application" so NVDA doesn't add "section". */}
          <div
            ref={quoteEntryRef}
            className="sr-only"
            tabIndex={0}
            role="application"
            aria-label={entry.block?.speech || SILENT_NAME}
            aria-braillelabel={entry.block?.braille || undefined}
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
