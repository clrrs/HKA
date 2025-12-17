import React from "react";
import { useAppState } from "../state/StateProvider";

export default function AccessibilityMenu() {
  const { prefs, setPref } = useAppState();

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

  return (
    <div className="accessibility-menu">
      <div className="setting-group">
        <h3 tabIndex={0}>Text Size</h3>
        <div className="setting-options">
          {textSizeOptions.map(option => (
            <button
              key={option.value}
              className={`setting-btn ${prefs.textSize === option.value ? 'active' : ''}`}
              onClick={() => setPref("textSize", option.value)}
              aria-pressed={prefs.textSize === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <h3 tabIndex={0}>Theme / Contrast</h3>
        <div className="setting-options">
          {themeOptions.map(option => (
            <button
              key={option.value}
              className={`setting-btn ${prefs.theme === option.value ? 'active' : ''}`}
              onClick={() => setPref("theme", option.value)}
              aria-pressed={prefs.theme === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <h3 tabIndex={0}>Brightness</h3>
        <div className="setting-options">
          {brightnessOptions.map(option => (
            <button
              key={option.value}
              className={`setting-btn ${prefs.brightness === option.value ? 'active' : ''}`}
              onClick={() => setPref("brightness", option.value)}
              aria-pressed={prefs.brightness === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

