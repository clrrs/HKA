import React, { useEffect, useLayoutEffect, useCallback, useState, useRef } from "react";
import { flushSync } from "react-dom";
import SceneContainer from "./components/SceneContainer";
import AccessibilityMenu from "./components/AccessibilityMenu";
import AccessibilityMenuFlat from "./components/AccessibilityMenuFlat";
import { scheduleFocus, useKeyboardNav } from "./state/useSceneManager";
import { useAppState } from "./state/StateProvider";
import { useAnnounce } from "./state/AnnouncerProvider";
import { stopNvdaSpeechForMediaStart } from "./audio/nvdaSpeechControl";
import { EARCON, playEarcon } from "./audio/earcons";
import { moveSettingsFocus } from "./utils/settingsFocus";
import { preloadQuoteScreens } from "./data/quoteScreens";
import { SILENT_NAME } from "./utils/silentName";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

const DEFAULT_IDLE_SEC = 200;
const PARAGRAPH_SPEECH_IDLE_SEC = 400;
const PRE_COUNTDOWN_SEC = 10;
const COUNTDOWN_BUFFER_SEC = 3;
const COUNTDOWN_FROM = 10;
const COUNTDOWN_TICK_SEC = 2;
const TOTAL_WARNING_SEC =
  PRE_COUNTDOWN_SEC + COUNTDOWN_BUFFER_SEC + COUNTDOWN_FROM * COUNTDOWN_TICK_SEC;
const SPEECH_HUD_VISIBLE_MS = 2000;
const SPEECH_HUD_FADE_MS = 280;

const IDLE_DISMISSED_ANNOUNCEMENT = "Idle warning dismissed.";
const SETTINGS_CLOSED_ANNOUNCEMENT = "Settings closed.";

function isFocusPark(el) {
  return Boolean(el?.hasAttribute?.("data-focus-park"));
}

function isParagraphFocus() {
  return document.activeElement?.tagName === "P";
}

function getActiveSceneFocusTarget() {
  const sceneEl = document.querySelector(".scene-active");
  if (!sceneEl) return null;
  return (
    sceneEl.querySelector("[data-autofocus]") ||
    sceneEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

export default function App() {
  useKeyboardNav();

  // NVDA speaks the document title whenever focus lands on the document/body
  // or a dialog opens. This kiosk never wants that, so blank it once for the
  // whole app lifetime instead of per-scene blank/restore.
  useLayoutEffect(() => {
    document.title = "\u00a0";
  }, []);

  // Quote mockups are large; warm cache before the first theme click.
  useEffect(() => {
    preloadQuoteScreens();
  }, []);

  const {
    scene,
    showSettings,
    toggleSettings,
    settingsOnboarding,
    dismissSettings,
    resetToStart,
    videoOverlayOpen,
    autoReadActive,
    speechMode,
    idleTimeoutDisabled,
    autoReadFast,
    settingsMenuVariant,
    settingsMenuVariantActive,
    testEasterEgg,
    dismissTestEasterEgg,
  } = useAppState();
  const announce = useAnnounce();
  const [idleCountdown, setIdleCountdown] = useState(null);
  // "Settings closed." / "Idle warning dismissed." ride on the name of the
  // container focus re-enters, not a live region. NVDA speaks new ancestors
  // outermost-first in the same focus event, so the confirmation always lands
  // before the restored control's context and name (a live region could be
  // spoken between them). The role is only applied while a label is set, and
  // labels are only set/cleared while focus is outside the container, so the
  // role never changes under the focused element.
  const [mainEntryLabel, setMainEntryLabel] = useState(null);
  const [scenesEntryLabel, setScenesEntryLabel] = useState(null);
  // Silent focus target for whenever focus would otherwise fall to <body>.
  // NVDA presents the bare document as "doc" and then treats every ancestor
  // as new, so braille leads with "doc". Held off while a settings/idle
  // restore is about to place focus itself.
  const focusParkRef = useRef(null);
  const focusRestorePendingRef = useRef(false);
  const idleWasActiveRef = useRef(false);

  useEffect(() => {
    const active = idleCountdown !== null;
    if (active && !idleWasActiveRef.current) {
      playEarcon(EARCON.idleTimer);
    }
    idleWasActiveRef.current = active;
  }, [idleCountdown]);
  const lastActivityRef = useRef(Date.now());
  const warningVisibleRef = useRef(false);
  const settingsPanelRef = useRef(null);
  const settingsReturnFocusRef = useRef(null);
  const prevShowSettingsRef = useRef(false);
  const idleOverlayRef = useRef(null);
  const idleBrailleRef = useRef(null);
  const idleFocusSessionRef = useRef(false);
  const idleReturnFocusRef = useRef(null);
  const idleBufferAnnouncedRef = useRef(false);
  const speechHudSeenFirstStateRef = useRef(false);
  const speechHudFadeTimeoutRef = useRef(null);
  const speechHudHideTimeoutRef = useRef(null);
  const [speechHud, setSpeechHud] = useState({
    visible: false,
    closing: false,
    enabled: true,
  });
  const settingsVariantHudSeenFirstRef = useRef(false);
  const settingsVariantHudFadeTimeoutRef = useRef(null);
  const settingsVariantHudHideTimeoutRef = useRef(null);
  const [settingsVariantHud, setSettingsVariantHud] = useState({
    visible: false,
    closing: false,
  });
  // Hidden cursor can still leave :hover / mouseenter on whatever is underneath.
  // Block pointer hit-testing until the user actually moves or presses the mouse.
  const [pointerActive, setPointerActive] = useState(false);
  const prevSceneRef = useRef(scene);

  useEffect(() => {
    if (scene === "attract" && prevSceneRef.current !== "attract") {
      setPointerActive(false);
    }
    prevSceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    if (pointerActive) return undefined;

    const activate = () => setPointerActive(true);
    window.addEventListener("mousemove", activate, { passive: true });
    window.addEventListener("mousedown", activate, true);
    return () => {
      window.removeEventListener("mousemove", activate);
      window.removeEventListener("mousedown", activate, true);
    };
  }, [pointerActive]);

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
      const key = e.key.toLowerCase();
      // Let home / S reach useKeyboardNav so home is never blocked.
      if (key === "s" || key === "home") {
        dismissTestEasterEgg();
        return;
      }
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

    // Catch late-settling fullscreen / DPI size after mount
    const rafId = requestAnimationFrame(() => {
      rescale();
    });
    const timeoutId = window.setTimeout(rescale, 100);

    window.addEventListener("resize", rescale);

    const parent = document.getElementById("app-scaler")?.parentElement;
    let ro = null;
    if (parent && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => rescale());
      ro.observe(parent);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", rescale);
      ro?.disconnect();
    };
  }, [rescale]);

  useEffect(() => {
    // Disable inactivity timer whenever a video is playing (attract, instruction, or
    // start popup) or auto-read is reading an artifact aloud.
    if (
      scene === "attract" ||
      scene === "instruction" ||
      videoOverlayOpen ||
      autoReadActive
    ) {
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
      const wasWarning = warningVisibleRef.current;
      lastActivityRef.current = Date.now();
      setIdleCountdown(null);
      warningVisibleRef.current = false;
      if (wasWarning) {
        playEarcon(EARCON.popupClose);
        setMainEntryLabel(IDLE_DISMISSED_ANNOUNCEMENT);
      }
    };

    const handlePassiveActivity = (e) => {
      // Programmatic focus on the idle alertdialog fires focusin; that must not count as user activity.
      if (
        e.type === "focusin" &&
        (e.target?.closest?.(".idle-overlay") || isFocusPark(e.target))
      ) {
        return;
      }
      handleActivity();
    };

    // Keydown gets its own capture handler: when the idle warning is showing,
    // it swallows the event so useKeyboardNav never sees it, keeping focus in place.
    // Home / S are an exception — dismiss the warning and let home navigation run.
    const handleKeydownCapture = (e) => {
      const wasWarning = warningVisibleRef.current;
      lastActivityRef.current = Date.now();
      setIdleCountdown(null);
      warningVisibleRef.current = false;

      if (wasWarning) {
        playEarcon(EARCON.popupClose);
        setMainEntryLabel(IDLE_DISMISSED_ANNOUNCEMENT);
        const key = e.key.toLowerCase();
        if (key === "s" || key === "home") {
          return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
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
        } else if (warningElapsed < PRE_COUNTDOWN_SEC + COUNTDOWN_BUFFER_SEC) {
          setIdleCountdown("buffer");
        } else {
          const countdownElapsed =
            warningElapsed - PRE_COUNTDOWN_SEC - COUNTDOWN_BUFFER_SEC;
          setIdleCountdown(
            COUNTDOWN_FROM - Math.floor(countdownElapsed / COUNTDOWN_TICK_SEC)
          );
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
  }, [
    resetToStart,
    scene,
    videoOverlayOpen,
    autoReadActive,
    speechMode,
    announce,
    idleTimeoutDisabled,
  ]);

  const handleSettingsKeyDown = (e) => {
    if (e.repeat) return;
    if (!showSettings || e.key !== "Tab") return;

    const panel = settingsPanelRef.current;
    if (!panel) return;

    const nextEl = moveSettingsFocus(panel, e.shiftKey ? "prev" : "next");
    e.preventDefault();
    nextEl?.focus();
  };

  useLayoutEffect(() => {
    if (showSettings && !prevShowSettingsRef.current) {
      setScenesEntryLabel(null);
      const active = document.activeElement;
      if (active && active !== document.body && !isFocusPark(active)) {
        settingsReturnFocusRef.current = active;
      }
    } else if (!showSettings && prevShowSettingsRef.current) {
      // Spoken as the .app-scenes name when focus re-enters it (see
      // scenesEntryLabel), ahead of e.g. "Theme selection" and the button.
      setScenesEntryLabel(SETTINGS_CLOSED_ANNOUNCEMENT);
      const el = settingsReturnFocusRef.current;
      settingsReturnFocusRef.current = null;
      const restore = () => {
        const usable =
          el && document.contains(el) && !el.closest("[inert]") ? el : null;
        // Fall back to the scene so focus never drops to body on close.
        const target = usable || getActiveSceneFocusTarget();
        target?.focus({ preventScroll: true });
      };
      // First attempt next frame: after the label commits, before Chromium
      // reports the removed overlay's focus loss (which brailles as "doc").
      focusRestorePendingRef.current = true;
      const raf = requestAnimationFrame(restore);
      const t1 = window.setTimeout(restore, 60);
      const t2 = window.setTimeout(() => {
        restore();
        focusRestorePendingRef.current = false;
      }, 220);
      prevShowSettingsRef.current = showSettings;
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        focusRestorePendingRef.current = false;
      };
    }
    prevShowSettingsRef.current = showSettings;
  }, [showSettings]);

  useLayoutEffect(() => {
    if (!showSettings) return;
    const panel = settingsPanelRef.current;
    if (!panel) return;

    const getTarget = () =>
      panel.querySelector("[data-autofocus]") ||
      panel.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    // Reclaim focus from scene autofocus (home scheduleFocus races on
    // instruction→home+settings). Do not call .focus() if already on the
    // target or already inside the panel — that re-announces for NVDA.
    const focusIntro = () => {
      const target = getTarget();
      if (!target) return;
      const active = document.activeElement;
      if (active === target) return;
      if (active && panel.contains(active)) return;
      target.focus({ preventScroll: true });
    };

    focusIntro();
    const raf = requestAnimationFrame(focusIntro);
    const t1 = window.setTimeout(focusIntro, 50);
    const t2 = window.setTimeout(focusIntro, 150);
    const t3 = window.setTimeout(focusIntro, 300);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [showSettings, settingsOnboarding]);

  useLayoutEffect(() => {
    if (idleCountdown !== null) return;
    if (!idleFocusSessionRef.current) return;
    const restoreEl = idleReturnFocusRef.current;
    idleReturnFocusRef.current = null;
    const usable =
      restoreEl && document.contains(restoreEl) && !restoreEl.closest("[inert]");
    const target = usable ? restoreEl : getActiveSceneFocusTarget();
    // "Idle warning dismissed." is the .app-main name (mainEntryLabel), so it
    // speaks first whenever focus re-enters. Next frame lets inert clear while
    // still beating Chromium's report of the overlay's focus loss ("doc").
    let cancelFocus = () => {};
    focusRestorePendingRef.current = true;
    const raf = requestAnimationFrame(() => {
      cancelFocus = scheduleFocus(target, { stealWindow: true });
    });
    const t = window.setTimeout(() => {
      focusRestorePendingRef.current = false;
    }, 220);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      cancelFocus();
      focusRestorePendingRef.current = false;
    };
  }, [idleCountdown]);

  // Checked every frame (rAF runs before Chromium serializes accessibility
  // events for that frame), so a removed or inerted focus target is replaced
  // before NVDA ever sees focus on the document.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (focusRestorePendingRef.current || !document.hasFocus()) return;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      const park = focusParkRef.current;
      if (!park || park.closest("[inert]")) return;
      // Clear any entry label first: focus is outside both containers right
      // now, so the role can change safely, and a stale "Settings closed." /
      // "Idle warning dismissed." won't be re-spoken on the way into the park.
      flushSync(() => {
        setMainEntryLabel(null);
        setScenesEntryLabel(null);
      });
      park.focus({ preventScroll: true });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (idleCountdown === null) {
      idleFocusSessionRef.current = false;
      idleBufferAnnouncedRef.current = false;
      return;
    }
    if (idleFocusSessionRef.current) return;
    idleFocusSessionRef.current = true;
    setMainEntryLabel(null);
    setScenesEntryLabel(null);
    const active = document.activeElement;
    if (
      active &&
      active !== document.body &&
      !active.closest?.(".idle-overlay") &&
      !isFocusPark(active)
    ) {
      idleReturnFocusRef.current = active;
    }
    announce("Still there? Press any key to stay.", {
      politeness: "assertive",
      source: "idle-warning-show",
      dedupeMs: 0,
    });
    const t = window.setTimeout(() => {
      idleBrailleRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [idleCountdown, announce]);

  useEffect(() => {
    if (idleCountdown !== "buffer") return;
    if (idleBufferAnnouncedRef.current) return;
    idleBufferAnnouncedRef.current = true;
    announce("Returning to start in…", {
      politeness: "assertive",
      source: "idle-buffer",
      dedupeMs: 0,
    });
  }, [idleCountdown, announce]);

  useEffect(() => {
    if (!speechHudSeenFirstStateRef.current) {
      speechHudSeenFirstStateRef.current = true;
      return;
    }

    if (speechHudFadeTimeoutRef.current) {
      window.clearTimeout(speechHudFadeTimeoutRef.current);
      speechHudFadeTimeoutRef.current = null;
    }
    if (speechHudHideTimeoutRef.current) {
      window.clearTimeout(speechHudHideTimeoutRef.current);
      speechHudHideTimeoutRef.current = null;
    }

    setSpeechHud({
      visible: true,
      closing: false,
      enabled: speechMode,
    });

    speechHudFadeTimeoutRef.current = window.setTimeout(() => {
      setSpeechHud((prev) => ({ ...prev, closing: true }));
    }, SPEECH_HUD_VISIBLE_MS - SPEECH_HUD_FADE_MS);

    speechHudHideTimeoutRef.current = window.setTimeout(() => {
      setSpeechHud((prev) => ({ ...prev, visible: false, closing: false }));
    }, SPEECH_HUD_VISIBLE_MS);
  }, [speechMode]);

  useEffect(() => {
    if (!settingsVariantHudSeenFirstRef.current) {
      settingsVariantHudSeenFirstRef.current = true;
      return;
    }

    if (settingsVariantHudFadeTimeoutRef.current) {
      window.clearTimeout(settingsVariantHudFadeTimeoutRef.current);
      settingsVariantHudFadeTimeoutRef.current = null;
    }
    if (settingsVariantHudHideTimeoutRef.current) {
      window.clearTimeout(settingsVariantHudHideTimeoutRef.current);
      settingsVariantHudHideTimeoutRef.current = null;
    }

    setSettingsVariantHud({ visible: true, closing: false });

    settingsVariantHudFadeTimeoutRef.current = window.setTimeout(() => {
      setSettingsVariantHud((prev) => ({ ...prev, closing: true }));
    }, SPEECH_HUD_VISIBLE_MS - SPEECH_HUD_FADE_MS);

    settingsVariantHudHideTimeoutRef.current = window.setTimeout(() => {
      setSettingsVariantHud({ visible: false, closing: false });
    }, SPEECH_HUD_VISIBLE_MS);
  }, [settingsMenuVariant]);

  useEffect(() => {
    return () => {
      if (speechHudFadeTimeoutRef.current) {
        window.clearTimeout(speechHudFadeTimeoutRef.current);
      }
      if (speechHudHideTimeoutRef.current) {
        window.clearTimeout(speechHudHideTimeoutRef.current);
      }
      if (settingsVariantHudFadeTimeoutRef.current) {
        window.clearTimeout(settingsVariantHudFadeTimeoutRef.current);
      }
      if (settingsVariantHudHideTimeoutRef.current) {
        window.clearTimeout(settingsVariantHudHideTimeoutRef.current);
      }
    };
  }, []);

  const idleWarningActive = idleCountdown !== null;
  const showCountdownIntro =
    idleCountdown === "buffer" || typeof idleCountdown === "number";
  const idleBrailleText = `Still there? Press any key to stay.${
    showCountdownIntro ? " Returning to start in…" : ""
  }${typeof idleCountdown === "number" ? ` ${idleCountdown}` : ""}`;

  return (
    <div className="app">
      <div id="app-scaler" className="app-scaler">
        {/* role="application" is silent in NVDA speech and braille only when
            named, so it's applied only while an entry label is set. */}
        <div
          className="app-main"
          role={mainEntryLabel ? "application" : undefined}
          aria-label={mainEntryLabel || undefined}
          aria-hidden={idleWarningActive ? true : undefined}
          inert={idleWarningActive ? "" : undefined}
        >
          {/* Keep scenes inert under Settings so home autofocus / L-K cannot
              drive the carousel behind the overlay. */}
          <div
            className="app-scenes"
            role={scenesEntryLabel ? "application" : undefined}
            aria-label={scenesEntryLabel || undefined}
            aria-hidden={showSettings ? true : undefined}
            inert={showSettings ? "" : undefined}
          >
            <div
              ref={focusParkRef}
              className="sr-only"
              tabIndex={-1}
              role="application"
              aria-label={SILENT_NAME}
              data-focus-park=""
            />
            <SceneContainer />
          </div>
          {showSettings && (
            // No dialog/document roles: NVDA speaks and brailles every container
            // role on entry ("Settings dialog document section"). Plain divs are
            // layout to NVDA, so the focused intro's own name is the only output.
            // Modality comes from inert .app-scenes + the Tab trap below.
            <div className="settings-overlay">
              <div
                className={`settings-backdrop${
                  settingsOnboarding ? " settings-backdrop--opaque" : ""
                }`}
                onClick={settingsOnboarding ? dismissSettings : toggleSettings}
              />
              <div
                className={`settings-panel${
                  settingsMenuVariantActive === "A"
                    ? " settings-panel--flat"
                    : ""
                }`}
                ref={settingsPanelRef}
                onKeyDown={handleSettingsKeyDown}
              >
                {settingsMenuVariantActive === "A" ? (
                  <AccessibilityMenuFlat onboarding={settingsOnboarding} />
                ) : (
                  <AccessibilityMenu onboarding={settingsOnboarding} />
                )}
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
        </div>
        {idleWarningActive && (
          // No alertdialog role: NVDA would add "alert dialog" to speech and
          // braille. .app-main is inert while this shows.
          <div
            ref={idleOverlayRef}
            className="idle-overlay"
            tabIndex={-1}
          >
            <div className="idle-overlay-card idle-warning-card" aria-hidden="true">
              <div className="idle-overlay-content idle-warning-content">
                <h2 className="idle-overlay-line idle-warning-title">
                  Still there?
                </h2>
                {showCountdownIntro && (
                  <div className="idle-warning-countdown">
                    <p className="idle-overlay-line">Returning to start in…</p>
                    {/* Slot is reserved during the buffer so the card doesn't
                        jump when the numbers start. */}
                    <div
                      className={`idle-countdown${
                        typeof idleCountdown === "number"
                          ? ""
                          : " idle-countdown--pending"
                      }`}
                      aria-hidden="true"
                    >
                      {typeof idleCountdown === "number" ? idleCountdown : ""}
                    </div>
                  </div>
                )}
                <p className="idle-overlay-line idle-warning-hint">
                  Press any key to stay
                </p>
              </div>
            </div>
            <div
              className="sr-only"
              aria-live="assertive"
              aria-atomic="true"
            >
              {typeof idleCountdown === "number" ? idleCountdown : ""}
            </div>
            {/* Named + silent role so focus reads the text without "section". */}
            <div
              ref={idleBrailleRef}
              className="sr-only"
              tabIndex={-1}
              role="application"
              aria-label={idleBrailleText}
            >
              {idleBrailleText}
            </div>
          </div>
        )}
        <div className="test-shortcut-badges" aria-hidden="true">
          {idleTimeoutDisabled && (
            <div className="idle-disabled-badge">Idle timer off</div>
          )}
          {autoReadFast && (
            <div className="idle-disabled-badge">Auto-read 6x</div>
          )}
          {settingsVariantHud.visible && (
            <div
              className={`idle-disabled-badge${
                settingsVariantHud.closing ? " idle-disabled-badge--closing" : ""
              }`}
            >
              Settings {settingsMenuVariant}
            </div>
          )}
        </div>
        {speechHud.visible && (
          <div
            className={`speech-mode-hud ${speechHud.closing ? "speech-mode-hud--closing" : ""}`}
            aria-hidden="true"
          >
            <span className="speech-mode-hud-label">
              Speech {speechHud.enabled ? "On" : "Off"}
            </span>
          </div>
        )}
      </div>
      {!pointerActive && (
        <div className="pointer-shield" aria-hidden="true" />
      )}
    </div>
  );
}

