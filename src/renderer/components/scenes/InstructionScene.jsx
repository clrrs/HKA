import React, { useState, useRef, useEffect } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import { stopNvdaSpeechForMediaStart } from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";

const SKIP_DELAY_SECONDS = 1;
const AUTO_CONTINUE_DELAY_MS = 3000;

export default function InstructionScene({ isActive }) {
  const { goToScene, pendingAccessibilityOnboarding, openSettingsOnboarding, isPaused } =
    useAppState();
  const [showSkip, setShowSkip] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);
  const emptyFocusRef = useRef(null);
  const skipButtonRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const autoContinueTimerRef = useRef(null);

  useHeadphoneSinkEffect(videoRef, isActive);

  const clearAutoContinueTimer = () => {
    if (autoContinueTimerRef.current) {
      clearTimeout(autoContinueTimerRef.current);
      autoContinueTimerRef.current = null;
    }
  };

  // Focus trap: L/Tab from Skip/Start goes to empty; K/Shift+Tab from empty goes to Skip/Start (loop)
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
      stopNvdaSpeechForMediaStart();
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setShowSkip(false);
      setVideoEnded(false);
      clearAutoContinueTimer();
    }
  }, [isActive]);

  useEffect(() => clearAutoContinueTimer, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    if (isPaused) {
      if (!video.paused) {
        wasPlayingRef.current = true;
        video.pause();
      }
      return;
    }

    if (wasPlayingRef.current) {
      wasPlayingRef.current = false;
      video.play().catch(() => {});
    }
  }, [isPaused, isActive]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime >= SKIP_DELAY_SECONDS) {
      setShowSkip(true);
    }
  };

  const finishInstruction = () => {
    clearAutoContinueTimer();
    goToScene("home");
    if (pendingAccessibilityOnboarding) {
      openSettingsOnboarding();
    }
  };

  // Freeze on the last frame instead of transitioning immediately (avoids a
  // flash) and let the visitor read "Start", or auto-continue after a pause.
  const handleEnded = () => {
    setVideoEnded(true);
    autoContinueTimerRef.current = setTimeout(() => {
      autoContinueTimerRef.current = null;
      finishInstruction();
    }, AUTO_CONTINUE_DELAY_MS);
  };

  const handleSkip = () => {
    finishInstruction();
  };

  return (
    <div className="instruction-scene" onKeyDown={handleKeyDown}>
      <div className="instruction-scene-wrapper">
        <video
          ref={videoRef}
          className="instruction-video"
          src="3HK7_Instructional_v05-260710_1080p.mp4"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          tabIndex={-1}
          aria-hidden="true"
        />
        <span
          ref={emptyFocusRef}
          tabIndex={0}
          data-autofocus={true}
          className="instruction-focus-anchor"
          aria-hidden="true"
        />
        {showSkip && (
          <button
            ref={skipButtonRef}
            type="button"
            className="nav-btn instruction-skip-btn"
            onClick={handleSkip}
            aria-label={videoEnded ? "Start" : "Skip instructions"}
          >
            {videoEnded ? "Start" : "Skip"}
          </button>
        )}
      </div>
    </div>
  );
}
