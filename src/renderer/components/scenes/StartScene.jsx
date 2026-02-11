import React from "react";
import { useAppState } from "../../state/StateProvider";

export default function StartScene() {
  const { goToScene } = useAppState();

  return (
    <div className="start-scene">
      <div className="start-bg" aria-hidden="true" />

      <div className="start-content">
        <div className="start-top-bar">
          <button
            className="nav-btn icon-btn"
            onClick={() => goToScene("accessibility")}
            aria-label="Settings"
          >
            <img src="settingsCog.svg" alt="" aria-hidden="true" />
          </button>
          <button
            className="nav-btn icon-btn"
            aria-label="Questions"
            onClick={() => {}}
          >
            <img src="Question.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="start-center">
          <button
            className="nav-btn start-btn"
            onClick={() => goToScene("home")}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
