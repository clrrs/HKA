import React, { useState, useRef, useEffect } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import { useAppState } from "../../state/StateProvider";

const SKIP_DELAY_SECONDS = 1;

export default function InstructionScene({ isActive }) {
  const { goToScene } = useAppState();
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef(null);
  const emptyFocusRef = useRef(null);
  const skipButtonRef = useRef(null);

  useHeadphoneSinkEffect(videoRef, isActive);

  // Focus trap: L/Tab from Skip goes to empty; K/Shift+Tab from empty goes to Skip (loop)
  const handleKeyDown = (e) => {
    if (!showSkip || e.repeat) return;
    const key = e.key.toLowerCase();
    const isNext = key === "l" || (key === "tab" && !e.shiftKey);
    const isBack = key === "k" || (key === "tab" && e.shiftKey);
    if (isNext && document.activeElement === skipButtonRef.current) {
      e.preventDefault();
      e.stopPropagation();
      emptyFocusRef.current?.focus();
    } else if (isBack && document.activeElement === emptyFocusRef.current) {
      e.preventDefault();
      e.stopPropagation();
      skipButtonRef.current?.focus();
    }
  };

  // Start playback only when scene is active; pause when leaving so audio stops
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setShowSkip(false);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime >= SKIP_DELAY_SECONDS) {
      setShowSkip(true);
    }
  };

  const handleEnded = () => {
    goToScene("home");
  };

  const handleSkip = () => {
    goToScene("home");
  };

  return (
    <div className="instruction-scene" onKeyDown={handleKeyDown}>
      <div className="instruction-scene-wrapper">
        <video
          ref={videoRef}
          className="instruction-video"
          src="3HK7_Instructional-VO_v03-260312_SMALL.mp4"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          tabIndex={-1}
          aria-hidden="true"
        />
        {showSkip && (
          <>
            <button
              ref={skipButtonRef}
              type="button"
              className="nav-btn instruction-skip-btn"
              onClick={handleSkip}
              aria-label="Skip instructions"
            >
              Skip
            </button>
            <span
              ref={emptyFocusRef}
              tabIndex={0}
              className="instruction-focus-anchor"
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </div>
  );
}
