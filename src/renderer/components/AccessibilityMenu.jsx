import React, { useState, useRef, useEffect } from "react";
import { useAppState, DEFAULT_PREFS } from "../state/StateProvider";

const textSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" }
];

const themeOptions = [
  { value: "dark", label: "Dark (Default)" },
  { value: "light", label: "Light" }
];

const brightnessOptions = [
  { value: 0.5, label: "50%" },
  { value: 0.75, label: "75%" },
  { value: 1, label: "100%" },
  { value: 1.25, label: "125%" }
];

const screenReaderOptions = [
  { value: true, label: "On" },
  { value: false, label: "Off" },
];

const ONBOARDING_BLURB =
  "By default, the screen reader is on. Press Skip to continue, or use the arrow keys to customize. Press the settings key to access this menu at any time.";

const SKIP_SR_LABEL =
  "Skip. Press the Select key to stick with these settings, or press the right arrow key to toggle screen reader or adjust text size, contrast, or brightness.";

function prefsMatchDefaults(prefs) {
  return (
    prefs.textSize === DEFAULT_PREFS.textSize &&
    prefs.theme === DEFAULT_PREFS.theme &&
    prefs.brightness === DEFAULT_PREFS.brightness
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
    setSpeechModeWithTts,
    lastTtsToggleRef,
  } = useAppState();
  const [expandedSection, setExpandedSection] = useState(null);
  const introRef = useRef(null);
  const screenReaderFirstRef = useRef(null);
  const textSizeFirstRef = useRef(null);
  const themeFirstRef = useRef(null);
  const brightnessFirstRef = useRef(null);

  useEffect(() => {
    if (expandedSection === "screenReader" && screenReaderFirstRef.current) {
      screenReaderFirstRef.current.focus();
    } else if (expandedSection === "textSize" && textSizeFirstRef.current) {
      textSizeFirstRef.current.focus();
    } else if (expandedSection === "theme" && themeFirstRef.current) {
      themeFirstRef.current.focus();
    } else if (expandedSection === "brightness" && brightnessFirstRef.current) {
      brightnessFirstRef.current.focus();
    }
  }, [expandedSection]);

  const openSection = (section) => {
    setExpandedSection(section);
  };

  const handleOptionsBlur = (e) => {
    const next = e.relatedTarget;
    const optionsEl = e.currentTarget;
    if (next && !optionsEl.contains(next)) {
      setExpandedSection(null);
    }
  };

  const currentTextSizeLabel = textSizeOptions.find((o) => o.value === prefs.textSize)?.label ?? prefs.textSize;
  const currentThemeLabel = themeOptions.find((o) => o.value === prefs.theme)?.label ?? prefs.theme;
  const currentBrightnessLabel = brightnessOptions.find((o) => o.value === prefs.brightness)?.label ?? String(prefs.brightness);
  const currentScreenReaderLabel = speechMode ? "On" : "Off";

  const isAtDefaults = prefsMatchDefaults(prefs) && speechMode === true;

  const handleScreenReader = (enabled) => {
    if (enabled === speechMode) return;
    lastTtsToggleRef.current = Date.now();
    setSpeechModeWithTts(enabled);
  };

  const handleResetToDefaults = () => {
    resetPrefs();
    setExpandedSection(null);
    requestAnimationFrame(() => {
      introRef.current?.focus();
    });
  };

  return (
    <div className="accessibility-menu">
      <div
        className={`settings-intro-block${onboarding ? " settings-intro-block--onboarding" : ""}`}
      >
        <div
          ref={introRef}
          className="settings-intro"
          tabIndex={0}
          data-autofocus
          aria-label={speechMode && onboarding ? ONBOARDING_BLURB : undefined}
        >
          <h2
            id="accessibility-settings-title"
            aria-hidden={speechMode ? true : undefined}
          >
            Accessibility Settings
          </h2>
          {onboarding && (
            <p
              id="accessibility-onboarding-blurb"
              aria-hidden={speechMode ? true : undefined}
            >
              {ONBOARDING_BLURB}
            </p>
          )}
        </div>

        {onboarding && (
          <button
            type="button"
            className="setting-btn settings-onboarding-skip"
            onClick={dismissSettings}
            aria-label={SKIP_SR_LABEL}
          >
            Skip
          </button>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("screenReader")}
          aria-expanded={expandedSection === "screenReader"}
          aria-controls="access-screen-reader-options"
          id="access-screen-reader-trigger"
        >
          <span className="setting-section-label">Screen Reader</span>
          <span className="setting-section-value" aria-hidden="true">{currentScreenReaderLabel}</span>
        </button>
        {expandedSection === "screenReader" && (
          <div
            id="access-screen-reader-options"
            className="setting-options"
            role="group"
            aria-labelledby="access-screen-reader-trigger"
            onBlur={handleOptionsBlur}
          >
            {screenReaderOptions.map((option, i) => (
              <button
                key={String(option.value)}
                ref={i === 0 ? screenReaderFirstRef : null}
                className={`setting-btn ${speechMode === option.value ? "active" : ""}`}
                onClick={() => handleScreenReader(option.value)}
                aria-pressed={speechMode === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("textSize")}
          aria-expanded={expandedSection === "textSize"}
          aria-controls="access-text-size-options"
          id="access-text-size-trigger"
        >
          <span className="setting-section-label">Text Size</span>
          <span className="setting-section-value" aria-hidden="true">{currentTextSizeLabel}</span>
        </button>
        {expandedSection === "textSize" && (
          <div
            id="access-text-size-options"
            className="setting-options"
            role="group"
            aria-labelledby="access-text-size-trigger"
            onBlur={handleOptionsBlur}
          >
            {textSizeOptions.map((option, i) => (
              <button
                key={option.value}
                ref={i === 0 ? textSizeFirstRef : null}
                className={`setting-btn ${prefs.textSize === option.value ? "active" : ""}`}
                onClick={() => setPref("textSize", option.value)}
                aria-pressed={prefs.textSize === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("theme")}
          aria-expanded={expandedSection === "theme"}
          aria-controls="access-theme-options"
          id="access-theme-trigger"
        >
          <span className="setting-section-label">Contrast</span>
          <span className="setting-section-value" aria-hidden="true">{currentThemeLabel}</span>
        </button>
        {expandedSection === "theme" && (
          <div
            id="access-theme-options"
            className="setting-options"
            role="group"
            aria-labelledby="access-theme-trigger"
            onBlur={handleOptionsBlur}
          >
            {themeOptions.map((option, i) => (
              <button
                key={option.value}
                ref={i === 0 ? themeFirstRef : null}
                className={`setting-btn ${prefs.theme === option.value ? "active" : ""}`}
                onClick={() => setPref("theme", option.value)}
                aria-pressed={prefs.theme === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("brightness")}
          aria-expanded={expandedSection === "brightness"}
          aria-controls="access-brightness-options"
          id="access-brightness-trigger"
        >
          <span className="setting-section-label">Brightness</span>
          <span className="setting-section-value" aria-hidden="true">{currentBrightnessLabel}</span>
        </button>
        {expandedSection === "brightness" && (
          <div
            id="access-brightness-options"
            className="setting-options"
            role="group"
            aria-labelledby="access-brightness-trigger"
            onBlur={handleOptionsBlur}
          >
            {brightnessOptions.map((option, i) => (
              <button
                key={option.value}
                ref={i === 0 ? brightnessFirstRef : null}
                className={`setting-btn ${prefs.brightness === option.value ? "active" : ""}`}
                onClick={() => setPref("brightness", option.value)}
                aria-pressed={prefs.brightness === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button
          type="button"
          className="setting-btn settings-reset-btn"
          onClick={handleResetToDefaults}
          disabled={isAtDefaults}
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          className="setting-btn"
          onClick={onboarding ? dismissSettings : toggleSettings}
        >
          Save and Exit
        </button>
      </div>
    </div>
  );
}
