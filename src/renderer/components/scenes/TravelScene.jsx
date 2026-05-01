import React, { useState, useRef, useCallback } from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme } from "../../data/artifacts";

const ITEM_WIDTH = 600;
const GAP = 77;
const ITEM_STEP = ITEM_WIDTH + GAP;
const SCREEN_CENTER = 960;
const IDLE_OFFSET = 1000;

function getTrackTranslateX(focusedIndex) {
  if (focusedIndex < 0) return IDLE_OFFSET;
  const itemCenter = focusedIndex * ITEM_STEP + ITEM_WIDTH / 2;
  return SCREEN_CENTER - itemCenter;
}

function getDefaultThumbnailSrc(artifact) {
  if (artifact.type === "video" && artifact.posterSrc) return `./${artifact.posterSrc}`;
  if (artifact.images && artifact.images.length > 0) return `./${artifact.images[0].src}`;
  return null;
}

function getThumbnailSources(artifact) {
  const fallbackSrc = getDefaultThumbnailSrc(artifact);

  // Adventure artifacts use designer-provided bubble thumbnails in /public.
  if (artifact?.id?.startsWith("3A")) {
    return {
      src: `./${artifact.id}_thumbnail.png`,
      fallbackSrc
    };
  }

  return {
    src: fallbackSrc,
    fallbackSrc: null
  };
}

export default function TravelScene() {
  const {
    goToScene,
    currentTheme,
    speechMode
  } = useAppState();
  const theme = getTheme(currentTheme);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const circleRefs = useRef([]);
  const headingRef = useRef(null);
  const themesButtonRef = useRef(null);
  const carouselRef = useRef(null);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;

  const artifacts = theme?.artifacts || [];

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
    const scene = e.currentTarget.closest(".travel-scene");
    requestAnimationFrame(() => {
      if (scene && !scene.contains(document.activeElement)) {
        setFocusedIndex(-1);
        hideCarousel();
      }
    });
  }, [hideCarousel]);

  const handleSceneKeyDown = useCallback((e) => {
    if (e.repeat) return;
    const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
    const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
    const isSelect = e.key === "Enter" || e.key === "j";

    const idx = focusedIndexRef.current;

    // In screen reader / speech mode, let the global keypad handler
    // manage most focus order, but preserve the behavior where Back
    // from the title (no artifact focused) returns to the theme selector.
    if (speechMode) {
      const active = document.activeElement;
      const onTitle =
        active &&
        active.classList &&
        active.classList.contains("travel-heading-inner");
      const onThemesButton = active === themesButtonRef.current;

      if (isBack && idx < 0 && onTitle) {
        e.preventDefault();
        e.stopPropagation();
        themesButtonRef.current?.focus();
      } else if (isBack && onThemesButton) {
        e.preventDefault();
        e.stopPropagation();
        headingRef.current?.focus();
      }
      return;
    }

    if (isSelect && idx >= 0) {
      const artifact = artifacts[idx];
      if (artifact) goToScene("artifact", { artifactId: artifact.id });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!isNext && !isBack) return;

    e.preventDefault();
    e.stopPropagation();

    if (isNext) {
      if (idx < 0) {
        showCarousel();
        circleRefs.current[0]?.focus();
      } else if (idx < artifacts.length - 1) {
        circleRefs.current[idx + 1]?.focus();
      } else {
        headingRef.current?.focus();
      }
    } else {
      if (idx < 0) {
        const active = document.activeElement;
        const onTitle =
          active &&
          active.classList &&
          active.classList.contains("travel-heading-inner");
        const onThemesButton = active === themesButtonRef.current;

        if (onTitle) {
          themesButtonRef.current?.focus();
        } else if (onThemesButton) {
          // Loop within page: back from Themes returns to title.
          headingRef.current?.focus();
        } else {
          // Fallback: keep prior behavior if focus is elsewhere.
          goToScene("home");
        }
      } else if (idx === 0) {
        headingRef.current?.focus();
      } else {
        circleRefs.current[idx - 1]?.focus();
      }
    }
  }, [goToScene, showCarousel, artifacts, speechMode]);

  if (!theme) {
    return (
      <div className="travel-scene">
        <h1>Theme not found</h1>
      </div>
    );
  }

  const hasFocus = focusedIndex >= 0;

  return (
    <div className="travel-scene" onKeyDown={handleSceneKeyDown}>
      <div className="home-bg" aria-hidden="true" />

      <div className={`travel-heading ${hasFocus ? "travel-heading--hidden" : ""}`}>
        <div
          className="travel-heading-inner"
          ref={headingRef}
          tabIndex={0}
          data-autofocus={true}
          onFocus={handleHeadingFocus}
          aria-label={speechMode ? `${theme.label}. Use arrow keys to choose an artifact. ${theme.description}` : undefined}
        >
          <p
            className="travel-title"
            tabIndex={-1}
            aria-hidden={speechMode ? true : undefined}
          >
            {theme.label}
          </p>
          <p
            className="travel-description"
            tabIndex={-1}
            aria-hidden={speechMode ? true : undefined}
          >
            {theme.description}
          </p>
          <h4
            className="travel-cta"
            tabIndex={-1}
            aria-hidden={speechMode ? true : undefined}
          >
            Use arrow keys to select an artifact.
          </h4>
        </div>
      </div>

      <div ref={carouselRef} className="travel-carousel" aria-hidden="true">
        <div
          role="list"
          aria-label="Artifact selection"
          className={`artifact-circles ${hasFocus ? "artifact-circles--active" : ""}`}
          style={{ transform: `translateX(${getTrackTranslateX(focusedIndex)}px)` }}
        >
          {artifacts.map((artifact, i) => {
            const { src: thumbSrc, fallbackSrc } = getThumbnailSources(artifact);
            return (
              <div role="listitem" key={artifact.id}>
                <button
                  ref={(el) => { circleRefs.current[i] = el; }}
                  className={`artifact-circle ${focusedIndex === i ? "artifact-circle--focused" : ""}`}
                  onFocus={() => handleFocus(i)}
                  onBlur={handleBlur}
                  onClick={() => goToScene("artifact", { artifactId: artifact.id })}
                  aria-label={`${artifact.displayTitle}${artifact.year ? `, ${artifact.year}` : ""}, ${i + 1} of ${artifacts.length}`}
                  tabIndex={0}
                >
                  <span className="artifact-circle-inner" aria-hidden="true" />
                  {thumbSrc && (
                    <img
                      className={`artifact-circle-img ${artifact.id === "3A4" ? "artifact-circle-img--full-visible" : ""}`}
                      src={thumbSrc}
                      alt=""
                      aria-hidden="true"
                      onError={(e) => {
                        if (!fallbackSrc) return;
                        if (e.currentTarget.dataset.fallbackApplied === "true") return;
                        e.currentTarget.dataset.fallbackApplied = "true";
                        e.currentTarget.src = fallbackSrc;
                      }}
                    />
                  )}
                  <span className="artifact-circle-labels" aria-hidden="true">
                    <span className="artifact-label-title">{artifact.displayTitle}</span>
                    {artifact.year && (
                      <span className="artifact-label-year">{artifact.year}</span>
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {hasFocus && (
        <div className="artifact-indicators" aria-hidden="true">
          {artifacts.map((artifact, i) => (
            <span
              key={artifact.id}
              className={`artifact-indicator ${focusedIndex === i ? "active" : ""}`}
            />
          ))}
        </div>
      )}

      <div className="artifact-nav">
        <div className="artifact-nav-left">
          <button
            ref={themesButtonRef}
            className="nav-btn nav-btn-icon-white"
            onClick={() => goToScene("home")}
            aria-label="Back to themes"
            data-autofocus={speechMode ? undefined : true}
          >
            <img src="./Menu.svg" alt="" aria-hidden="true" />
            Themes
          </button>
        </div>
      </div>
    </div>
  );
}
