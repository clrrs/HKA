import React, { useState, useRef, useCallback, useEffect } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import { stopNvdaSpeechForMediaStart } from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";

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

export default function HomeScene() {
  const { goToScene, setVideoOverlayOpen } = useAppState();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showVideo, setShowVideo] = useState(false);
  const circleRefs = useRef([]);
  const headingRef = useRef(null);
  const carouselRef = useRef(null);
  const helpButtonRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;
  useHeadphoneSinkEffect(videoRef, showVideo);

  useEffect(() => {
    if (!showVideo || !modalRef.current) return;

    const container = modalRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key !== "Tab") return;

      const focusables = container.querySelectorAll(focusableSelector);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    const focusables = container.querySelectorAll(focusableSelector);
    if (focusables.length > 0) {
      focusables[0].focus();
    }

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
    if (helpButtonRef.current) {
      helpButtonRef.current.focus();
    }
  };

  const showCarousel = useCallback(() => {
    carouselRef.current?.removeAttribute("aria-hidden");
  }, []);

  const hideCarousel = useCallback(() => {
    carouselRef.current?.setAttribute("aria-hidden", "true");
  }, []);

  const handleFocus = useCallback((index) => {
    setFocusedIndex(index);
  }, []);

  const handleHeadingFocus = useCallback(() => {
    setFocusedIndex(-1);
    hideCarousel();
  }, [hideCarousel]);

  const handleBlur = useCallback((e) => {
    const scene = e.currentTarget.closest(".home-scene");
    requestAnimationFrame(() => {
      if (scene && !scene.contains(document.activeElement)) {
        setFocusedIndex(-1);
        hideCarousel();
      }
    });
  }, [hideCarousel]);

  const handleSceneKeyDown = useCallback((e) => {
    if (e.repeat) return;
    if (showVideo) return;
    const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
    const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
    const isSelect = e.key === "Enter" || e.key === "j";

    const idx = focusedIndexRef.current;

    if (isSelect && idx >= 0) {
      const theme = themes[idx];
      if (!theme.disabledForTesting && theme.scene) goToScene(theme.scene, { theme: theme.id });
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
      } else {
        headingRef.current?.focus();
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
      <div className="home-bg" aria-hidden="true" />
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
          className="home-heading-text"
          ref={headingRef}
          tabIndex={-1}
          data-autofocus
          onFocus={handleHeadingFocus}
          aria-label="Choose a theme from Helen Keller's life journey"
        >
          <span aria-hidden="true">
            Choose a theme from Helen&nbsp;Keller&#8217;s life journey
          </span>
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
                onClick={() => { if (!theme.disabledForTesting && theme.scene) goToScene(theme.scene, { theme: theme.id }); }}
                aria-label={`${theme.label}, ${i + 1} of ${themes.length}`}
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

      {showVideo && (
        <div
          className="start-video-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Instructional video"
        >
          <div className="start-video-backdrop" />
          <div className="start-video-modal" ref={modalRef}>
            <button
              type="button"
              className="exit-pill-btn start-video-exit-btn"
              onClick={closeVideo}
              aria-label="Close instructional video"
            >
              Exit
            </button>
            <div className="start-video-body">
              <video
                ref={videoRef}
                src="3HK7_Instructional_v02-260430-ColorSpaceTest.mp4"
                onPlay={stopNvdaSpeechForMediaStart}
                onEnded={closeVideo}
                autoPlay
                tabIndex={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
