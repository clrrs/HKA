import React, { useRef } from "react";
import { useAppState, DEFAULT_PREFS } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import {
  textSizeOptions,
  themeOptions,
  brightnessOptions,
  screenReaderOptions,
  FLAT_MENU_ITEM_COUNT,
} from "../data/settingsOptions";

const SELECT_HINT_ID = "settings-select-hint-flat";
const SELECT_HINT = "Press select to change.";
// Leading " , " nudges a brief pause after NVDA says "button".
const SELECT_HINT_DESCRIPTION = ` , ${SELECT_HINT}`;

const ONBOARDING_BLURB =
  "Screen reader is on by default. Press Skip to continue, or left and right to change settings. Press Settings anytime to reopen this menu.";

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

function headerLabel(name, valueLabel, index) {
  return `${name}, ${valueLabel}, ${index} of ${FLAT_MENU_ITEM_COUNT}`;
}

function valueLabel(settingName, optionLabel, selected, index) {
  const selectedPart = selected ? ", selected" : "";
  return `${settingName}, ${optionLabel}${selectedPart}, ${index} of ${FLAT_MENU_ITEM_COUNT}`;
}

/** Focusable section label — looks like plain text, not a button. */
function SettingHeader({ name, valueLabel: currentValue, index, id }) {
  return (
    <button
      type="button"
      className="setting-flat-header"
      id={id}
      data-settings-layer="menu"
      data-settings-menu-item
      aria-label={headerLabel(name, currentValue, index)}
    >
      <span aria-hidden="true">{name}</span>
    </button>
  );
}

function SettingValueOption({
  settingName,
  option,
  selected,
  index,
  onSelect,
  id,
}) {
  return (
    <button
      type="button"
      className={`setting-flat-option${selected ? " setting-flat-option--selected" : ""}`}
      id={id}
      data-settings-layer="menu"
      data-settings-menu-item
      onClick={onSelect}
      aria-label={valueLabel(settingName, option.label, selected, index)}
      aria-describedby={SELECT_HINT_ID}
    >
      <span aria-hidden="true">{option.label}</span>
    </button>
  );
}

function SettingFlatGroup({
  name,
  headerId,
  headerIndex,
  currentValueLabel,
  options,
  currentValue,
  onSelectValue,
  optionIdPrefix,
  startIndex,
}) {
  return (
    <div className="setting-group setting-flat-group">
      <SettingHeader
        name={name}
        valueLabel={currentValueLabel}
        index={headerIndex}
        id={headerId}
      />
      <div className="setting-flat-options">
        {options.map((option, i) => {
          const index = startIndex + i;
          const selected = option.value === currentValue;
          return (
            <SettingValueOption
              key={String(option.value)}
              settingName={name}
              option={option}
              selected={selected}
              index={index}
              id={`${optionIdPrefix}-${String(option.value)}`}
              onSelect={() => onSelectValue(option)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function AccessibilityMenuFlat({ onboarding = false }) {
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
    textSizeOptions.find((o) => o.value === prefs.textSize)?.label ??
    prefs.textSize;
  const currentThemeLabel =
    themeOptions.find((o) => o.value === prefs.theme)?.label ?? prefs.theme;
  const currentBrightnessLabel =
    brightnessOptions.find((o) => o.value === prefs.brightness)?.label ??
    String(prefs.brightness);
  const currentScreenReaderLabel = speechMode ? "On" : "Off";

  const isAtDefaults = prefsMatchDefaults(prefs) && speechMode === true;

  // Index map: header + options for each group (15 total).
  // SR: 1 + 2–3 | Text: 4 + 5–7 | Contrast: 8 + 9–10 | Brightness: 11 + 12–15
  const idx = {
    srHeader: 1,
    srOptions: 2,
    textHeader: 1 + 1 + screenReaderOptions.length,
    textOptions: 1 + 1 + screenReaderOptions.length + 1,
    themeHeader:
      1 +
      1 +
      screenReaderOptions.length +
      1 +
      textSizeOptions.length,
    themeOptions:
      1 +
      1 +
      screenReaderOptions.length +
      1 +
      textSizeOptions.length +
      1,
    brightnessHeader:
      1 +
      1 +
      screenReaderOptions.length +
      1 +
      textSizeOptions.length +
      1 +
      themeOptions.length,
    brightnessOptions:
      1 +
      1 +
      screenReaderOptions.length +
      1 +
      textSizeOptions.length +
      1 +
      themeOptions.length +
      1,
  };

  const announceSelectValue = (label, tip) => {
    announce(tip ? `${label}. ${tip}` : label, {
      politeness: "assertive",
      source: "settings-select",
    });
  };

  const handleScreenReaderSelect = (option) => {
    if (option.value === speechMode) {
      announceSelectValue(option.label);
      return;
    }
    setSpeechModePreference(option.value);
    announceSelectValue(
      option.label,
      option.value === false ? SCREEN_READER_TIP : null
    );
  };

  const handlePrefSelect = (key, option) => {
    if (prefs[key] === option.value) {
      announceSelectValue(option.label);
      return;
    }
    setPref(key, option.value);
    announceSelectValue(option.label);
  };

  const handleResetToDefaults = () => {
    if (isAtDefaults) return;
    resetPrefs();
    announce(RESET_RESTORED_ANNOUNCEMENT, {
      politeness: "assertive",
      source: "settings-reset",
    });
    const el = resetBtnRef.current;
    if (el) {
      requestAnimationFrame(() => el.focus({ preventScroll: true }));
    }
  };

  return (
    <div className="accessibility-menu accessibility-menu--flat">
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
          <h2 id="accessibility-settings-title" aria-hidden="true">
            Settings
          </h2>
          {onboarding && (
            <p id="accessibility-onboarding-blurb" aria-hidden="true">
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

      <SettingFlatGroup
        name="Screen Reader"
        headerId="access-screen-reader-header"
        headerIndex={idx.srHeader}
        currentValueLabel={currentScreenReaderLabel}
        options={screenReaderOptions}
        currentValue={speechMode}
        startIndex={idx.srOptions}
        optionIdPrefix="access-screen-reader"
        onSelectValue={handleScreenReaderSelect}
      />

      <SettingFlatGroup
        name="Text Size"
        headerId="access-text-size-header"
        headerIndex={idx.textHeader}
        currentValueLabel={currentTextSizeLabel}
        options={textSizeOptions}
        currentValue={prefs.textSize}
        startIndex={idx.textOptions}
        optionIdPrefix="access-text-size"
        onSelectValue={(option) => handlePrefSelect("textSize", option)}
      />

      <SettingFlatGroup
        name="Contrast"
        headerId="access-theme-header"
        headerIndex={idx.themeHeader}
        currentValueLabel={currentThemeLabel}
        options={themeOptions}
        currentValue={prefs.theme}
        startIndex={idx.themeOptions}
        optionIdPrefix="access-theme"
        onSelectValue={(option) => handlePrefSelect("theme", option)}
      />

      <SettingFlatGroup
        name="Brightness"
        headerId="access-brightness-header"
        headerIndex={idx.brightnessHeader}
        currentValueLabel={currentBrightnessLabel}
        options={brightnessOptions}
        currentValue={prefs.brightness}
        startIndex={idx.brightnessOptions}
        optionIdPrefix="access-brightness"
        onSelectValue={(option) => handlePrefSelect("brightness", option)}
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
