import React, { useState, useRef, useCallback } from "react";
import { useAppState } from "../../state/StateProvider";

const themes = [
  { id: "change",    label: "Change",    scene: null,     image: "/Change.png" },
  { id: "together",  label: "Together",  scene: null,     image: "/Together.png" },
  { id: "adventure", label: "Adventure", scene: "travel", image: "/Adventure.png" },
  { id: "work",      label: "Work",      scene: null,     image: "/Work.png" },
];

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
  const { goToScene } = useAppState();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const circleRefs = useRef([]);
  const headingRef = useRef(null);
  const carouselRef = useRef(null);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;

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
    const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
    const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
    const isSelect = e.key === "Enter" || e.key === "j";

    const idx = focusedIndexRef.current;

    if (isSelect && idx >= 0) {
      const theme = themes[idx];
      if (theme.scene) goToScene(theme.scene);
      e.preventDefault();
      return;
    }

    if (!isNext && !isBack) return;

    e.preventDefault();
    e.stopPropagation();

    if (isNext) {
      if (idx < 0) {
        showCarousel();
        circleRefs.current[0]?.focus();
      } else if (idx < themes.length - 1) {
        circleRefs.current[idx + 1]?.focus();
      } else {
        headingRef.current?.focus();
      }
    } else {
      if (idx < 0) {
        goToScene("start");
      } else if (idx === 0) {
        headingRef.current?.focus();
      } else {
        circleRefs.current[idx - 1]?.focus();
      }
    }
  }, [goToScene, showCarousel]);

  const hasFocus = focusedIndex >= 0;

  return (
    <div className="home-scene" onKeyDown={handleSceneKeyDown}>
      <div className="home-bg" aria-hidden="true" />

      <div className={`home-heading ${hasFocus ? "home-heading--hidden" : ""}`}>
        <div
          className="home-heading-text"
          ref={headingRef}
          tabIndex={-1}
          data-autofocus
          onFocus={handleHeadingFocus}
        >
          Choose a theme from Helen&nbsp;Keller&#8217;s life journey
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
                className={`theme-circle ${focusedIndex === i ? "theme-circle--focused" : ""}`}
                onFocus={() => handleFocus(i)}
                onBlur={handleBlur}
                onClick={() => { if (theme.scene) goToScene(theme.scene); }}
                aria-label={theme.label}
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
  );
}
