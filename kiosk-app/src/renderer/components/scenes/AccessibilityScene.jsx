import React from "react";
import { useAppState } from "../../state/StateProvider";
import AccessibilityMenu from "../AccessibilityMenu";

export default function AccessibilityScene() {
  const { goBack } = useAppState();

  return (
    <div className="container">
      <h1 tabIndex={0}>Accessibility Settings</h1>
      
      <AccessibilityMenu />
      
      <nav>
        <button 
          className="nav-btn"
          onClick={goBack}
        >
          Close Accessibility Settings
        </button>
      </nav>
    </div>
  );
}

