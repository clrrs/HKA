import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { getArtifact, getNextArtifact, getPrevArtifact } from "../data/artifacts";
import { textOrMissing } from "../data/contentPlaceholder";
import ArtifactVideoOverlay from "./ArtifactVideoOverlay";

const SCROLL_STEP_RATIO = 0.75;

function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
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

    const autofocusTarget = container.querySelector("[data-autofocus]");
    if (autofocusTarget) {
      autofocusTarget.focus();
    } else {
      const focusables = container.querySelectorAll(focusableSelector);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
}

function getVideoAlt(artifact) {
  if (!artifact) return "";
  if (artifact.id === "3A1") return "Helen Keller rides a biplane, 1919";
  const base = artifact.displayTitle || artifact.title || "Video preview";
  return artifact.year ? `${base} (${artifact.year})` : base;
}

function stepScrollKeyDown(e, bodyRef, { loop = false, onLoop = null } = {}) {
  if (e.repeat) return false;
  const key = e.key.toLowerCase();
  if (key !== "l" && key !== "k") return false;

  const body = bodyRef.current;
  if (!body) return false;

  const maxScroll = body.scrollHeight - body.clientHeight;
  if (maxScroll <= 0) return false;

  const step = Math.floor(body.clientHeight * SCROLL_STEP_RATIO) || body.clientHeight;

  if (key === "l") {
    if (body.scrollTop < maxScroll - 1) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: Math.min(maxScroll, body.scrollTop + step), behavior: "smooth" });
      return true;
    }
    if (loop) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: 0, behavior: "smooth" });
      onLoop?.();
      return true;
    }
    return false;
  }
  if (key === "k" && body.scrollTop > 0) {
    e.preventDefault();
    e.stopPropagation();
    body.scrollTo({ top: Math.max(0, body.scrollTop - step), behavior: "smooth" });
    return true;
  }
  return false;
}

export default function ArtifactPopup({ theme, artifactId, onNavigate, onClose }) {
  const { speechMode, setVideoOverlayOpen } = useAppState();
  const globalAnnounce = useAnnounce();
  const announce = useCallback(
    (message, options = {}) => globalAnnounce(message, { source: "ArtifactPopup", ...options }),
    [globalAnnounce]
  );

  const artifact = getArtifact(theme.id, artifactId);
  const prevArtifact = getPrevArtifact(theme.id, artifactId);
  const nextArtifact = getNextArtifact(theme.id, artifactId);

  const isVideo = artifact?.type === "video";
  const images = !isVideo ? artifact?.images || [] : [];
  const hasMultipleImages = images.length > 1;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const popupRef = useRef(null);
  const prevArrowRef = useRef(null);
  const textRef = useRef(null);
  const nextImageRef = useRef(null);
  const transcriptBtnRef = useRef(null);
  const zoomOrPlayRef = useRef(null);
  const nextArrowRef = useRef(null);
  const zoomRef = useRef(null);
  const transcriptPanelRef = useRef(null);
  const transcriptExitRef = useRef(null);
  const transcriptBodyRef = useRef(null);

  const [snapIndex, setSnapIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(2);
  const [snapPaneHeight, setSnapPaneHeight] = useState(0);
  const snapWindowRef = useRef(null);
  const snapImageRef = useRef(null);
  const snapUpRef = useRef(null);
  const snapDownRef = useRef(null);

  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  const mainPopupActive = !zoomOpen && !videoPlayerOpen && !transcriptOpen;
  useFocusTrap(popupRef, mainPopupActive);
  useFocusTrap(zoomRef, zoomOpen);
  useFocusTrap(transcriptPanelRef, transcriptOpen);

  useEffect(() => {
    if (artifact) {
      announce(`${artifact.title} opened.`, { politeness: "assertive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToArtifact = useCallback(
    (nextId, closeOptions) => {
      if (nextId) {
        onNavigate(nextId);
      } else {
        onClose(closeOptions);
      }
    },
    [onNavigate, onClose]
  );

  const handlePrevArrow = useCallback(() => {
    if (prevArtifact) {
      goToArtifact(prevArtifact.id);
    } else {
      goToArtifact(null, { focusThemeStart: true });
    }
  }, [goToArtifact, prevArtifact]);

  const handleNextArrow = useCallback(() => {
    goToArtifact(nextArtifact?.id);
  }, [goToArtifact, nextArtifact]);

  const handleNextImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => {
      const next = (prev + 1) % images.length;
      const alt = images[next]?.alt || "";
      announce(`Image ${next + 1} of ${images.length}. ${alt}`, { dedupeMs: 200 });
      return next;
    });
  }, [images, announce]);

  const openTranscript = useCallback(() => {
    setTranscriptOpen(true);
    announce("Transcript opened.", { politeness: "assertive" });
  }, [announce]);

  const closeTranscript = useCallback(() => {
    setTranscriptOpen(false);
    announce("Transcript closed.");
    setTimeout(() => {
      transcriptBtnRef.current?.focus();
    }, 0);
  }, [announce]);

  const openZoom = useCallback(() => {
    setSnapIndex(0);
    setZoomOpen(true);
    announce("Zoom mode. Snap up or down to see the image.", { politeness: "assertive" });
  }, [announce]);

  const exitZoom = useCallback(() => {
    setZoomOpen(false);
    setSnapIndex(0);
    announce("Exited zoom mode.");
    setTimeout(() => {
      zoomOrPlayRef.current?.focus();
    }, 0);
  }, [announce]);

  const openVideoPlayer = useCallback(() => {
    setVideoPlayerOpen(true);
    setVideoOverlayOpen(true);
  }, [setVideoOverlayOpen]);

  const closeVideoPlayer = useCallback(() => {
    setVideoPlayerOpen(false);
    setVideoOverlayOpen(false);
    setTimeout(() => {
      zoomOrPlayRef.current?.focus();
    }, 0);
  }, [setVideoOverlayOpen]);

  const handlePrimaryAction = isVideo ? openVideoPlayer : openZoom;

  const handlePopupKeyDown = useCallback(
    (e) => {
      if (e.repeat) return;
      if (speechMode) return;
      if (transcriptOpen) return;

      const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
      const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
      const isSelect = e.key === "Enter" || e.key === "j";
      if (!isNext && !isBack && !isSelect) return;

      const hasTranscriptLocal =
        typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
      const focusables = [
        prevArrowRef.current,
        textRef.current,
        hasMultipleImages ? nextImageRef.current : null,
        hasTranscriptLocal ? transcriptBtnRef.current : null,
        zoomOrPlayRef.current,
        nextArrowRef.current,
      ].filter(Boolean);

      if (isSelect) {
        e.preventDefault();
        e.stopPropagation();
        const active = document.activeElement;
        if (active === prevArrowRef.current) handlePrevArrow();
        else if (active === nextArrowRef.current) handleNextArrow();
        else if (active === nextImageRef.current) handleNextImage();
        else if (active === transcriptBtnRef.current) openTranscript();
        else if (active === zoomOrPlayRef.current) handlePrimaryAction();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const idx = focusables.indexOf(document.activeElement);
      if (isNext) {
        if (idx >= 0 && idx < focusables.length - 1) {
          focusables[idx + 1].focus();
        }
      } else if (isBack) {
        if (idx > 0) {
          focusables[idx - 1].focus();
        }
      }
    },
    [
      speechMode,
      transcriptOpen,
      hasMultipleImages,
      artifact,
      handlePrevArrow,
      handleNextArrow,
      handleNextImage,
      openTranscript,
      handlePrimaryAction,
    ]
  );

  const handleTextKeyDown = useCallback((e) => {
    stepScrollKeyDown(e, textRef);
  }, []);

  const handleTranscriptKeyDown = useCallback((e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (key !== "l" && key !== "k") return;

    const body = transcriptBodyRef.current;
    const exitBtn = transcriptExitRef.current;
    if (!body || !exitBtn) return;

    const maxScroll = body.scrollHeight - body.clientHeight;
    if (maxScroll <= 0 && document.activeElement === body) {
      e.preventDefault();
      e.stopPropagation();
      exitBtn.focus();
      return;
    }

    if (key === "l" && document.activeElement === body && body.scrollTop >= maxScroll - 1) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: 0, behavior: "smooth" });
      exitBtn.focus();
      return;
    }

    stepScrollKeyDown(e, transcriptBodyRef);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.repeat || e.key !== "Escape") return;
      if (zoomOpen) {
        e.preventDefault();
        exitZoom();
      } else if (transcriptOpen) {
        e.preventDefault();
        closeTranscript();
      } else if (!videoPlayerOpen) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [zoomOpen, transcriptOpen, videoPlayerOpen, exitZoom, closeTranscript, onClose]);

  const atSnapTop = snapIndex === 0;
  const atSnapBottom = snapIndex >= totalSteps - 1;

  const measureSnapPane = useCallback((clampIndex = true) => {
    const win = snapWindowRef.current;
    const img = snapImageRef.current;
    if (!win || !img || !img.naturalWidth) return;
    const windowH = win.clientHeight;
    const renderedW = win.clientWidth * 0.95;
    const renderedH = (img.naturalHeight / img.naturalWidth) * renderedW;
    const steps = Math.max(2, Math.ceil(renderedH / windowH));
    setSnapPaneHeight(windowH);
    setTotalSteps(steps);
    if (clampIndex) {
      setSnapIndex((prev) => Math.min(prev, steps - 1));
    }
  }, []);

  useEffect(() => {
    if (!zoomOpen || !currentImage) return;

    const run = () => {
      measureSnapPane(false);
      setSnapIndex(0);
    };

    requestAnimationFrame(run);

    const img = snapImageRef.current;
    const onLoad = () => {
      measureSnapPane(false);
      setSnapIndex(0);
    };
    if (img && !img.complete) {
      img.addEventListener("load", onLoad);
      return () => img.removeEventListener("load", onLoad);
    }
  }, [zoomOpen, currentImage, measureSnapPane]);

  useEffect(() => {
    if (!zoomOpen) return;
    const el = snapWindowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureSnapPane(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoomOpen, measureSnapPane]);

  const focusOppositeAfterSnap = useCallback((which) => {
    setTimeout(() => {
      if (which === "up") {
        if (snapDownRef.current && !snapDownRef.current.disabled) {
          snapDownRef.current.focus();
        }
      } else if (snapUpRef.current && !snapUpRef.current.disabled) {
        snapUpRef.current.focus();
      }
    }, 0);
  }, []);

  const snapStepUp = () => {
    if (atSnapTop) return;
    const nextIndex = Math.max(0, snapIndex - 1);
    setSnapIndex(nextIndex);
    if (nextIndex === 0) {
      announce("Top of image.", { politeness: "assertive" });
      focusOppositeAfterSnap("up");
    } else {
      announce(`Step ${nextIndex + 1} of ${totalSteps}.`, { politeness: "assertive" });
    }
  };

  const snapStepDown = () => {
    if (atSnapBottom) return;
    const nextIndex = Math.min(totalSteps - 1, snapIndex + 1);
    setSnapIndex(nextIndex);
    if (nextIndex === totalSteps - 1) {
      announce("Bottom of image.", { politeness: "assertive" });
      focusOppositeAfterSnap("down");
    } else {
      announce(`Step ${nextIndex + 1} of ${totalSteps}.`, { politeness: "assertive" });
    }
  };

  const snapImageStyle = (() => {
    if (snapIndex === 0) {
      return { top: 0, bottom: "auto", left: "50%", transform: "translateX(-50%)" };
    }
    if (snapIndex === totalSteps - 1) {
      return { bottom: 0, top: "auto", left: "50%", transform: "translateX(-50%)" };
    }
    return {
      top: `${-snapIndex * snapPaneHeight}px`,
      bottom: "auto",
      left: "50%",
      transform: "translateX(-50%)",
    };
  })();

  if (!artifact) return null;

  const hasTranscript =
    typeof artifact.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
  const transcriptText = hasTranscript ? textOrMissing(artifact.transcriptText) : null;
  const speechLabel = `${artifact.title}. ${artifact.description}`;
  const videoAlt = isVideo ? getVideoAlt(artifact) : "";

  return (
    <div className="artifact-popup-scrim">
      <div
        className="artifact-popup"
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${artifact.title}, artifact details`}
        onKeyDown={handlePopupKeyDown}
      >
        <button
          type="button"
          ref={prevArrowRef}
          className="artifact-popup-nav-arrow artifact-popup-nav-arrow--prev"
          onClick={handlePrevArrow}
          aria-label={
            prevArtifact
              ? `Previous artifact: ${prevArtifact.displayTitle}`
              : "Close artifact, return to theme"
          }
        />

        <div className="artifact-popup-card">
          <div className="artifact-popup-media">
            {isVideo ? (
              artifact.posterSrc && (
                <img src={artifact.posterSrc} alt="" aria-hidden="true" />
              )
            ) : currentImage ? (
              <img src={currentImage.src} alt="" aria-hidden="true" />
            ) : (
              <div className="artifact-popup-media-empty">No image available</div>
            )}
          </div>

          {hasMultipleImages && (
            <div className="artifact-popup-image-dots" aria-hidden="true">
              {images.map((_, i) => (
                <span key={i} className={`indicator ${i === currentImageIndex ? "active" : ""}`} />
              ))}
            </div>
          )}

          <div className="artifact-popup-controls" role="toolbar" aria-label="Artifact controls">
            {hasMultipleImages && (
              <button
                type="button"
                ref={nextImageRef}
                className="carousel-btn"
                onClick={handleNextImage}
                aria-label="Next image"
                data-autofocus={!speechMode ? true : undefined}
              >
                Next Image
              </button>
            )}
            {hasTranscript && (
              <button
                type="button"
                ref={transcriptBtnRef}
                className="carousel-btn"
                onClick={openTranscript}
                aria-label="Transcript"
                data-autofocus={!speechMode && !hasMultipleImages ? true : undefined}
              >
                Transcript
              </button>
            )}
            <button
              type="button"
              ref={zoomOrPlayRef}
              className={
                isVideo ? "carousel-btn" : "carousel-btn artifact-popup-zoom-btn"
              }
              onClick={handlePrimaryAction}
              aria-label={isVideo ? "Play video" : "Zoom"}
              data-autofocus={
                !speechMode && !hasMultipleImages && !hasTranscript ? true : undefined
              }
            >
              {isVideo ? "Play" : <img src="Zoom.svg" alt="" aria-hidden="true" />}
            </button>
          </div>

          <div
            className="artifact-popup-text"
            ref={textRef}
            tabIndex={0}
            onKeyDown={handleTextKeyDown}
            data-autofocus={speechMode ? true : undefined}
            aria-label={speechMode ? speechLabel : undefined}
          >
            <h2 className="artifact-popup-title" aria-hidden={speechMode ? true : undefined}>
              {artifact.title}
            </h2>
            <p className="artifact-popup-description" aria-hidden={speechMode ? true : undefined}>
              {artifact.description}
            </p>
          </div>

          {transcriptOpen && transcriptText && (
            <div
              className="artifact-popup-transcript"
              ref={transcriptPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Transcript"
            >
              <button
                type="button"
                ref={transcriptExitRef}
                className="exit-pill-btn artifact-popup-transcript-exit"
                onClick={closeTranscript}
                aria-label="Close transcript"
              >
                Exit
              </button>
              <h2 className="artifact-popup-transcript-heading">Transcript</h2>
              <div
                className="artifact-popup-transcript-body"
                ref={transcriptBodyRef}
                tabIndex={0}
                onKeyDown={handleTranscriptKeyDown}
                data-autofocus=""
              >
                {transcriptText.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          ref={nextArrowRef}
          className="artifact-popup-nav-arrow artifact-popup-nav-arrow--next"
          onClick={handleNextArrow}
          aria-label={
            nextArtifact
              ? `Next artifact: ${nextArtifact.displayTitle}`
              : "Close artifact, return to theme"
          }
        />
      </div>

      {zoomOpen && !isVideo && currentImage && (
        <div
          className="carousel-zoom"
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom view"
        >
          <div className="snap-zoom-panel">
            <div className="snap-zoom-window" ref={snapWindowRef}>
              <img
                ref={snapImageRef}
                src={currentImage.src}
                alt={currentImage.alt}
                className="snap-zoom-image"
                style={snapImageStyle}
                tabIndex={-1}
              />
            </div>
            <div className="snap-zoom-controls" role="toolbar" aria-label="Zoom scroll controls">
              <div className="document-toolbar-arrows" role="toolbar" aria-label="Snap image view">
                <button
                  type="button"
                  ref={snapUpRef}
                  onClick={snapStepUp}
                  className="carousel-btn carousel-btn-icon document-arrow-up"
                  disabled={atSnapTop}
                  aria-label="Snap view up one step"
                >
                  <img src="Back.svg" alt="" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  ref={snapDownRef}
                  onClick={snapStepDown}
                  className="carousel-btn carousel-btn-icon document-arrow-down"
                  disabled={atSnapBottom}
                  aria-label="Snap view down one step"
                  data-autofocus=""
                >
                  <img src="Back.svg" alt="" aria-hidden="true" />
                </button>
              </div>
              <button type="button" onClick={exitZoom} className="carousel-btn" aria-label="Exit zoom mode">
                Exit Zoom
              </button>
            </div>
          </div>
        </div>
      )}

      {videoPlayerOpen && isVideo && (
        <ArtifactVideoOverlay
          src={artifact.videoSrc}
          poster={artifact.posterSrc}
          transcript={artifact.transcriptText}
          guidedDescription={artifact.guidedDescription}
          videoAlt={videoAlt}
          onClose={closeVideoPlayer}
        />
      )}
    </div>
  );
}
