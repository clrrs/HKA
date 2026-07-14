import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useAppState } from "../../state/StateProvider";
import { useAnnounce } from "../../state/AnnouncerProvider";
import { getTheme, getArtifactIndex } from "../../data/artifacts";
import ArtifactPopup from "../ArtifactPopup";

const ITEM_WIDTH = 600;
const GAP = 77;
const ITEM_STEP = ITEM_WIDTH + GAP;
const SCREEN_CENTER = 960;
const IDLE_OFFSET = 1000;
export const POPUP_SLOT_WIDTH = 1200;
const POPUP_GAP = 0; // matches .theme-scene--popup-open .artifact-circles { gap: 0 }

function getTrackTranslateX(focusedIndex, popupOpen = false) {
  if (focusedIndex < 0) return IDLE_OFFSET;
  if (!popupOpen) {
    return SCREEN_CENTER - (focusedIndex * ITEM_STEP + ITEM_WIDTH / 2);
  }
  const offsetBefore = focusedIndex * (ITEM_WIDTH + POPUP_GAP);
  return SCREEN_CENTER - (offsetBefore + POPUP_SLOT_WIDTH / 2);
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

function getThemeTipMessage(themeLabel) {
  return `Tip: You are on the ${themeLabel} theme page. Use the arrow keys to navigate between artifacts, and press the select key to learn more. Press the home button to choose a different theme.`;
}

const TIP_PASS_THROUGH_KEYS = new Set(["s", "home", "a"]);
const TIP_AUTO_DISMISS_MS = 20000;

export default function ThemeScene() {
  const {
    scene,
    currentTheme,
    speechMode,
    hasSeenThemeTip,
    markThemeTipSeen,
    artifactId,
    openArtifact,
    closeArtifact,
    showSettings,
  } = useAppState();
  const announce = useAnnounce();
  const theme = getTheme(currentTheme);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  // tipGate.show is decided during render on theme entry so the tip can take
  // data-autofocus before useSceneFocus lands on the heading.
  const [tipGate, setTipGate] = useState({ entryKey: null, show: false });
  const [carouselTransitionEnabled, setCarouselTransitionEnabled] = useState(true);
  const circleRefs = useRef([]);
  const headingRef = useRef(null);
  const tipRef = useRef(null);
  const carouselRef = useRef(null);
  const focusedIndexRef = useRef(focusedIndex);
  const showTipRef = useRef(false);
  const prevShowSettingsRef = useRef(showSettings);
  focusedIndexRef.current = focusedIndex;

  const entryKey = scene === "theme" && currentTheme ? currentTheme : null;
  if (entryKey !== tipGate.entryKey) {
    setTipGate({
      entryKey,
      show: Boolean(entryKey) && !hasSeenThemeTip,
    });
  }
  const showTip = tipGate.show;
  showTipRef.current = showTip;

  const artifacts = theme?.artifacts || [];
  const popupOpen = Boolean(artifactId);

  const dismissTip = useCallback(() => {
    setTipGate((prev) => (prev.show ? { ...prev, show: false } : prev));
  }, []);

  const restoreThemeEntryFocus = useCallback(() => {
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useLayoutEffect(() => {
    const wasOpen = prevShowSettingsRef.current;
    prevShowSettingsRef.current = showSettings;
    if (!wasOpen || showSettings || popupOpen) return;
    const idx = focusedIndexRef.current;
    if (idx < 0) return;
    const el = circleRefs.current[idx];
    el?.focus({ preventScroll: true });
  }, [showSettings, popupOpen]);

  useEffect(() => {
    setCarouselTransitionEnabled(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCarouselTransitionEnabled(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [popupOpen]);

  useEffect(() => {
    if (!showTip) return;
    markThemeTipSeen();
  }, [showTip, markThemeTipSeen]);

  useLayoutEffect(() => {
    if (!showTip) return;
    tipRef.current?.focus({ preventScroll: true });
  }, [showTip]);

  useEffect(() => {
    if (!showTip || !theme) return;

    announce(getThemeTipMessage(theme.label), {
      politeness: "assertive",
      source: "theme-tip-show",
      dedupeMs: 0,
    });

    const handleKeyDownCapture = (e) => {
      if (!showTipRef.current || e.repeat) return;

      const key = e.key.toLowerCase();
      dismissTip();

      if (TIP_PASS_THROUGH_KEYS.has(key)) {
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();
      restoreThemeEntryFocus();
    };

    const handlePointerDownCapture = (e) => {
      if (!showTipRef.current) return;

      dismissTip();
      e.preventDefault();
      e.stopImmediatePropagation();
      restoreThemeEntryFocus();
    };

    window.addEventListener("keydown", handleKeyDownCapture, true);
    window.addEventListener("pointerdown", handlePointerDownCapture, true);

    const dismissTimer = setTimeout(() => {
      if (showTipRef.current) {
        dismissTip();
        restoreThemeEntryFocus();
      }
    }, TIP_AUTO_DISMISS_MS);

    return () => {
      clearTimeout(dismissTimer);
      window.removeEventListener("keydown", handleKeyDownCapture, true);
      window.removeEventListener("pointerdown", handlePointerDownCapture, true);
    };
  }, [showTip, theme, announce, dismissTip, restoreThemeEntryFocus]);

  const showCarousel = useCallback(() => {
    carouselRef.current?.removeAttribute("aria-hidden");
  }, []);

  const hideCarousel = useCallback(() => {
    carouselRef.current?.setAttribute("aria-hidden", "true");
  }, []);

  // While the artifact popup is open, keep the background bubble carousel's
  // visual focus in sync with whichever artifact the popup is showing (it
  // changes as the user navigates prev/next inside the popup).
  useEffect(() => {
    if (!artifactId || !theme) return;
    const idx = getArtifactIndex(theme.id, artifactId);
    if (idx < 0) return;
    showCarousel();
    setFocusedIndex(idx);
  }, [artifactId, theme, showCarousel]);

  const handleClosePopup = useCallback((options = {}) => {
    const idx = focusedIndexRef.current;
    closeArtifact();
    setTimeout(() => {
      if (options.focusThemeStart) {
        setFocusedIndex(-1);
        hideCarousel();
        headingRef.current?.focus({ preventScroll: true });
      } else {
        circleRefs.current[idx]?.focus();
      }
    }, 0);
  }, [closeArtifact, hideCarousel]);

  const handleFocus = useCallback((index) => {
    setFocusedIndex(index);
  }, []);

  const handleHeadingFocus = useCallback(() => {
    setFocusedIndex(-1);
    hideCarousel();
  }, [hideCarousel]);

  const handleBlur = useCallback((e) => {
    if (showSettings || document.querySelector(".settings-overlay")) return;
    const scene = e.currentTarget.closest(".theme-scene");
    requestAnimationFrame(() => {
      if (document.querySelector(".settings-overlay")) return;
      if (scene && !scene.contains(document.activeElement)) {
        setFocusedIndex(-1);
        hideCarousel();
      }
    });
  }, [hideCarousel, showSettings]);

  const handleSceneKeyDown = useCallback((e) => {
    if (showTipRef.current) return;
    if (popupOpen) return;
    if (e.repeat) return;
    const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
    const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
    const isSelect = e.key === "Enter" || e.key === "j";

    const idx = focusedIndexRef.current;

    // In screen reader / speech mode, let the global keypad handler manage focus order.
    if (speechMode) {
      return;
    }

    if (isSelect && idx >= 0) {
      const artifact = artifacts[idx];
      if (artifact) openArtifact(artifact.id);
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
        return;
      } else if (idx === 0) {
        headingRef.current?.focus();
      } else {
        circleRefs.current[idx - 1]?.focus();
      }
    }
  }, [openArtifact, showCarousel, artifacts, speechMode, popupOpen]);

  if (!theme) {
    return (
      <div className="theme-scene">
        <h1>Theme not found</h1>
      </div>
    );
  }

  const hasFocus = focusedIndex >= 0;

  return (
    <div
      className={`theme-scene${popupOpen ? " theme-scene--popup-open" : ""}`}
      onKeyDown={handleSceneKeyDown}
    >
      <div className="home-bg" aria-hidden="true" />

      <div
        className="theme-scene-main"
        aria-hidden={showTip ? true : undefined}
        inert={showTip ? "" : undefined}
      >
        <div className={`theme-heading ${hasFocus ? "theme-heading--hidden" : ""}`}>
          <div
            className="theme-heading-inner"
            ref={headingRef}
            tabIndex={0}
            data-autofocus={!showTip ? true : undefined}
            onFocus={handleHeadingFocus}
            aria-label={speechMode ? `${theme.label}. Use arrow keys to choose an artifact. ${theme.description}` : undefined}
          >
            <p
              className="theme-title"
              tabIndex={-1}
              aria-hidden={speechMode ? true : undefined}
            >
              {theme.label}
            </p>
            <p
              className="theme-description"
              tabIndex={-1}
              aria-hidden={speechMode ? true : undefined}
            >
              {theme.description}
            </p>
            <h4
              className="theme-cta"
              tabIndex={-1}
              aria-hidden={speechMode ? true : undefined}
            >
              Use arrow keys to select an artifact.
            </h4>
          </div>
        </div>

        <div ref={carouselRef} className="theme-carousel" aria-hidden="true">
          <div
            role="list"
            aria-label="Artifact selection"
            className={`artifact-circles ${hasFocus || popupOpen ? "artifact-circles--active" : ""}`}
            style={{
              transform: `translateX(${getTrackTranslateX(focusedIndex, popupOpen)}px)`,
              transition: carouselTransitionEnabled ? undefined : "none",
            }}
          >
            {artifacts.map((artifact, i) => {
              if (popupOpen && i === focusedIndex) {
                return (
                  <div role="listitem" key={artifact.id}>
                    <div className="artifact-popup-slot" aria-hidden="true" />
                  </div>
                );
              }

              const { src: thumbSrc, fallbackSrc } = getThumbnailSources(artifact);
              return (
                <div role="listitem" key={artifact.id}>
                  <button
                    ref={(el) => { circleRefs.current[i] = el; }}
                    className={`artifact-circle ${!popupOpen && focusedIndex === i ? "artifact-circle--focused" : ""}`}
                    onFocus={() => handleFocus(i)}
                    onBlur={handleBlur}
                    onClick={() => openArtifact(artifact.id)}
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

        {hasFocus && !popupOpen && (
          <div className="artifact-indicators" aria-hidden="true">
            {artifacts.map((artifact, i) => (
              <span
                key={artifact.id}
                className={`artifact-indicator ${focusedIndex === i ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {showTip && (
        <div
          ref={tipRef}
          className="idle-overlay theme-tip-overlay"
          role="alertdialog"
          aria-modal="true"
          tabIndex={-1}
          data-autofocus
        >
          <div className="idle-overlay-card">
            <div className="idle-overlay-content">
              <p id="theme-tip-message" className="idle-overlay-line">
                {getThemeTipMessage(theme.label)}
              </p>
            </div>
          </div>
        </div>
      )}

      {popupOpen && (
        <ArtifactPopup
          key={artifactId}
          theme={theme}
          artifactId={artifactId}
          onNavigate={openArtifact}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
