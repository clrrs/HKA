import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { getElementSummary, logInputEvent } from "../state/interactionLog";
import ZoomControls from "./ZoomControls";
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

export default function Carousel({ images = [], transcriptText, guidedDescription }) {
  const { scene, subscene, setSubscene } = useAppState();
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
    announce("Exited image carousel.");
  }, [subscene, announce]);

  const nextSlide = () => {
    if (images.length === 0) return;
    const next = (currentIndexRef.current + 1) % images.length;
    currentIndexRef.current = next;
    setCurrentIndex(next);
    announce(`Image ${next + 1} of ${images.length}`, { dedupeMs: 200 });
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    const next =
      currentIndexRef.current === 0 ? images.length - 1 : currentIndexRef.current - 1;
    currentIndexRef.current = next;
    setCurrentIndex(next);
    announce(`Image ${next + 1} of ${images.length}`, { dedupeMs: 200 });
  };

  const enterExpanded = () => {
    setSubscene("expanded");
    setShowTranscript(false);
    announce(
      `Expanded view. Image ${currentIndexRef.current + 1} of ${images.length}. ${
        images[currentIndexRef.current]?.alt || ""
      }`,
      { politeness: "assertive" }
    );
    // Ensure focus moves into the expanded carousel so keypad L/K navigation works
    setTimeout(() => {
      if (!expandedRef.current) return;
      const focusables = expandedRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 0);
  };

  const exitExpanded = () => {
    exitingExpandedRef.current = true;
    setShowGuided(false);
    setShowTranscript(false);
    setSubscene(null);
    currentIndexRef.current = 0;
    setCurrentIndex(0);
  };

  const enterZoom = () => {
    setSubscene("zoom");
    announce("Zoom mode. Use controls to zoom and pan.", { politeness: "assertive" });
  };

  const exitZoom = () => {
    setSubscene("expanded");
    announce("Exited zoom mode.");
  };

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
    
    if (subscene || showGuided) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [subscene, showGuided, showTranscript, announce, exitZoom]);

  const currentImage = images.length > 0 ? images[currentIndex] : null;
  const hasTranscript = Boolean(transcriptText);

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
          aria-label={`Image carousel, ${images.length} images, press Enter to open`}
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
              <span>Open Image Carousel</span>
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
          aria-label="Image carousel, expanded view"
        >
          <div className="carousel-expanded-content">
            {currentImage && (
              <button 
                type="button" 
                onClick={exitExpanded}
                aria-label="Exit image carousel"
                className="exit-pill-btn carousel-exit-btn"
              >
                Exit
              </button>
            )}
            <div className="carousel-image-display">
              {currentImage ? (
                <img 
                  src={currentImage.src} 
                  alt={currentImage.alt}
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
                    aria-label={`Image ${currentIndex + 1} of ${images.length}. ${currentImage.alt}. Next`}
                    className="carousel-btn carousel-btn-icon"
                  >
                    <img src="./Forward.svg" alt="" aria-hidden="true" />
                  </button>
                </>
              )}
              <button 
                type="button" 
                onClick={enterZoom}
                aria-label="Zoom"
                className="carousel-btn carousel-btn-icon"
              >
                <img src="./Zoom.svg" alt="" aria-hidden="true" />
              </button>
              {hasTranscript && (
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
                  onClick={openGuided}
                  className="carousel-btn carousel-guided-btn"
                  aria-label="Open guided description for current image"
                  ref={guidedButtonRef}
                >
                  Guided Description
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
                        {currentImage.description || currentImage.alt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showTranscript && (
              <div className="carousel-guided-overlay">
                <div
                  className="carousel-guided-modal"
                  ref={transcriptRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Image transcript"
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
                    <h2 className="carousel-guided-heading">Transcript</h2>
                    <div
                      className="artifact-document-transcript-text"
                      ref={transcriptBodyRef}
                      tabIndex={0}
                      onFocus={() => {
                        // recompute anchors when the text area gains focus
                        resetTranscriptAnchors();
                      }}
                    >
                      <p>{transcriptText || "Transcript coming soon."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layer 3: Zoom Mode */}
      {subscene === "zoom" && (
        <div className="carousel-layer carousel-zoom" ref={zoomRef}>
          <ZoomControls 
            image={currentImage}
            onExit={exitZoom}
          />
        </div>
      )}

    </div>
  );
}
