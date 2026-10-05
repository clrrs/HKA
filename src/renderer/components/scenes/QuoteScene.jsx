import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import {
  BRAILLE_OUTPUT_SETTLE_MS,
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechAfterBrailleSettle,
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
import { setBraillePage } from "../../braille/brailleControl.js";

const QUOTE_VO_DIR = "Quote VOs";

const QUOTE_VO_FILE_BY_THEME_ID = {
  change: "3HK7_Quotes-Change_v01.mp3",
  together: "3HK7_Quotes-Together_v01.mp3",
  adventure: "3HK7_Quotes-Adventure_v01.mp3",
  work: "3HK7_Quotes-Work_v01.mp3"
};

const QUOTE_INTRO_ANNOUNCEMENT = "Short quote scene autoplaying now.";
const QUOTE_INTRO_PAUSE_MS = 1000;

const QUOTE_APPEARANCES = ["dark", "light"];

function quoteVoSrc(themeId) {
  const file = QUOTE_VO_FILE_BY_THEME_ID[themeId];
  if (!file) return "";
  const path = [QUOTE_VO_DIR, file].map(encodeURIComponent).join("/");
  return `./${path}`;
}

export default function QuoteScene() {
  const { currentTheme, goToScene, scene, speechMode, prefs } = useAppState();
  const announce = useAnnounce();
  const theme = getTheme(currentTheme);
  const audioRef = useRef(null);
  const quoteTextRef = useRef(null);
  const quoteEntryRef = useRef(null);
  const timeoutRef = useRef(null);
  // Quote copy is hidden from NVDA until the autoplay announcement has finished.
  const [quoteExposed, setQuoteExposed] = useState(false);
  const appearance = prefs?.theme === "light" ? "light" : "dark";
  const activeImageSrc = theme ? quoteScreenSrc(theme.id, appearance) : "";

  useEffect(() => {
    preloadQuoteScreens();
  }, []);

  useHeadphoneSinkEffect(
    audioRef,
    scene === "quote" ? currentTheme : scene
  );

  useLayoutEffect(() => {
    // Hide before paint on entry and on theme change so the quote cannot be
    // read during the autoplay announcement. Playback reveals it later.
    setQuoteExposed(false);
  }, [scene, theme?.id]);

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
    let cancelSpeechStops = () => {};
    let cancelEntryFocus = () => {};
    let announceTimer = null;
    let introTimer = null;
    const extraStopIds = [];

    setQuoteExposed(false);

    // Park focus immediately so it never falls to the document (title speech).
    // Quote text stays aria-hidden so this cannot start the quote utterance.
    cancelEntryFocus = scheduleFocus(quoteEntryRef.current);

    const startQuotePlayback = () => {
      if (cancelled) return;
      // Drop the park refocuses before moving to the quote, or they steal it back.
      cancelEntryFocus();
      cancelEntryFocus = () => {};

      const quoteEl = quoteTextRef.current;
      if (quoteEl) {
        quoteEl.tabIndex = 0;
        quoteEl.removeAttribute("aria-hidden");
        quoteEl.focus({ preventScroll: true });
      }
      if (theme?.quote) {
        // Controller page holds the full quote while speech is cut for VO.
        setBraillePage(theme.quote, {
          source: "QuoteScene-quote",
          immediate: true,
          suppressFocusMs: 600,
        });
      }
      setQuoteExposed(true);
      audioEl.currentTime = 0;

      // Braille settle, then cut the quote utterance, then play the VO.
      // An earlier Ctrl misses that utterance and it overlaps the recording.
      cancelSpeechStops = stopNvdaSpeechAfterBrailleSettle({
        settleMs: BRAILLE_OUTPUT_SETTLE_MS,
        followUpMs: 160,
        onSettled: () => {
          if (cancelled) return;
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
        },
      });
    };

    if (speechMode) {
      // Focus first, then announce, so the intro timer matches spoken content.
      announceTimer = window.setTimeout(() => {
        if (cancelled) return;
        announce(QUOTE_INTRO_ANNOUNCEMENT, {
          politeness: "assertive",
          source: "quote-scene-intro",
          brailleMode: "replace",
          suppressFocusMs: 400,
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
      if (announceTimer) window.clearTimeout(announceTimer);
      if (introTimer) window.clearTimeout(introTimer);
      cancelEntryFocus();
      cancelSpeechStops();
      for (const id of extraStopIds) window.clearTimeout(id);
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
          {/* Silent focus park: holds focus off the document so NVDA has nothing
              to announce before the autoplay intro. */}
          <div
            ref={quoteEntryRef}
            className="sr-only"
            tabIndex={0}
            aria-label={"\u00a0"}
            data-braille-ignore="true"
          />
          {/* Visually replaced by the full-screen mockup; kept as a11y/braille fallback. */}
          <div
            ref={quoteTextRef}
            className="quote-scene-text sr-only"
            tabIndex={quoteExposed ? 0 : -1}
            aria-hidden={quoteExposed ? undefined : true}
          >
            {theme.quote}
          </div>
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
