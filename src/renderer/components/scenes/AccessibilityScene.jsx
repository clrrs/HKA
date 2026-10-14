import React from "react";
import { useAppState } from "../../state/StateProvider";
import AccessibilityMenu from "../AccessibilityMenu";

export default function AccessibilityScene() {
  const { goBack } = useAppState();

  return (
    <div className="container">
      <h1 tabIndex={0}>Settings</h1>

      <AccessibilityMenu />

      <div>
        <button className="nav-btn" onClick={goBack}>
          Close Settings
        </button>
      </div>
    </div>
  );
}
