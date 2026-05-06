import React, { useEffect, useCallback, useState, useRef } from "react";
import SceneContainer from "./components/SceneContainer";
import AccessibilityMenu from "./components/AccessibilityMenu";
import { useKeyboardNav } from "./state/useSceneManager";
import { useAppState } from "./state/StateProvider";
import { useAnnounce } from "./state/AnnouncerProvider";
import { stopNvdaSpeechForMediaStart } from "./audio/nvdaSpeechControl";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

const DEFAULT_IDLE_SEC = 100;
const PARAGRAPH_SPEECH_IDLE_SEC = 300;
const PRE_COUNTDOWN_SEC = 10;
const COUNTDOWN_FROM = 10;
const COUNTDOWN_TICK_SEC = 2;
const TOTAL_WARNING_SEC = PRE_COUNTDOWN_SEC + COUNTDOWN_FROM * COUNTDOWN_TICK_SEC;

function isParagraphFocus() {
  return document.activeElement?.tagName === "P";
}

function getIdleDismissAnnouncement(el) {
  if (!el) return null;
  const label = el.getAttribute("aria-label");
  if (label) return label;
  const labelledbyId = el.getAttribute("aria-labelledby");
  if (labelledbyId) {
    const ref = document.getElementById(labelledbyId);
    if (ref) return ref.textContent?.trim();
  }
  return (el.textContent || "").trim() || null;
}

export default function App() {
  useKeyboardNav();
  const {
    scene,
    showSettings,
    toggleSettings,
    resetToStart,
    videoOverlayOpen,
    speechMode,
    idleTimeoutDisabled,
    testEasterEgg,
    dismissTestEasterEgg,
  } = useAppState();
  const announce = useAnnounce();
  const [idleCountdown, setIdleCountdown] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const warningVisibleRef = useRef(false);
  const settingsPanelRef = useRef(null);
  const idleOverlayRef = useRef(null);
  const idleFocusSessionRef = useRef(false);
  const prevIdleCountdownRef = useRef(null);

  // On every app launch (including after a crash), reset NVDA speech rate to
  // normal so a previous user's setting doesn't carry over.
  useEffect(() => {
    window.kioskApi?.send("reset-speech-rate");
  }, []);

  useEffect(() => {
    if (!testEasterEgg) return;
    const openedAt = Date.now();
    const audio = new Audio(testEasterEgg.audioSrc);
    stopNvdaSpeechForMediaStart();
    audio.play().catch(() => {});
    const timeoutId = window.setTimeout(() => {
      dismissTestEasterEgg();
    }, 5000);

    const handleEarlyDismiss = (e) => {
      if (Date.now() - openedAt < 200) return;
      e.preventDefault();
      e.stopPropagation();
      dismissTestEasterEgg();
    };

    window.addEventListener("keydown", handleEarlyDismiss, true);

    return () => {
      window.clearTimeout(timeoutId);
      audio.pause();
      window.removeEventListener("keydown", handleEarlyDismiss, true);
    };
  }, [testEasterEgg, dismissTestEasterEgg]);

  const rescale = useCallback(() => {
    const el = document.getElementById("app-scaler");
    if (!el) return;
    const scale = Math.min(
      window.innerWidth / DESIGN_W,
      window.innerHeight / DESIGN_H
    );
    el.style.transform = `scale(${scale})`;
  }, []);

  useEffect(() => {
    rescale();
    window.addEventListener("resize", rescale);
    return () => window.removeEventListener("resize", rescale);
  }, [rescale]);

  useEffect(() => {
    // Disable inactivity timer whenever a video is playing (attract, instruction, or start popup)
    if (scene === "attract" || scene === "instruction" || videoOverlayOpen) {
      setIdleCountdown(null);
      warningVisibleRef.current = false;
      lastActivityRef.current = Date.now();
      return;
    }

    // Test shortcut 0: pause idle timeout until 0 is pressed again (in-memory; resets on refresh)
    if (idleTimeoutDisabled) {
      setIdleCountdown(null);
      warningVisibleRef.current = false;
      return;
    }

    // Reset activity timestamp when entering a scene that uses the timer so countdown starts fresh after leaving video scenes
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIdleCountdown(null);
      warningVisibleRef.current = false;
    };

    const handlePassiveActivity = (e) => {
      // Programmatic focus on the idle alertdialog fires focusin; that must not count as user activity.
      if (e.type === "focusin" && e.target?.closest?.(".idle-overlay")) {
        return;
      }
      handleActivity();
    };

    // Keydown gets its own capture handler: when the idle warning is showing,
    // it swallows the event so useKeyboardNav never sees it, keeping focus in place.
    const handleKeydownCapture = (e) => {
      const wasWarning = warningVisibleRef.current;
      lastActivityRef.current = Date.now();
      setIdleCountdown(null);
      warningVisibleRef.current = false;

      if (wasWarning) {
        e.preventDefault();
        e.stopImmediatePropagation();
        requestAnimationFrame(() => {
          const text = getIdleDismissAnnouncement(document.activeElement);
          if (text) announce(text, { politeness: "assertive", source: "idle-dismiss", dedupeMs: 0 });
        });
      }
    };

    const passiveEvents = ["mousemove", "mousedown", "touchstart", "focusin"];
    passiveEvents.forEach((eventName) => {
      window.addEventListener(eventName, handlePassiveActivity, true);
    });
    window.addEventListener("keydown", handleKeydownCapture, true);

    const intervalId = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const limitSec = speechMode && isParagraphFocus() ? PARAGRAPH_SPEECH_IDLE_SEC : DEFAULT_IDLE_SEC;
      const warningStart = limitSec - TOTAL_WARNING_SEC;

      if (elapsedSeconds >= limitSec) {
        resetToStart();
        lastActivityRef.current = Date.now();
        setIdleCountdown(null);
        warningVisibleRef.current = false;
        return;
      }

      if (elapsedSeconds >= warningStart) {
        const warningElapsed = elapsedSeconds - warningStart;
        if (warningElapsed < PRE_COUNTDOWN_SEC) {
          setIdleCountdown("pre");
        } else {
          const countdownElapsed = warningElapsed - PRE_COUNTDOWN_SEC;
          setIdleCountdown(COUNTDOWN_FROM - Math.floor(countdownElapsed / COUNTDOWN_TICK_SEC));
        }
        warningVisibleRef.current = true;
      } else {
        setIdleCountdown(null);
        warningVisibleRef.current = false;
      }
    }, 1000);

    return () => {
      passiveEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handlePassiveActivity, true);
      });
      window.removeEventListener("keydown", handleKeydownCapture, true);
      clearInterval(intervalId);
    };
  }, [resetToStart, scene, videoOverlayOpen, speechMode, announce, idleTimeoutDisabled]);

  const handleSettingsKeyDown = (e) => {
    if (e.repeat) return;
    if (!showSettings || e.key !== "Tab") return;

    const panel = settingsPanelRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);

    if (!focusables.length) return;

    const currentIndex = focusables.indexOf(document.activeElement);
    let nextIndex;

    if (e.shiftKey) {
      // Move backwards
      if (currentIndex <= 0) {
        nextIndex = focusables.length - 1;
      } else {
        nextIndex = currentIndex - 1;
      }
    } else {
      // Move forwards
      if (currentIndex === -1 || currentIndex === focusables.length - 1) {
        nextIndex = 0;
      } else {
        nextIndex = currentIndex + 1;
      }
    }

    e.preventDefault();
    focusables[nextIndex].focus();
  };

  useEffect(() => {
    if (!showSettings) return;
    const panel = settingsPanelRef.current;
    if (!panel) return;

    const first = panel.querySelector("[data-autofocus]") ||
      panel.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    if (first) {
      setTimeout(() => {
        first.focus();
      }, 50);
    }
  }, [showSettings]);

  useEffect(() => {
    if (idleCountdown === null) {
      idleFocusSessionRef.current = false;
      return;
    }
    if (idleFocusSessionRef.current) return;
    idleFocusSessionRef.current = true;
    const t = window.setTimeout(() => {
      idleOverlayRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [idleCountdown]);

  useEffect(() => {
    if (idleCountdown === null) {
      prevIdleCountdownRef.current = null;
      return;
    }
    const prev = prevIdleCountdownRef.current;
    if (idleCountdown === "pre" && prev !== "pre") {
      announce(
        "Inactivity warning. Still there? A countdown will begin shortly. If you do not press a key, this experience returns to the start screen.",
        { politeness: "assertive", source: "idle-warning-open", dedupeMs: 0 }
      );
    } else if (typeof idleCountdown === "number" && prev === "pre") {
      announce(
        "The countdown has started. Unless you press a key, you will return to the start screen.",
        { politeness: "assertive", source: "idle-warning-countdown-start", dedupeMs: 0 }
      );
    }
    prevIdleCountdownRef.current = idleCountdown;
  }, [idleCountdown, announce]);

  return (
    <div className="app">
      <div id="app-scaler" className="app-scaler">
        <SceneContainer />
        {showSettings && (
          <div
            className="settings-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-settings-title"
          >
            <div className="settings-backdrop" onClick={toggleSettings} />
            <div
              className="settings-panel"
              ref={settingsPanelRef}
              role="document"
              onKeyDown={handleSettingsKeyDown}
            >
              <h2 id="accessibility-settings-title">Accessibility Settings</h2>
              <AccessibilityMenu />
            </div>
          </div>
        )}
        {testEasterEgg && (
          <div
            className="test-easter-egg-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-easter-egg-message"
            aria-live="assertive"
          >
            <div className="test-easter-egg-card">
              <img
                className="test-easter-egg-image"
                src={testEasterEgg.imageSrc}
                alt=""
              />
              <p id="test-easter-egg-message" className="test-easter-egg-message">
                {testEasterEgg.message}
              </p>
            </div>
          </div>
        )}
        {idleCountdown !== null && (
          <div
            ref={idleOverlayRef}
            className="idle-overlay"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="idle-warning-title"
            aria-describedby="idle-warning-context idle-warning-stay"
            tabIndex={-1}
          >
            <div className="idle-overlay-card">
              <div className="idle-overlay-content">
                <h2 id="idle-warning-title" className="idle-overlay-line">
                  Still there?
                </h2>
                <p id="idle-warning-context" className="sr-only">
                  You have been inactive. Unless you press a key, this experience
                  will return to the start screen.
                </p>
                {typeof idleCountdown === "number" && (
                  <>
                    <p className="idle-overlay-line">Returning to start in…</p>
                    <div className="idle-countdown" aria-hidden="true">
                      {idleCountdown}
                    </div>
                    <p
                      className="sr-only"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      Returning to start in {idleCountdown} seconds. Press any
                      key to stay on this screen.
                    </p>
                  </>
                )}
                <p id="idle-warning-stay" className="idle-overlay-line">
                  Press any key to stay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

