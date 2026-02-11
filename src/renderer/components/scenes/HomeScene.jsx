import React from "react";
import { useAppState } from "../../state/StateProvider";

const themes = [
  { id: "change",    label: "Change",    disabled: true,  scene: null,     image: null },
  { id: "together",  label: "Together",  disabled: true,  scene: null,     image: null },
  { id: "adventure", label: "Adventure", disabled: false, scene: "travel", image: "3A2Lunch1.jpeg" },
  { id: "work",      label: "Work",      disabled: true,  scene: null,     image: null },
];

export default function HomeScene() {
  const { goToScene } = useAppState();

  return (
    <div className="home-scene">
      {/* Background overlay */}
      <div className="home-bg" aria-hidden="true" />

      {/* Main content: heading + carousel */}
      <div className="home-content">
        <div className="home-heading">
          <h1 tabIndex={-1}>
            Choose a theme from Helen Keller's life journey
          </h1>
        </div>

        <div className="home-carousel" role="region" aria-label="Theme selection">
          <div className="theme-circles">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-circle ${theme.disabled ? "theme-circle--disabled" : ""}`}
                onClick={() => {
                  if (!theme.disabled && theme.scene) {
                    goToScene(theme.scene);
                  }
                }}
                aria-label={`${theme.label}${theme.disabled ? " (coming soon)" : ""}`}
                tabIndex={0}
              >
                <span className="theme-circle-inner">
                  {theme.image ? (
                    <img src={theme.image} alt="" aria-hidden="true" />
                  ) : (
                    <span className="theme-circle-placeholder" aria-hidden="true" />
                  )}
                </span>
                <span className="theme-label">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="home-nav">
        <div className="home-nav-left">
          <button
            className="nav-btn icon-btn"
            onClick={() => goToScene("accessibility")}
            aria-label="Settings"
          >
            <img src="settingsCog.svg" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

