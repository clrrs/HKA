import React, { useEffect, useRef, useState } from "react";
import { useHeadphoneSinkEffect } from "../audio/AudioRoutingProvider";
import { useAppState } from "../state/StateProvider";
import { textOrMissing } from "../data/contentPlaceholder";
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

    const autofocusTarget = container.querySelector("[data-autofocus]");
    if (autofocusTarget) {
      autofocusTarget.focus();
    } else {
      const focusables = container.querySelectorAll(focusableSelector);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isActive]);
}

export default function ArtifactVideoOverlay({
  src,
  poster,
  transcript,
  guidedDescription,
  onClose,
  videoAlt,
}) {
  const { speechMode } = useAppState();
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const transcriptRef = useRef(null);
  const transcriptButtonRef = useRef(null);
  const guidedRef = useRef(null);
  const guidedButtonRef = useRef(null);

  useHeadphoneSinkEffect(videoRef, src);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

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

  useFocusTrap(overlayRef, !showTranscript && !showGuided);
  useFocusTrap(transcriptRef, showTranscript);
  useFocusTrap(guidedRef, showGuided);

  const play = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleCloseOverlay = () => {
    pause();
    if (onClose) {
      onClose();
    }
  };

  const openTranscript = () => {
    pause();
    setShowTranscript(true);
    setShowGuided(false);
    setTimeout(() => {
      resetTranscriptAnchors();
    }, 0);
  };

  const closeTranscript = () => {
    setShowTranscript(false);
    if (transcriptButtonRef.current) {
      setTimeout(() => {
        if (transcriptButtonRef.current) {
          transcriptButtonRef.current.focus();
        }
      }, 0);
    }
  };

  const openGuided = () => {
    pause();
    setShowTranscript(false);
    setShowGuided(true);
    setTimeout(() => {
      resetGuidedAnchors();
    }, 0);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (event.key !== "Escape") return;

      if (showTranscript) {
        event.preventDefault();
        closeTranscript();
      } else if (showGuided) {
        event.preventDefault();
        closeGuided();
      } else {
        event.preventDefault();
        handleCloseOverlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTranscript, showGuided]);

  const transcriptText = textOrMissing(transcript);
  const guidedText = textOrMissing(guidedDescription);

  return (
    <div
      className="artifact-video-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Artifact video player"
    >
      <div className="artifact-video-backdrop" />
      <div className="artifact-video-modal" ref={overlayRef}>
        <div className="artifact-video-body">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            onEnded={handleEnded}
            tabIndex={speechMode ? 0 : -1}
            aria-label={videoAlt || "Video preview"}
            onClick={(event) => {
              // Prevent direct interaction; use explicit controls instead
              event.preventDefault();
            }}
            onKeyDown={(event) => {
              // Block Enter/Space from toggling playback when focused
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
              }
            }}
          />
        </div>
        <div className="artifact-video-controls" role="toolbar" aria-label="Artifact video controls">
          <button
            type="button"
            onClick={isPlaying ? pause : play}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="artifact-video-control-btn"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={openTranscript}
            ref={transcriptButtonRef}
            className="artifact-video-control-btn"
            aria-label="Open transcript"
          >
            Transcript
          </button>
          <button
            type="button"
            onClick={openGuided}
            ref={guidedButtonRef}
            className="artifact-video-control-btn"
            aria-label="Open guided description"
          >
            Guided Description
          </button>
          <button
            type="button"
            className="artifact-video-control-btn"
            onClick={handleCloseOverlay}
            aria-label="Close video player"
          >
            Exit
          </button>
        </div>

        {showTranscript && (
          <div className="artifact-video-transcript-overlay">
            <div
              className="artifact-video-transcript-modal"
              ref={transcriptRef}
              role="dialog"
              aria-modal="true"
              aria-label="Transcript"
              onKeyDown={handleTranscriptKeyDown}
            >
              <button
                type="button"
                className="exit-pill-btn artifact-video-transcript-close-btn"
                onClick={closeTranscript}
                aria-label="Close transcript"
                ref={transcriptCloseRef}
              >
                Exit
              </button>
              <div className="artifact-video-transcript-body">
                <h2 className="artifact-video-transcript-heading">Transcript</h2>
                <div
                  className="artifact-document-transcript-text"
                  ref={transcriptBodyRef}
                  tabIndex={0}
                >
                  <p>{transcriptText}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {showGuided && (
          <div className="artifact-video-transcript-overlay">
            <div
              className="artifact-video-transcript-modal"
              ref={guidedRef}
              role="dialog"
              aria-modal="true"
              aria-label="Guided description"
              onKeyDown={handleGuidedKeyDown}
            >
              <button
                type="button"
                className="exit-pill-btn artifact-video-transcript-close-btn"
                onClick={closeGuided}
                aria-label="Close guided description"
                ref={guidedCloseRef}
              >
                Exit
              </button>
              <div className="artifact-video-transcript-body">
                <h2 className="artifact-video-transcript-heading">Guided Description</h2>
                <div
                  className="artifact-document-transcript-text"
                  ref={guidedBodyRef}
                  tabIndex={0}
                >
                  <p>{guidedText}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

