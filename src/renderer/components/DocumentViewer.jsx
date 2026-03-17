import React, { useEffect, useRef, useState } from "react";
import { useAppState } from "../state/StateProvider";
import { useStepScroll } from "./useStepScroll";

function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (event.key !== "Tab") return;

      const focusables = container.querySelectorAll(focusableSelector);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
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
  }, [containerRef, isActive]);
}

export default function DocumentViewer({ artifact }) {
  const { speechMode } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const surfaceRef = useRef(null);
  const overlayRef = useRef(null);
  const toolbarFirstButtonRef = useRef(null);
  const transcriptOverlayRef = useRef(null);
  const guidedOverlayRef = useRef(null);
  const {
    bodyRef: transcriptBodyRef,
    closeButtonRef: transcriptCloseRef,
    handleKeyDown: handleTranscriptKeyDown,
    resetAnchors: resetTranscriptAnchors,
  } = useStepScroll();
  const {
    bodyRef: guidedBodyRef,
    closeButtonRef: guidedCloseRef,
    handleKeyDown: handleGuidedKeyDown,
    resetAnchors: resetGuidedAnchors,
  } = useStepScroll();
  const guidedButtonRef = useRef(null);

  const [position, setPosition] = useState("top");

  useFocusTrap(overlayRef, isOpen && !showTranscript && !showGuided);
  useFocusTrap(transcriptOverlayRef, isOpen && showTranscript);
  useFocusTrap(guidedOverlayRef, isOpen && showGuided);

  const openViewer = () => {
    setIsOpen(true);
    setShowTranscript(false);
    setShowGuided(false);
    setPosition("top");
    requestAnimationFrame(() => {
      if (toolbarFirstButtonRef.current) {
        toolbarFirstButtonRef.current.focus();
      }
    });
  };

  const closeViewer = () => {
    setIsOpen(false);
    setShowTranscript(false);
    setShowGuided(false);
    if (surfaceRef.current) {
      surfaceRef.current.focus();
    }
  };

  const atTop = position === "top";
  const atBottom = position === "bottom";

  const snapToTop = () => {
    if (atTop) return;
    setPosition("top");
  };

  const snapToBottom = () => {
    if (atBottom) return;
    setPosition("bottom");
  };

  const openTranscript = () => {
    setShowGuided(false);
    setShowTranscript(true);

    requestAnimationFrame(() => {
      resetTranscriptAnchors();
    });
  };

  const openGuided = () => {
    setShowTranscript(false);
    setShowGuided(true);
    requestAnimationFrame(() => {
      resetGuidedAnchors();
    });
  };

  const closeGuided = () => {
    setShowGuided(false);
    if (guidedButtonRef.current) {
      setTimeout(() => {
        if (guidedButtonRef.current) {
          guidedButtonRef.current.focus();
        }
      }, 0);
    }
  };

  const closeTranscript = () => {
    setShowTranscript(false);
    if (toolbarFirstButtonRef.current) {
      setTimeout(() => {
        if (toolbarFirstButtonRef.current) {
          toolbarFirstButtonRef.current.focus();
        }
      }, 0);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.repeat) return;
      if (event.key !== "Escape") return;

      event.preventDefault();
      if (showTranscript) {
        closeTranscript();
      } else if (showGuided) {
        closeGuided();
      } else {
        closeViewer();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, showTranscript, showGuided]);

  const image = artifact.images && artifact.images.length > 0 ? artifact.images[0] : null;
  const transcriptTitle = artifact.transcriptTitle || "Transcript";
  const transcriptText = artifact.transcriptText || "Transcript coming soon.";
  const guidedDescription = artifact.guidedDescription || "Guided description coming soon.";

  return (
    <>
      <div
        className="document-surface"
        tabIndex={0}
        role="button"
        aria-label="Open document"
        onClick={openViewer}
        onKeyDown={(event) => {
          if (event.repeat) return;
          if (event.key === "Enter") {
            event.preventDefault();
            openViewer();
          }
        }}
        ref={surfaceRef}
      >
        <div className="document-surface-frame">
          <div className="document-surface-viewport">
            {image ? (
              <img src={image.src} alt={image.alt} />
            ) : (
              <div className="document-empty">No document available</div>
            )}
          </div>
          <div className="document-surface-prompt" aria-hidden="true">
            <span>Open Document</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="carousel-layer document-viewer-expanded"
          role="dialog"
          aria-modal="true"
          aria-label="Document viewer"
        >
          <div className="document-viewer-backdrop" />
          <div className="document-viewer-content" ref={overlayRef}>
            <button
              type="button"
              className="exit-pill-btn document-viewer-exit-btn"
              onClick={closeViewer}
              aria-label="Close document viewer"
            >
              Exit
            </button>

            <div className="document-viewer-body">
              <div className="document-panel">
                <div className="document-window">
                  {image ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={`document-image document-image--${position}`}
                    />
                  ) : (
                    <div className="document-empty">No document available</div>
                  )}
                </div>
                <div
                  className="document-toolbar-center"
                  role="toolbar"
                  aria-label="Document transcript control"
                >
                  <button
                    type="button"
                    onClick={openTranscript}
                    className="carousel-btn"
                    aria-label="Open document transcript"
                    ref={toolbarFirstButtonRef}
                  >
                    Transcript
                  </button>
                  <button
                    type="button"
                    onClick={openGuided}
                    className="carousel-btn"
                    aria-label="Open document guided description"
                    ref={guidedButtonRef}
                  >
                    Guided Description
                  </button>
                </div>
                <div
                  className="document-toolbar-arrows"
                  role="toolbar"
                  aria-label="Document scroll controls"
                >
                  <button
                    type="button"
                    onClick={snapToTop}
                    className={`carousel-btn carousel-btn-icon document-arrow-up${
                      atTop ? " document-arrow-disabled" : ""
                    }`}
                    aria-label="Scroll to top of document"
                  >
                    <img src="./Back.svg" alt="" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={snapToBottom}
                    className={`carousel-btn carousel-btn-icon document-arrow-down${
                      atBottom ? " document-arrow-disabled" : ""
                    }`}
                    aria-label="Scroll to bottom of document"
                  >
                    <img src="./Back.svg" alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {showTranscript && (
              <div className="artifact-document-transcript-overlay">
                <div
                  className="artifact-document-transcript-modal"
                  ref={transcriptOverlayRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Document transcript"
                  onKeyDown={handleTranscriptKeyDown}
                >
                  <button
                    type="button"
                    className="exit-pill-btn artifact-document-transcript-close-btn"
                    onClick={closeTranscript}
                    aria-label="Close document transcript"
                    ref={transcriptCloseRef}
                  >
                    Exit
                  </button>
                  <div className="artifact-document-transcript-body">
                    <h2 className="artifact-document-transcript-heading">{transcriptTitle}</h2>
                    <div
                      className="artifact-document-transcript-text"
                      ref={transcriptBodyRef}
                      tabIndex={0}
                    >
                      {transcriptText.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showGuided && (
              <div className="artifact-document-transcript-overlay">
                <div
                  className="artifact-document-transcript-modal"
                  ref={guidedOverlayRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Document guided description"
                  onKeyDown={handleGuidedKeyDown}
                >
                  <button
                    type="button"
                    className="exit-pill-btn artifact-document-transcript-close-btn"
                    onClick={closeGuided}
                    aria-label="Close document guided description"
                    ref={guidedCloseRef}
                  >
                    Exit
                  </button>
                  <div className="artifact-document-transcript-body">
                    <h2 className="artifact-document-transcript-heading">Guided Description</h2>
                    <div
                      className="artifact-document-transcript-text"
                      ref={guidedBodyRef}
                      tabIndex={0}
                    >
                      <p>{guidedDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

