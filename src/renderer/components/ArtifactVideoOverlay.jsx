import React, { useEffect, useRef, useState } from "react";

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

export default function ArtifactVideoOverlay({ src, poster, transcript, onClose }) {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const transcriptRef = useRef(null);
  const transcriptButtonRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useFocusTrap(overlayRef, !showTranscript);
  useFocusTrap(transcriptRef, showTranscript);

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
  };

  const closeTranscript = () => {
    setShowTranscript(false);
    if (transcriptButtonRef.current) {
      transcriptButtonRef.current.focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (event.key !== "Escape") return;

      if (showTranscript) {
        event.preventDefault();
        closeTranscript();
      } else {
        event.preventDefault();
        handleCloseOverlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTranscript]);

  const transcriptText = transcript || "Transcript coming soon.";

  return (
    <div
      className="artifact-video-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Artifact video player"
    >
      <div className="artifact-video-backdrop" />
      <div className="artifact-video-modal" ref={overlayRef}>
        <button
          type="button"
          className="nav-btn icon-btn artifact-video-exit-btn"
          onClick={handleCloseOverlay}
          aria-label="Close video player"
        >
          <img src="./Exit.svg" alt="" aria-hidden="true" />
        </button>
        <div className="artifact-video-body">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            onEnded={handleEnded}
            tabIndex={0}
          />
        </div>
        <div className="artifact-video-controls" role="toolbar" aria-label="Artifact video controls">
          <button
            type="button"
            onClick={isPlaying ? pause : play}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="artifact-video-control-btn"
          >
            {isPlaying ? "Pause ⏸" : "Play ▶"}
          </button>
          <button
            type="button"
            onClick={openTranscript}
            ref={transcriptButtonRef}
            className="artifact-video-control-btn"
            aria-label="Open video transcript"
          >
            Video Transcript
          </button>
        </div>

        {showTranscript && (
          <div className="artifact-video-transcript-overlay">
            <div
              className="artifact-video-transcript-modal"
              ref={transcriptRef}
              role="dialog"
              aria-modal="true"
              aria-label="Video transcript"
            >
              <button
                type="button"
                className="nav-btn icon-btn artifact-video-transcript-close-btn"
                onClick={closeTranscript}
                aria-label="Close video transcript"
              >
                <img src="./Exit.svg" alt="" aria-hidden="true" />
              </button>
              <div className="artifact-video-transcript-body">
                <h2 className="artifact-video-transcript-heading">Video Transcript</h2>
                <p>{transcriptText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

