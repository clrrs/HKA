import React, { useState, useRef, useEffect, useCallback } from "react";
import { useHeadphoneSinkEffect } from "../../audio/AudioRoutingProvider";
import { stopNvdaSpeechForMediaStart } from "../../audio/nvdaSpeechControl";
import { useAppState } from "../../state/StateProvider";

const SKIP_DELAY_SECONDS = 1;
const AUTO_CONTINUE_DELAY_MS = 10000;

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
  const advancingRef = useRef(false);

  useHeadphoneSinkEffect(videoRef, isActive);

  const clearAutoContinueTimer = () => {
    if (autoContinueTimerRef.current) {
      clearTimeout(autoContinueTimerRef.current);
      autoContinueTimerRef.current = null;
    }
  };

  const finishInstruction = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    clearAutoContinueTimer();
    goToScene("home");
    if (pendingAccessibilityOnboarding) {
      openSettingsOnboarding();
    }
  }, [goToScene, pendingAccessibilityOnboarding, openSettingsOnboarding]);

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
      advancingRef.current = false;
      stopNvdaSpeechForMediaStart();
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      setShowSkip(false);
      setVideoEnded(false);
      clearAutoContinueTimer();
      advancingRef.current = false;
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

    if (wasPlayingRef.current && !videoEnded) {
      wasPlayingRef.current = false;
      video.play().catch(() => {});
    }
  }, [isPaused, isActive, videoEnded]);

  // After the video ends, any key/click advances (Attract-style); capture so
  // global keypad handlers don't steal S/A/J/etc.
  useEffect(() => {
    if (!isActive || !videoEnded) return;

    const advance = (e) => {
      if (advancingRef.current) return;
      if (e.type === "keydown") {
        if (e.repeat) return;
        if (e.key === "Control" || e.ctrlKey) return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      finishInstruction();
    };

    window.addEventListener("keydown", advance, true);
    window.addEventListener("pointerdown", advance, true);

    return () => {
      window.removeEventListener("keydown", advance, true);
      window.removeEventListener("pointerdown", advance, true);
    };
  }, [isActive, videoEnded, finishInstruction]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && !videoEnded && video.currentTime >= SKIP_DELAY_SECONDS) {
      setShowSkip(true);
    }
  };

  // Freeze on the last frame (avoids a flash), hide Skip, and auto-continue
  // after a buffer if the visitor doesn't press anything.
  const handleEnded = () => {
    setVideoEnded(true);
    setShowSkip(false);
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
            aria-label="Skip instructions"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
