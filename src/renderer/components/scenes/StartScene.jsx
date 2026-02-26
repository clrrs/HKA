import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "../../state/StateProvider";

export default function StartScene() {
  const { goToScene } = useAppState();
  const [showVideo, setShowVideo] = useState(false);
  const helpButtonRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);

  // Focus trap for the instructional video modal
  useEffect(() => {
    if (!showVideo || !modalRef.current) return;

    const container = modalRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e) => {
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
  };

  const closeVideo = () => {
    setShowVideo(false);
    // Restore focus to the help button
    if (helpButtonRef.current) {
      helpButtonRef.current.focus();
    }
  };

  const handleVideoEnded = () => {
    closeVideo();
  };

  const handleStartKeyDown = (e) => {
    if (showVideo) return;

    const key = e.key;
    const isNext =
      (key === "Tab" && !e.shiftKey) || key.toLowerCase() === "l";

    if (!isNext) return;

    const active = document.activeElement;
    if (active && active.classList && active.classList.contains("start-bubble")) {
      e.preventDefault();
      e.stopPropagation();
      goToScene("home");
    }
  };

  return (
    <div className="start-scene" onKeyDown={handleStartKeyDown}>
      <div className="start-bg" aria-hidden="true" />

      <div className="start-content" inert={showVideo ? "" : undefined}>
        <button
          ref={helpButtonRef}
          type="button"
          className="nav-btn icon-btn start-help-btn"
          aria-label="Watch instructional video"
          onClick={openVideo}
        >
          <img src="./Question.svg" alt="" aria-hidden="true" />
        </button>
        <div className="start-center">
          <button
            type="button"
            className="start-bubble"
            onClick={() => goToScene("home")}
          >
            The Helen Keller Archives
          </button>
        </div>
      </div>

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
              className="nav-btn icon-btn start-video-exit-btn"
              onClick={closeVideo}
              aria-label="Close instructional video"
            >
              <img src="./Exit.svg" alt="" aria-hidden="true" />
            </button>
            <div className="start-video-body">
              <video
                ref={videoRef}
                src="/InstructionalVideo.mov"
                onEnded={handleVideoEnded}
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
