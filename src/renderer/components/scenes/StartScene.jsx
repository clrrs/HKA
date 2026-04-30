import React from "react";
import { useAppState } from "../../state/StateProvider";

export default function StartScene() {
  const { goToScene } = useAppState();

  const handleStartKeyDown = (e) => {
    if (e.repeat) return;
    const key = e.key;
    const isNext =
      (key === "Tab" && !e.shiftKey) || key.toLowerCase() === "l";

    if (!isNext) return;

    const active = document.activeElement;
    if (active && active.classList && active.classList.contains("start-bubble")) {
      e.preventDefault();
      e.stopPropagation();
      goToScene("home");
    }
  };

  return (
    <div className="start-scene" onKeyDown={handleStartKeyDown}>
      <div className="start-bg" aria-hidden="true" />

      <div className="start-content">
        <div className="start-center">
          <button
            type="button"
            className="start-bubble"
            onClick={() => goToScene("home")}
          >
            The 
            <br />
            Helen Keller Archives
          </button>
        </div>
      </div>
    </div>
  );
}
