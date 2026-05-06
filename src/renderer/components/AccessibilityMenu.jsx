import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "../state/StateProvider";

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

// Steps relative to NVDA's current rate; NVDA+Ctrl+Right/Left moves one step each press
const speechRateOptions = [
  { value: "slow", label: "Slow", steps: -3 },
  { value: "normal", label: "Normal", steps: 0 },
  { value: "fast", label: "Fast", steps: 3 },
];

export default function AccessibilityMenu() {
  const { prefs, setPref, resetPrefs, toggleSettings } = useAppState();
  const [expandedSection, setExpandedSection] = useState(null);
  const textSizeFirstRef = useRef(null);
  const themeFirstRef = useRef(null);
  const brightnessFirstRef = useRef(null);
  const speechRateFirstRef = useRef(null);

  useEffect(() => {
    if (expandedSection === "textSize" && textSizeFirstRef.current) {
      textSizeFirstRef.current.focus();
    } else if (expandedSection === "theme" && themeFirstRef.current) {
      themeFirstRef.current.focus();
    } else if (expandedSection === "brightness" && brightnessFirstRef.current) {
      brightnessFirstRef.current.focus();
    } else if (expandedSection === "speechRate" && speechRateFirstRef.current) {
      speechRateFirstRef.current.focus();
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
  const currentSpeechRateLabel = speechRateOptions.find((o) => o.value === prefs.speechRate)?.label ?? "Normal";

  const handleSpeechRate = (newValue) => {
    const currentSteps = speechRateOptions.find((o) => o.value === (prefs.speechRate ?? "normal"))?.steps ?? 0;
    const newSteps = speechRateOptions.find((o) => o.value === newValue)?.steps ?? 0;
    const delta = newSteps - currentSteps;
    if (delta !== 0) {
      window.kioskApi?.send("speech-rate-change", delta);
    }
    setPref("speechRate", newValue);
  };

  return (
    <div className="accessibility-menu">
      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("textSize")}
          aria-expanded={expandedSection === "textSize"}
          aria-controls="access-text-size-options"
          id="access-text-size-trigger"
          data-autofocus
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
          <span className="setting-section-label">Theme / Contrast</span>
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

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          onClick={() => openSection("speechRate")}
          aria-expanded={expandedSection === "speechRate"}
          aria-controls="access-speech-rate-options"
          id="access-speech-rate-trigger"
        >
          <span className="setting-section-label">Speech Speed</span>
          <span className="setting-section-value" aria-hidden="true">{currentSpeechRateLabel}</span>
        </button>
        {expandedSection === "speechRate" && (
          <div
            id="access-speech-rate-options"
            className="setting-options"
            role="group"
            aria-labelledby="access-speech-rate-trigger"
            onBlur={handleOptionsBlur}
          >
            {speechRateOptions.map((option, i) => (
              <button
                key={option.value}
                ref={i === 0 ? speechRateFirstRef : null}
                className={`setting-btn ${(prefs.speechRate ?? "normal") === option.value ? "active" : ""}`}
                onClick={() => handleSpeechRate(option.value)}
                aria-pressed={(prefs.speechRate ?? "normal") === option.value}
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
          onClick={resetPrefs}
        >
          Reset All Settings
        </button>
        <button
          type="button"
          className="setting-btn"
          onClick={toggleSettings}
          aria-label="Close accessibility settings"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
