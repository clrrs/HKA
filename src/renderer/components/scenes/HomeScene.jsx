// Home scene — theme selection (landing page after instructions).
import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import {
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechForMediaStart,
} from "../../audio/nvdaSpeechControl";
import { getThemeCarouselName, getThemeCarouselDescription } from "../../data/artifacts";
import { useAppState } from "../../state/StateProvider";
import { scheduleFocus } from "../../state/useSceneManager";

const TESTING_ADVENTURE_ONLY = false;

const ALL_THEMES = [
  { id: "change",    label: "Change",    scene: "quote", image: "./Change.png" },
  { id: "together",  label: "Together",  scene: "quote", image: "./Together.png" },
  { id: "adventure", label: "Adventure", scene: "quote", image: "./Adventure.png" },
  { id: "work",      label: "Work",      scene: "quote", image: "./Work.png" },
];

const themes = TESTING_ADVENTURE_ONLY
  ? (() => {
      const adventure = ALL_THEMES.find((t) => t.id === "adventure");
      const others = ALL_THEMES.filter((t) => t.id !== "adventure").map((t) => ({ ...t, disabledForTesting: true }));
      return [adventure, ...others];
    })()
  : ALL_THEMES;

const ITEM_WIDTH = 600;
const GAP = 77;
const ITEM_STEP = ITEM_WIDTH + GAP;
const SCREEN_CENTER = 960;
const IDLE_OFFSET = 800;

function getTrackTranslateX(focusedIndex) {
  if (focusedIndex < 0) return IDLE_OFFSET;
  const itemCenter = focusedIndex * ITEM_STEP + ITEM_WIDTH / 2;
  return SCREEN_CENTER - itemCenter;
}

const HOME_HEADING_LABEL =
  "Choose a theme from Helen Keller's life journey. Use left and right keys to view themes. Press the select key to enter a theme. Use the home key to return to this page.";

export default function HomeScene({ isActive = false }) {
  const {
    goToScene,
    setVideoOverlayOpen,
    speechMode,
    showSettings,
    lastTtsToggleRef,
    homeArrivalNonce,
  } = useAppState();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showVideo, setShowVideo] = useState(false);
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [announceHomeArrival, setAnnounceHomeArrival] = useState(false);
  const circleRefs = useRef([]);
  const headingRef = useRef(null);
  const carouselRef = useRef(null);
  const helpButtonRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const videoExitExploringRef = useRef(false);
  const focusedIndexRef = useRef(focusedIndex);
  const wasActiveRef = useRef(isActive);
  const prevShowSettingsRef = useRef(showSettings);
  const prevHomeArrivalNonceRef = useRef(homeArrivalNonce);
  // Snapshot before we update wasActiveRef — true only when Home key is pressed
  // while already on the home scene (nonce bump without inactive→active).
  const stayedOnHomeRef = useRef(false);
  focusedIndexRef.current = focusedIndex;

  stayedOnHomeRef.current = wasActiveRef.current && isActive;
  if (isActive && !wasActiveRef.current) {
    setAnnounceHomeArrival(true);
  }
  wasActiveRef.current = isActive;

  // Re-announce "Home." when the Home key is pressed while already on this screen.
  useLayoutEffect(() => {
    if (homeArrivalNonce === prevHomeArrivalNonceRef.current) return;
    prevHomeArrivalNonceRef.current = homeArrivalNonce;
    if (!stayedOnHomeRef.current || homeArrivalNonce === 0) return;

    setAnnounceHomeArrival(true);
    const heading = headingRef.current;
    if (!heading) return;
    heading.blur();
    const focusHeading = () => {
      heading.focus({ preventScroll: true });
    };
    requestAnimationFrame(focusHeading);
    const t = window.setTimeout(focusHeading, 50);
    return () => window.clearTimeout(t);
  }, [homeArrivalNonce]);

  useLayoutEffect(() => {
    const wasOpen = prevShowSettingsRef.current;
    prevShowSettingsRef.current = showSettings;
    if (showSettings) return;
    if (!wasOpen) return;
    const idx = focusedIndexRef.current;
    if (idx < 0) return;
    const el = circleRefs.current[idx];
    el?.focus({ preventScroll: true });
  }, [showSettings]);

  useHeadphoneSinkEffect(videoRef, showVideo);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    stopNvdaSpeechForMediaStart();
    video.play().catch(() => {});
    return guardNvdaSpeechSilenceWhilePlaying(video, {
      shouldSilence: () => !videoExitExploringRef.current,
    });
  }, [showVideo]);

  useEffect(() => {
    if (!showVideo || !modalRef.current) return;

    const container = modalRef.current;

    const focusExit = () => {
      container.querySelector(".start-video-exit-btn")?.focus();
    };
    const focusVideo = () => {
      videoRef.current?.focus();
    };

    // Two stops only: from either control, next/back both go to the other.
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const isNext = (e.key === "Tab" && !e.shiftKey) || key === "l";
      const isBack = (e.key === "Tab" && e.shiftKey) || key === "k";
      if (!isNext && !isBack) return;

      e.preventDefault();
      e.stopPropagation();

      if (document.activeElement === videoRef.current) {
        focusExit();
      } else {
        focusVideo();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    focusVideo();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [showVideo]);

  const openVideo = () => {
    setShowVideo(true);
    setVideoOverlayOpen(true);
  };

  const closeVideo = () => {
    setShowVideo(false);
    setVideoOverlayOpen(false);
    // After inert teardown, Chromium often ignores a same-turn .focus().
    scheduleFocus(helpButtonRef.current);
  };

  // Home / S must close the help video so it can't block the home page.
  useEffect(() => {
    if (!showVideo) return;
    const handleHome = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key !== "s" && key !== "home") return;
      if (Date.now() - lastTtsToggleRef.current < 500) return;
      closeVideo();
    };
    window.addEventListener("keydown", handleHome);
    return () => window.removeEventListener("keydown", handleHome);
  }, [showVideo, lastTtsToggleRef]);

  const showCarousel = useCallback(() => {
    carouselRef.current?.removeAttribute("aria-hidden");
  }, []);

  const hideCarousel = useCallback(() => {
    carouselRef.current?.setAttribute("aria-hidden", "true");
  }, []);

  // Snap idle while hidden so re-entry doesn't play leftover carousel CSS.
  useLayoutEffect(() => {
    if (isActive) return;
    setFocusedIndex(-1);
    hideCarousel();
  }, [isActive, hideCarousel]);

  const handleFocus = useCallback((index) => {
    setFocusedIndex(index);
  }, []);

  const handleHeadingFocus = useCallback(() => {
    setFocusedIndex(-1);
    hideCarousel();
  }, [hideCarousel]);

  const handleHeadingBlur = useCallback((e) => {
    const next = e.relatedTarget;
    if (next && carouselRef.current?.contains(next)) {
      setAnnounceHomeArrival(false);
    }
  }, []);

  const handleBlur = useCallback((e) => {
    if (showSettings || document.querySelector(".settings-overlay")) return;
    const scene = e.currentTarget.closest(".home-scene");
    requestAnimationFrame(() => {
      if (document.querySelector(".settings-overlay")) return;
      if (scene && !scene.contains(document.activeElement)) {
        setFocusedIndex(-1);
        hideCarousel();
      }
    });
  }, [hideCarousel, showSettings]);

  const handleSceneKeyDown = useCallback((e) => {
    if (e.repeat) return;
    if (showVideo) return;
    const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
    const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
    const isSelect = e.key === "Enter" || e.key === "j";

    const idx = focusedIndexRef.current;

    if (isSelect && idx >= 0) {
      const theme = themes[idx];
      if (!theme.disabledForTesting && theme.scene) {
        goToScene(theme.scene, { theme: theme.id });
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!isNext && !isBack) return;

    e.preventDefault();
    e.stopPropagation();

    if (isNext) {
      if (idx < 0) {
        const active = document.activeElement;
        const isOnHelpButton =
          active && active.classList && active.classList.contains("home-help-btn");
        if (isOnHelpButton) {
          headingRef.current?.focus();
        } else {
          showCarousel();
          circleRefs.current[0]?.focus();
        }
      } else if (idx < themes.length - 1) {
        circleRefs.current[idx + 1]?.focus();
      }
    } else {
      if (idx < 0) {
        const active = document.activeElement;
        const isOnHelpButton =
          active && active.classList && active.classList.contains("home-help-btn");
        if (!isOnHelpButton) {
          helpButtonRef.current?.focus();
        }
      } else if (idx === 0) {
        headingRef.current?.focus();
      } else {
        circleRefs.current[idx - 1]?.focus();
      }
    }
  }, [goToScene, showCarousel, showVideo]);

  const hasFocus = focusedIndex >= 0;

  return (
    <div className="home-scene" onKeyDown={handleSceneKeyDown}>
      {themes.map((theme) => (
        <p
          key={`theme-circle-desc-${theme.id}`}
          id={`theme-circle-desc-${theme.id}`}
          className="sr-only"
        >
          {getThemeCarouselDescription(theme.id)}
        </p>
      ))}
      <div className="home-bg" aria-hidden="true" />
      <div
        className="home-scene-main"
        aria-hidden={showVideo ? true : undefined}
        inert={showVideo ? "" : undefined}
      >
        <button
          ref={helpButtonRef}
          type="button"
          className="nav-btn icon-btn home-help-btn"
          aria-label="Watch instructional video"
          onClick={openVideo}
        >
          <img src="./InformationIcon.svg" alt="" aria-hidden="true" />
        </button>

        <div className={`home-heading ${hasFocus ? "home-heading--hidden" : ""}`}>
          <div
            className="home-heading-inner"
            ref={headingRef}
            tabIndex={-1}
            data-autofocus
            onFocus={handleHeadingFocus}
            onBlur={handleHeadingBlur}
            aria-label={
              speechMode
                ? announceHomeArrival
                  ? `Home. ${HOME_HEADING_LABEL}`
                  : HOME_HEADING_LABEL
                : undefined
            }
          >
            <p className="home-heading-text" aria-hidden={speechMode ? true : undefined}>
              Choose a theme from Helen&nbsp;Keller&#8217;s life journey
            </p>
            <p className="home-heading-cta" aria-hidden={speechMode ? true : undefined}>
              Use left and right keys to view themes.
              <br />
              Press the select key to enter a theme.
              <br />
              Use the home key to return to this page.
            </p>
          </div>
        </div>

        <div ref={carouselRef} className="home-carousel" aria-hidden="true">
          <div
            role="list"
            aria-label="Theme selection"
            className="theme-circles"
            style={{ transform: `translateX(${getTrackTranslateX(focusedIndex)}px)` }}
          >
            {themes.map((theme, i) => (
              <div role="listitem" key={theme.id}>
                <button
                  ref={(el) => { circleRefs.current[i] = el; }}
                  className={`theme-circle ${focusedIndex === i ? "theme-circle--focused" : ""} ${theme.disabledForTesting ? "theme-circle--disabled" : ""}`}
                  onFocus={() => handleFocus(i)}
                  onBlur={handleBlur}
                  onClick={() => {
                    if (!theme.disabledForTesting && theme.scene) {
                      goToScene(theme.scene, { theme: theme.id });
                    }
                  }}
                  aria-label={
                    speechMode && !theme.disabledForTesting
                      ? getThemeCarouselName(theme.label, i, themes.length)
                      : `${theme.label}, ${i + 1} of ${themes.length}`
                  }
                  aria-describedby={
                    theme.disabledForTesting
                      ? undefined
                      : `theme-circle-desc-${theme.id}`
                  }
                  aria-disabled={theme.disabledForTesting ? true : undefined}
                  tabIndex={0}
                >
                  <span className="theme-circle-inner" aria-hidden="true" />
                  <img className="theme-circle-img" src={theme.image} alt="" aria-hidden="true" />
                  <span className="theme-label" aria-hidden="true">{theme.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {hasFocus && (
          <div className="theme-indicators" aria-hidden="true">
            {themes.map((theme, i) => (
              <span
                key={theme.id}
                className={`theme-indicator ${focusedIndex === i ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {showVideo && (
        <div
          className="start-video-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Instructional video"
        >
          <div className="start-video-backdrop" />
          <div
            className="start-video-modal"
            ref={modalRef}
            style={{ "--video-aspect": videoAspect }}
          >
            <button
              type="button"
              className="exit-pill-btn start-video-exit-btn"
              onClick={closeVideo}
              onMouseEnter={() => {
                videoExitExploringRef.current = true;
              }}
              onMouseLeave={() => {
                videoExitExploringRef.current = false;
              }}
              onFocus={() => {
                videoExitExploringRef.current = true;
              }}
              onBlur={() => {
                videoExitExploringRef.current = false;
              }}
              aria-label="Close instructional video"
            >
              Exit
            </button>
            <div className="start-video-body">
              <video
                ref={videoRef}
                src="3HK7_Instructional_v06-260929.mp4"
                onLoadedMetadata={(e) => {
                  const { videoWidth, videoHeight } = e.currentTarget;
                  if (videoWidth > 0 && videoHeight > 0) {
                    setVideoAspect(videoWidth / videoHeight);
                  }
                }}
                onEnded={closeVideo}
                tabIndex={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
