import React, { useEffect, useRef, useState } from "react";
import { useAppState, DEFAULT_PREFS } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import {
  textSizeOptions,
  themeOptions,
  brightnessOptions,
  screenReaderOptions,
  cycleOption,
} from "../data/settingsOptions";

const MENU_ITEM_COUNT = 4;

const SELECT_HINT_ID = "settings-select-hint";
const SELECT_HINT = "Press select to change.";
// Leading " , " nudges a brief pause after NVDA says "button".
const SELECT_HINT_DESCRIPTION = ` , ${SELECT_HINT}`;

const ONBOARDING_BLURB =
  "Screen reader is on by default. Press Skip to continue, or left and right to change settings. Press Settings anytime to reopen this menu.";

// Single spoken open line (dialog title + blurb) so NVDA does not stack
// dialog aria-label + intro aria-label into a double read.
const ONBOARDING_INTRO_SR_LABEL = `Settings. ${ONBOARDING_BLURB}`;

const SCREEN_READER_TIP =
  "Tip: Speech stays on in Settings. Press Settings anytime to turn the screen reader back on.";

const RESET_RESTORED_ANNOUNCEMENT = "Default settings restored.";

function prefsMatchDefaults(prefs) {
  return (
    prefs.textSize === DEFAULT_PREFS.textSize &&
    prefs.theme === DEFAULT_PREFS.theme &&
    prefs.brightness === DEFAULT_PREFS.brightness
  );
}

function menuItemLabel(name, valueLabel, index) {
  return `${name}, ${valueLabel}, ${index} of ${MENU_ITEM_COUNT}`;
}

/**
 * One settings row: Select cycles values in place.
 * aria-label is frozen while focused so NVDA does not re-read the whole
 * name when the value changes — cycle feedback is a live-region value only.
 */
function SettingToggle({ name, index, valueLabel, onCycle, id }) {
  const liveLabel = menuItemLabel(name, valueLabel, index);
  const btnRef = useRef(null);
  const liveLabelRef = useRef(liveLabel);
  liveLabelRef.current = liveLabel;
  const [spokenLabel, setSpokenLabel] = useState(liveLabel);

  // Sync accessible name to the live value only when this row is not focused.
  useEffect(() => {
    if (document.activeElement !== btnRef.current) {
      setSpokenLabel(liveLabel);
    }
  }, [liveLabel]);

  // Also sync when focus moves elsewhere (blur can be skipped if the node is
  // replaced, or in some programmatic focus paths).
  useEffect(() => {
    const onFocusIn = () => {
      if (document.activeElement !== btnRef.current) {
        setSpokenLabel(liveLabelRef.current);
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  return (
    <div className="setting-group">
      <button
        ref={btnRef}
        type="button"
        className="setting-section-trigger"
        id={id}
        data-settings-layer="menu"
        data-settings-menu-item
        onClick={onCycle}
        onFocus={() => setSpokenLabel(liveLabelRef.current)}
        onBlur={() => setSpokenLabel(liveLabelRef.current)}
        aria-label={spokenLabel}
        aria-describedby={SELECT_HINT_ID}
      >
        <span className="setting-section-label" aria-hidden="true">{name}</span>
        <span className="setting-section-value" aria-hidden="true">{valueLabel}</span>
      </button>
    </div>
  );
}

export default function AccessibilityMenu({ onboarding = false }) {
  const {
    prefs,
    setPref,
    resetPrefs,
    dismissSettings,
    toggleSettings,
    speechMode,
    setSpeechModePreference,
  } = useAppState();
  const announce = useAnnounce();
  const resetBtnRef = useRef(null);

  const currentTextSizeLabel =
    textSizeOptions.find((o) => o.value === prefs.textSize)?.label ?? prefs.textSize;
  const currentThemeLabel =
    themeOptions.find((o) => o.value === prefs.theme)?.label ?? prefs.theme;
  const currentBrightnessLabel =
    brightnessOptions.find((o) => o.value === prefs.brightness)?.label ??
    String(prefs.brightness);
  const currentScreenReaderLabel = speechMode ? "On" : "Off";

  const isAtDefaults = prefsMatchDefaults(prefs) && speechMode === true;

  const announceCycleValue = (label, tip) => {
    announce(tip ? `${label}. ${tip}` : label, {
      politeness: "assertive",
      source: "settings-cycle",
    });
  };

  const handleScreenReaderCycle = () => {
    const next = cycleOption(screenReaderOptions, speechMode);
    setSpeechModePreference(next.value);
    announceCycleValue(
      next.label,
      next.value === false ? SCREEN_READER_TIP : null
    );
  };

  const handlePrefCycle = (key, options, currentValue) => {
    const next = cycleOption(options, currentValue);
    setPref(key, next.value);
    announceCycleValue(next.label);
  };

  const handleResetToDefaults = () => {
    if (isAtDefaults) return;
    resetPrefs();
    announce(RESET_RESTORED_ANNOUNCEMENT, {
      politeness: "assertive",
      source: "settings-reset",
    });
    // Keep focus on Reset (aria-disabled, not native disabled) so Next → Close
    // and Prev → last setting. Re-assert after paint in case anything steals it.
    const el = resetBtnRef.current;
    if (el) {
      requestAnimationFrame(() => el.focus({ preventScroll: true }));
    }
  };

  return (
    <div className="accessibility-menu">
      <p id={SELECT_HINT_ID} className="sr-only">
        {SELECT_HINT_DESCRIPTION}
      </p>

      <div
        className={`settings-intro-block${onboarding ? " settings-intro-block--onboarding" : ""}`}
      >
        <div
          className="settings-intro"
          tabIndex={0}
          data-autofocus
          data-settings-layer="chrome"
          aria-label={onboarding ? ONBOARDING_INTRO_SR_LABEL : undefined}
        >
          <h2
            id="accessibility-settings-title"
            aria-hidden="true"
          >
            Settings
          </h2>
          {onboarding && (
            <p
              id="accessibility-onboarding-blurb"
              aria-hidden="true"
            >
              {ONBOARDING_BLURB}
            </p>
          )}
        </div>

        {onboarding && (
          <button
            type="button"
            className="setting-btn settings-onboarding-skip"
            data-settings-layer="chrome"
            onClick={dismissSettings}
            aria-label="Skip"
          >
            Skip
          </button>
        )}
      </div>

      <SettingToggle
        name="Screen Reader"
        index={1}
        valueLabel={currentScreenReaderLabel}
        onCycle={handleScreenReaderCycle}
        id="access-screen-reader-trigger"
      />

      <SettingToggle
        name="Text Size"
        index={2}
        valueLabel={currentTextSizeLabel}
        onCycle={() =>
          handlePrefCycle("textSize", textSizeOptions, prefs.textSize)
        }
        id="access-text-size-trigger"
      />

      <SettingToggle
        name="Contrast"
        index={3}
        valueLabel={currentThemeLabel}
        onCycle={() => handlePrefCycle("theme", themeOptions, prefs.theme)}
        id="access-theme-trigger"
      />

      <SettingToggle
        name="Brightness"
        index={4}
        valueLabel={currentBrightnessLabel}
        onCycle={() =>
          handlePrefCycle("brightness", brightnessOptions, prefs.brightness)
        }
        id="access-brightness-trigger"
      />

      <div className="settings-footer">
        <button
          ref={resetBtnRef}
          type="button"
          className="setting-btn settings-reset-btn"
          data-settings-layer="chrome"
          onClick={handleResetToDefaults}
          aria-disabled={isAtDefaults ? true : undefined}
          tabIndex={isAtDefaults ? -1 : undefined}
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          className="setting-btn"
          data-settings-layer="chrome"
          data-settings-close
          onClick={onboarding ? dismissSettings : toggleSettings}
        >
          Close
        </button>
      </div>
    </div>
  );
}
