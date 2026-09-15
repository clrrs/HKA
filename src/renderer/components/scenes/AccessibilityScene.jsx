import React from "react";
import { useAppState } from "../../state/StateProvider";
import AccessibilityMenu from "../AccessibilityMenu";
import AccessibilityMenuFlat from "../AccessibilityMenuFlat";

export default function AccessibilityScene() {
  const { goBack, settingsMenuVariant } = useAppState();

  return (
    <div className="container">
      <h1 tabIndex={0}>Settings</h1>

      {settingsMenuVariant === "A" ? (
        <AccessibilityMenuFlat />
      ) : (
        <AccessibilityMenu />
      )}

      <div>
        <button className="nav-btn" onClick={goBack}>
          Close Settings
        </button>
      </div>
    </div>
  );
}
