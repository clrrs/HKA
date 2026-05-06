import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { getElementSummary, logInputEvent } from "../state/interactionLog";
import { textOrMissing } from "../data/contentPlaceholder";
import { useStepScroll } from "./useStepScroll";

// Focus trap hook - keeps tab cycling within a container
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key !== 'Tab') return;
      
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

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus preferred autofocus target when trap activates (if any),
    // otherwise fall back to the first focusable element.
    const autofocusTarget = container.querySelector("[data-autofocus]");
    if (autofocusTarget) {
      autofocusTarget.focus();
    } else {
      const focusables = container.querySelectorAll(focusableSelector);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive, containerRef]);
}

export default function Carousel({
  images = [],
  transcriptText,
  transcriptTitle = "Transcript",
  guidedDescription,
  surfaceLabel = "Open Image Carousel",
  dialogLabel = "Image carousel, expanded view",
}) {
  const { scene, subscene, setSubscene, speechMode } = useAppState();
  const globalAnnounce = useAnnounce();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const exitingExpandedRef = useRef(false);
  const carouselRef = useRef(null);
  const surfaceRef = useRef(null);
  const expandedRef = useRef(null);
  const zoomRef = useRef(null);
  const guidedRef = useRef(null);
  const guidedButtonRef = useRef(null);
  const {
    bodyRef: guidedBodyRef,
    closeButtonRef: guidedCloseRef,
    handleKeyDown: handleGuidedKeyDown,
    resetAnchors: resetGuidedAnchors,
  } = useStepScroll();
  const transcriptRef = useRef(null);
  const transcriptButtonRef = useRef(null);
  const {
    bodyRef: transcriptBodyRef,
    closeButtonRef: transcriptCloseRef,
    handleKeyDown: handleTranscriptKeyDown,
    resetAnchors: resetTranscriptAnchors,
  } = useStepScroll();

  const [snapIndex, setSnapIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(2);
  const [snapPaneHeight, setSnapPaneHeight] = useState(0);
  const snapWindowRef = useRef(null);
  const snapImageRef = useRef(null);
  const snapUpRef = useRef(null);
  const snapDownRef = useRef(null);
  const zoomToolbarButtonRef = useRef(null);

  const currentImage = images.length > 0 ? images[currentIndex] : null;
  const hasTranscript = typeof transcriptText === "string" && transcriptText.trim().length > 0;

  useFocusTrap(expandedRef, subscene === "expanded" && !showGuided && !showTranscript);
  useFocusTrap(zoomRef, subscene === "zoom");
  useFocusTrap(guidedRef, showGuided);
  useFocusTrap(transcriptRef, showTranscript);

  const announce = useCallback((message, options = {}) => {
    globalAnnounce(message, { source: "Carousel", ...options });
  }, [globalAnnounce]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (subscene !== null || !exitingExpandedRef.current) return;
    exitingExpandedRef.current = false;
    if (surfaceRef.current) {
      surfaceRef.current.focus();
    }
    announce(`Exited ${surfaceLabel.replace(/^Open\s+/i, "").toLowerCase()}.`);
  }, [subscene, announce, surfaceLabel]);

  const nextSlide = () => {
    if (images.length === 0) return;
    const next = (currentIndexRef.current + 1) % images.length;
    currentIndexRef.current = next;
    setCurrentIndex(next);
    const nextImageAlt = images[next]?.alt || "";
    announce(`Image ${next + 1} of ${images.length}. ${nextImageAlt}`, {
      dedupeMs: 200,
    });
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    const next =
      currentIndexRef.current === 0 ? images.length - 1 : currentIndexRef.current - 1;
    currentIndexRef.current = next;
    setCurrentIndex(next);
    const prevImageAlt = images[next]?.alt || "";
    announce(`Image ${next + 1} of ${images.length}. ${prevImageAlt}`, {
      dedupeMs: 200,
    });
  };

  const enterExpanded = () => {
    setSubscene("expanded");
    setShowTranscript(false);
    announce(`${surfaceLabel.replace(/^Open\s+/i, "")} opened.`, { politeness: "assertive" });
  };

  const exitExpanded = () => {
    exitingExpandedRef.current = true;
    setShowGuided(false);
    setShowTranscript(false);
    setSubscene(null);
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setSnapIndex(0);
    setTotalSteps(2);
    setSnapPaneHeight(0);
  };

  const enterZoom = () => {
    setSnapIndex(0);
    setSubscene("zoom");
    announce("Zoom mode. Snap up or down to see the image.", { politeness: "assertive" });
  };

  const exitZoom = () => {
    setSubscene("expanded");
    setSnapIndex(0);
    announce("Exited zoom mode.");
    setTimeout(() => {
      if (zoomToolbarButtonRef.current) {
        zoomToolbarButtonRef.current.focus();
      }
    }, 0);
  };

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
    if (subscene !== "zoom" || !currentImage) return;

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
  }, [subscene, currentImage, measureSnapPane]);

  useEffect(() => {
    if (subscene !== "zoom") return;
    const el = snapWindowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureSnapPane(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [subscene, measureSnapPane]);

  const focusOppositeAfterSnap = useCallback((which) => {
    setTimeout(() => {
      if (which === "up") {
        const down = snapDownRef.current;
        if (down && !down.disabled) {
          down.focus();
        }
      } else {
        const up = snapUpRef.current;
        if (up && !up.disabled) {
          up.focus();
        }
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

  const handleKeyDown = (e) => {
    if (e.repeat) return;
    if (e.key === "Enter" && !subscene) {
      e.preventDefault();
      if (scene === "artifact") {
        logInputEvent({
          source: "Carousel",
          scene,
          subscene,
          key: "enter",
          action: "open-expanded",
          target: getElementSummary(e.currentTarget),
        });
      }
      enterExpanded();
    }
  };

  // Escape key handler (dev convenience)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        if (showGuided) {
          if (scene === "artifact") {
            logInputEvent({
              source: "Carousel",
              scene,
              subscene,
              key: "escape",
              action: "close-guided-description",
              target: getElementSummary(document.activeElement),
            });
          }
          setShowGuided(false);
          announce("Closed guided description.");
          if (guidedButtonRef.current) {
            setTimeout(() => {
              guidedButtonRef.current && guidedButtonRef.current.focus();
            }, 0);
          }
        } else if (showTranscript) {
          if (scene === "artifact") {
            logInputEvent({
              source: "Carousel",
              scene,
              subscene,
              key: "escape",
              action: "close-transcript",
              target: getElementSummary(document.activeElement),
            });
          }
          setShowTranscript(false);
          announce("Closed transcript.");
          if (transcriptButtonRef.current) {
            setTimeout(() => {
              transcriptButtonRef.current && transcriptButtonRef.current.focus();
            }, 0);
          }
        } else if (subscene === "zoom") {
          if (scene === "artifact") {
            logInputEvent({
              source: "Carousel",
              scene,
              subscene,
              key: "escape",
              action: "exit-zoom",
              target: getElementSummary(document.activeElement),
            });
          }
          exitZoom();
        } else if (subscene === "expanded") {
          if (scene === "artifact") {
            logInputEvent({
              source: "Carousel",
              scene,
              subscene,
              key: "escape",
              action: "exit-expanded",
              target: getElementSummary(document.activeElement),
            });
          }
          exitExpanded();
        }
      }
    };
    
    if (subscene || showGuided || showTranscript) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [subscene, showGuided, showTranscript, announce, scene]);

  useEffect(() => {
    if (!hasTranscript && showTranscript) {
      setShowTranscript(false);
    }
  }, [hasTranscript, showTranscript]);

  const openGuided = () => {
    if (!currentImage) return;
    setShowTranscript(false);
    setShowGuided(true);
    setTimeout(() => {
      resetGuidedAnchors();
    }, 0);
    announce(
      `Guided description opened for image ${currentIndex + 1} of ${images.length}.`,
      { politeness: "assertive" }
    );
  };

  const closeGuided = () => {
    setShowGuided(false);
    announce("Closed guided description.");
    if (guidedButtonRef.current) {
      setTimeout(() => {
        guidedButtonRef.current && guidedButtonRef.current.focus();
      }, 0);
    }
  };

  return (
    <div 
      className={`carousel ${subscene ? `carousel-${subscene}` : ''}`}
      ref={carouselRef}
      data-layer={subscene || "surface"}
    >
      {/* Layer 1: Surface View (static) */}
      {!subscene && (
        <div 
          className={`carousel-layer carousel-surface ${isHovering ? 'carousel-hovering' : ''}`}
          ref={surfaceRef}
          tabIndex={0}
          role="button"
          aria-label={`${surfaceLabel}, ${images.length} images, press Enter to open`}
          onKeyDown={handleKeyDown}
          onClick={enterExpanded}
          onFocus={() => setIsHovering(true)}
          onBlur={() => setIsHovering(false)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="carousel-viewport">
            <img 
              src={currentImage.src} 
              alt={currentImage.alt}
            />
          </div>
          {images.length > 1 && (
            <div className="carousel-indicators" aria-hidden="true">
              {images.map((_, index) => (
                <span 
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
          {isHovering && (
            <div className="carousel-prompt" aria-hidden="true">
              <span>{surfaceLabel}</span>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Expanded Navigation - Full-screen overlay with backdrop */}
      {subscene === "expanded" && (
        <div
          className="carousel-layer carousel-expanded"
          ref={expandedRef}
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
        >
          <div className="carousel-expanded-content">
            <div className="carousel-image-display">
              {currentImage ? (
                <img 
                  src={currentImage.src} 
                  alt={currentImage.alt}
                  tabIndex={speechMode ? 0 : -1}
                  data-autofocus={speechMode ? "" : undefined}
                />
              ) : (
                <div className="carousel-empty">No images available</div>
              )}
            </div>
            {images.length > 1 && currentImage && (
              <div className="carousel-indicators" aria-hidden="true">
                {images.map((_, index) => (
                  <span 
                    key={index}
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
            <div className="carousel-menu" role="toolbar" aria-label="Image navigation">
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous"
                    className="carousel-btn carousel-btn-icon"
                  >
                    <img src="./Back.svg" alt="" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next button"
                    className="carousel-btn carousel-btn-icon"
                    data-autofocus={!speechMode && images.length > 1 ? "" : undefined}
                  >
                    <img src="./Forward.svg" alt="" aria-hidden="true" />
                  </button>
                </>
              )}
              {currentImage && (
                <button
                  type="button"
                  onClick={enterZoom}
                  aria-label="Zoom"
                  className="carousel-btn carousel-btn-icon"
                  ref={zoomToolbarButtonRef}
                  data-autofocus={!speechMode && images.length <= 1 ? "" : undefined}
                >
                  <img src="./Zoom.svg" alt="" aria-hidden="true" />
                </button>
              )}
              {currentImage && (
                <button
                  type="button"
                  onClick={openGuided}
                  className="carousel-btn carousel-guided-btn"
                  aria-label="Open guided description for current image"
                  ref={guidedButtonRef}
                >
                  Guided Description
                </button>
              )}
              {currentImage && hasTranscript && (
                <button
                  type="button"
                  onClick={() => {
                    setShowTranscript(true);
                    setShowGuided(false);
                    announce("Transcript opened for current image.", { politeness: "assertive" });
                  }}
                  className="carousel-btn"
                  aria-label="Open transcript for current image"
                  ref={transcriptButtonRef}
                >
                  Transcript
                </button>
              )}
              {currentImage && (
                <button
                  type="button"
                  onClick={exitExpanded}
                  aria-label="Exit viewer"
                  className="carousel-btn carousel-exit-btn"
                >
                  Exit
                </button>
              )}
            </div>
            {showGuided && currentImage && (
              <div className="carousel-guided-overlay">
                <div
                  className="carousel-guided-modal"
                  ref={guidedRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Guided description"
                  onKeyDown={handleGuidedKeyDown}
                >
                  <button
                    type="button"
                    className="exit-pill-btn carousel-guided-close-btn"
                    onClick={closeGuided}
                    aria-label="Close guided description"
                    ref={guidedCloseRef}
                  >
                    Exit
                  </button>
                  <div className="carousel-guided-body">
                    <h2 className="carousel-guided-heading">
                      Guided Description
                    </h2>
                    <div
                      className="artifact-document-transcript-text"
                      ref={guidedBodyRef}
                      tabIndex={0}
                    >
                      <p>
                        {textOrMissing(
                          guidedDescription || currentImage.description
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showTranscript && hasTranscript && (
              <div className="carousel-guided-overlay">
                <div
                  className="carousel-guided-modal"
                  ref={transcriptRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={transcriptTitle}
                  onKeyDown={handleTranscriptKeyDown}
                >
                  <button
                    type="button"
                    className="exit-pill-btn carousel-guided-close-btn"
                    onClick={() => {
                      setShowTranscript(false);
                      announce("Closed transcript.");
                      if (transcriptButtonRef.current) {
                        setTimeout(() => {
                          transcriptButtonRef.current &&
                            transcriptButtonRef.current.focus();
                        }, 0);
                      }
                    }}
                    aria-label="Close transcript"
                    ref={transcriptCloseRef}
                  >
                    Exit
                  </button>
                  <div className="carousel-guided-body">
                    <h2 className="carousel-guided-heading">{transcriptTitle}</h2>
                    <div
                      className="artifact-document-transcript-text"
                      ref={transcriptBodyRef}
                      tabIndex={0}
                      onFocus={() => {
                        // recompute anchors when the text area gains focus
                        resetTranscriptAnchors();
                      }}
                    >
                      {transcriptText.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subscene === "zoom" && currentImage && (
        <div
          className="carousel-layer carousel-zoom"
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${dialogLabel.split(",")[0].trim()}, zoom view`}
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
              <div
                className="document-toolbar-arrows"
                role="toolbar"
                aria-label="Snap image view"
              >
                <button
                  type="button"
                  ref={snapUpRef}
                  onClick={snapStepUp}
                  className="carousel-btn carousel-btn-icon document-arrow-up"
                  disabled={atSnapTop}
                  aria-label="Snap view up one step"
                >
                  <img src="./Back.svg" alt="" aria-hidden="true" />
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
                  <img src="./Back.svg" alt="" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={exitZoom}
                className="carousel-btn"
                aria-label="Exit zoom mode"
              >
                Exit Zoom
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
