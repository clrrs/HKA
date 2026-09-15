import React, { useRef } from "react";
import { useAppState, DEFAULT_PREFS } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import {
  textSizeOptions,
  themeOptions,
  brightnessOptions,
  screenReaderOptions,
} from "../data/settingsOptions";

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

function headerLabel(name, valueLabel) {
  return `${name}, ${valueLabel}`;
}

function valueLabel(optionLabel, selected, index, optionCount) {
  const selectedPart = selected ? ", selected" : "";
  return `${optionLabel}${selectedPart}, ${index} of ${optionCount} options`;
}

/** Focusable section label — looks like plain text, not a button. */
function SettingHeader({ name, valueLabel: currentValue, id }) {
  return (
    <div
      className="setting-flat-header"
      id={id}
      tabIndex={0}
      data-settings-layer="menu"
      data-settings-menu-item
      aria-label={headerLabel(name, currentValue)}
    >
      <span aria-hidden="true">{name}</span>
    </div>
  );
}

function SettingValueOption({
  option,
  selected,
  index,
  optionCount,
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
      aria-label={valueLabel(option.label, selected, index, optionCount)}
    >
      <span aria-hidden="true">{option.label}</span>
    </button>
  );
}

function SettingFlatGroup({
  name,
  headerId,
  currentValueLabel,
  options,
  currentValue,
  onSelectValue,
  optionIdPrefix,
}) {
  return (
    <div className="setting-group setting-flat-group">
      <SettingHeader
        name={name}
        valueLabel={currentValueLabel}
        id={headerId}
      />
      <div className="setting-flat-options">
        {options.map((option, i) => {
          const selected = option.value === currentValue;
          return (
            <SettingValueOption
              key={String(option.value)}
              option={option}
              selected={selected}
              index={i + 1}
              optionCount={options.length}
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
        currentValueLabel={currentScreenReaderLabel}
        options={screenReaderOptions}
        currentValue={speechMode}
        optionIdPrefix="access-screen-reader"
        onSelectValue={handleScreenReaderSelect}
      />

      <SettingFlatGroup
        name="Text Size"
        headerId="access-text-size-header"
        currentValueLabel={currentTextSizeLabel}
        options={textSizeOptions}
        currentValue={prefs.textSize}
        optionIdPrefix="access-text-size"
        onSelectValue={(option) => handlePrefSelect("textSize", option)}
      />

      <SettingFlatGroup
        name="Contrast"
        headerId="access-theme-header"
        currentValueLabel={currentThemeLabel}
        options={themeOptions}
        currentValue={prefs.theme}
        optionIdPrefix="access-theme"
        onSelectValue={(option) => handlePrefSelect("theme", option)}
      />

      <SettingFlatGroup
        name="Brightness"
        headerId="access-brightness-header"
        currentValueLabel={currentBrightnessLabel}
        options={brightnessOptions}
        currentValue={prefs.brightness}
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
