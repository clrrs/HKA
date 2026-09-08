import React, { useState, useRef, useEffect } from "react";
import { useAppState, DEFAULT_PREFS } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { scheduleFocus } from "../state/useSceneManager";

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

const MENU_ITEM_COUNT = 4;

const SECTION_OPTION_IDS = {
  screenReader: "access-screen-reader-options",
  textSize: "access-text-size-options",
  theme: "access-theme-options",
  brightness: "access-brightness-options",
};

const SECTION_NAMES = {
  screenReader: "Screen Reader",
  textSize: "Text Size",
  theme: "Contrast",
  brightness: "Brightness",
};

const ONBOARDING_BLURB =
  "By default, the screen reader is on. Press Skip to continue, or use the left and right keys to customize. Press the settings key to access this menu at any time.";

// Single spoken open line (dialog title + blurb) so NVDA does not stack
// dialog aria-label + intro aria-label into a double read.
const ONBOARDING_INTRO_SR_LABEL = `Accessibility Settings. ${ONBOARDING_BLURB}`;

const SKIP_TIP =
  "Tip: Press the Select key to stick with these settings, or press the right key to toggle screen reader or adjust text size, contrast, or brightness.";

// Folded into aria-label after a period so NVDA pauses before the tip (not after "button").
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

function menuItemLabel(name, valueLabel, index, optionCount) {
  return `${name}, set to ${valueLabel}, ${index} of ${MENU_ITEM_COUNT} menu items, ${optionCount} available ${name.toLowerCase()} options.`;
}

function optionLabel(label, selected, index, total) {
  return `${label}, ${selected ? "selected" : "unselected"}, option ${index} of ${total}`;
}

function triggerAriaLabel(name, valueLabel, index, optionCount, isExpanded, tip) {
  let label = menuItemLabel(name, valueLabel, index, optionCount);
  if (tip) label = `${label} ${tip}`;
  if (isExpanded) label = `${label} Press Select to close.`;
  return label;
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
  const [expandedSection, setExpandedSection] = useState(null);
  const introRef = useRef(null);
  const sectionRefs = useRef({});

  // After Select opens a section, move focus to the first option once it's mounted.
  useEffect(() => {
    if (!expandedSection) return;
    const root = document.getElementById(SECTION_OPTION_IDS[expandedSection]);
    const first = root?.querySelector("button:not([disabled])");
    if (!first) return undefined;
    return scheduleFocus(first);
  }, [expandedSection]);

  const closeSection = (section) => {
    const name = SECTION_NAMES[section];

    setExpandedSection(null);
    // Focus stays on the trigger, so the full menu-item label is still one
    // Next/Prev away — the confirmation only needs to say what closed.
    announce(`${name} closed.`, {
      politeness: "assertive",
      source: "settings-section-close",
    });
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      closeSection(section);
      return;
    }
    setExpandedSection(section);
  };

  const returnToMenuItem = (section) => {
    setExpandedSection(null);
    const focusTrigger = () => {
      sectionRefs.current[section]?.focus({ preventScroll: true });
    };
    requestAnimationFrame(focusTrigger);
    window.setTimeout(focusTrigger, 50);
  };

  const currentTextSizeLabel = textSizeOptions.find((o) => o.value === prefs.textSize)?.label ?? prefs.textSize;
  const currentThemeLabel = themeOptions.find((o) => o.value === prefs.theme)?.label ?? prefs.theme;
  const currentBrightnessLabel = brightnessOptions.find((o) => o.value === prefs.brightness)?.label ?? String(prefs.brightness);
  const currentScreenReaderLabel = speechMode ? "On" : "Off";

  const isAtDefaults = prefsMatchDefaults(prefs) && speechMode === true;

  const handleScreenReader = (enabled) => {
    if (enabled !== speechMode) {
      setSpeechModePreference(enabled);
    }
    returnToMenuItem("screenReader");
  };

  const handlePrefOption = (section, key, value) => {
    setPref(key, value);
    returnToMenuItem(section);
  };

  const handleResetToDefaults = () => {
    resetPrefs();
    setExpandedSection(null);
    announce(RESET_RESTORED_ANNOUNCEMENT, {
      politeness: "assertive",
      source: "settings-reset",
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
          data-settings-layer="chrome"
          aria-label={onboarding ? ONBOARDING_INTRO_SR_LABEL : undefined}
        >
          <h2
            id="accessibility-settings-title"
            aria-hidden="true"
          >
            Accessibility Settings
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
            aria-label={`Skip. ${SKIP_TIP}`}
          >
            Skip
          </button>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          ref={(el) => {
            sectionRefs.current.screenReader = el;
          }}
          data-settings-layer="menu"
          data-settings-menu-item
          onClick={() => toggleSection("screenReader")}
          aria-expanded={expandedSection === "screenReader"}
          aria-controls="access-screen-reader-options"
          id="access-screen-reader-trigger"
          aria-label={triggerAriaLabel(
            "Screen Reader",
            currentScreenReaderLabel,
            1,
            screenReaderOptions.length,
            expandedSection === "screenReader",
            SCREEN_READER_TIP
          )}
        >
          <span className="setting-section-label" aria-hidden="true">Screen Reader</span>
          <span className="setting-section-value" aria-hidden="true">{currentScreenReaderLabel}</span>
        </button>
        {/* No role/label on the options wrappers: a labelled group makes NVDA
            re-read the trigger's whole label when focus enters it. */}
        {expandedSection === "screenReader" && (
          <div id="access-screen-reader-options" className="setting-options">
            {screenReaderOptions.map((option, i) => {
              const base = optionLabel(
                option.label,
                speechMode === option.value,
                i + 1,
                screenReaderOptions.length
              );
              return (
              <button
                key={String(option.value)}
                type="button"
                className={`setting-btn ${speechMode === option.value ? "active" : ""}`}
                data-settings-layer="options"
                onClick={() => handleScreenReader(option.value)}
                aria-pressed={speechMode === option.value}
                aria-label={
                  option.value === false ? `${base}. ${SCREEN_READER_TIP}` : base
                }
              >
                <span aria-hidden="true">{option.label}</span>
              </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          ref={(el) => {
            sectionRefs.current.textSize = el;
          }}
          data-settings-layer="menu"
          data-settings-menu-item
          onClick={() => toggleSection("textSize")}
          aria-expanded={expandedSection === "textSize"}
          aria-controls="access-text-size-options"
          id="access-text-size-trigger"
          aria-label={triggerAriaLabel(
            "Text Size",
            currentTextSizeLabel,
            2,
            textSizeOptions.length,
            expandedSection === "textSize"
          )}
        >
          <span className="setting-section-label" aria-hidden="true">Text Size</span>
          <span className="setting-section-value" aria-hidden="true">{currentTextSizeLabel}</span>
        </button>
        {expandedSection === "textSize" && (
          <div id="access-text-size-options" className="setting-options">
            {textSizeOptions.map((option, i) => (
              <button
                key={option.value}
                type="button"
                className={`setting-btn ${prefs.textSize === option.value ? "active" : ""}`}
                data-settings-layer="options"
                onClick={() => handlePrefOption("textSize", "textSize", option.value)}
                aria-pressed={prefs.textSize === option.value}
                aria-label={optionLabel(
                  option.label,
                  prefs.textSize === option.value,
                  i + 1,
                  textSizeOptions.length
                )}
              >
                <span aria-hidden="true">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          ref={(el) => {
            sectionRefs.current.theme = el;
          }}
          data-settings-layer="menu"
          data-settings-menu-item
          onClick={() => toggleSection("theme")}
          aria-expanded={expandedSection === "theme"}
          aria-controls="access-theme-options"
          id="access-theme-trigger"
          aria-label={triggerAriaLabel(
            "Contrast",
            currentThemeLabel,
            3,
            themeOptions.length,
            expandedSection === "theme"
          )}
        >
          <span className="setting-section-label" aria-hidden="true">Contrast</span>
          <span className="setting-section-value" aria-hidden="true">{currentThemeLabel}</span>
        </button>
        {expandedSection === "theme" && (
          <div id="access-theme-options" className="setting-options">
            {themeOptions.map((option, i) => (
              <button
                key={option.value}
                type="button"
                className={`setting-btn ${prefs.theme === option.value ? "active" : ""}`}
                data-settings-layer="options"
                onClick={() => handlePrefOption("theme", "theme", option.value)}
                aria-pressed={prefs.theme === option.value}
                aria-label={optionLabel(
                  option.label,
                  prefs.theme === option.value,
                  i + 1,
                  themeOptions.length
                )}
              >
                <span aria-hidden="true">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <button
          type="button"
          className="setting-section-trigger"
          ref={(el) => {
            sectionRefs.current.brightness = el;
          }}
          data-settings-layer="menu"
          data-settings-menu-item
          onClick={() => toggleSection("brightness")}
          aria-expanded={expandedSection === "brightness"}
          aria-controls="access-brightness-options"
          id="access-brightness-trigger"
          aria-label={triggerAriaLabel(
            "Brightness",
            currentBrightnessLabel,
            4,
            brightnessOptions.length,
            expandedSection === "brightness"
          )}
        >
          <span className="setting-section-label" aria-hidden="true">Brightness</span>
          <span className="setting-section-value" aria-hidden="true">{currentBrightnessLabel}</span>
        </button>
        {expandedSection === "brightness" && (
          <div id="access-brightness-options" className="setting-options">
            {brightnessOptions.map((option, i) => (
              <button
                key={option.value}
                type="button"
                className={`setting-btn ${prefs.brightness === option.value ? "active" : ""}`}
                data-settings-layer="options"
                onClick={() => handlePrefOption("brightness", "brightness", option.value)}
                aria-pressed={prefs.brightness === option.value}
                aria-label={optionLabel(
                  option.label,
                  prefs.brightness === option.value,
                  i + 1,
                  brightnessOptions.length
                )}
              >
                <span aria-hidden="true">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button
          type="button"
          className="setting-btn settings-reset-btn"
          data-settings-layer="chrome"
          onClick={handleResetToDefaults}
          disabled={isAtDefaults}
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
