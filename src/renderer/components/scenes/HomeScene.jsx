import React, { useState } from "react";
import { useAppState } from "../../state/StateProvider";

const themes = [
  { id: "change",    label: "Change",    disabled: true,  scene: null,     image: null },
  { id: "together",  label: "Together",  disabled: true,  scene: null,     image: null },
  { id: "adventure", label: "Adventure", disabled: false, scene: "travel", image: "3A2Lunch1.jpeg" },
  { id: "work",      label: "Work",      disabled: true,  scene: null,     image: null },
];

export default function HomeScene() {
  const { goToScene } = useAppState();
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : themes.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < themes.length - 1 ? prev + 1 : 0));
  };

  const handleSelect = () => {
    const theme = themes[activeIndex];
    if (!theme.disabled && theme.scene) {
      goToScene(theme.scene);
    }
  };

  return (
    <div className="home-scene">
      {/* Background overlay */}
      <div className="home-bg" aria-hidden="true" />

      {/* Main content: heading + carousel */}
      <div className="home-content">
        <div className="home-heading">
          <h1 tabIndex={0}>
            Choose a theme from Helen Keller's life journey
          </h1>
        </div>

        <div className="home-carousel" role="region" aria-label="Theme selection">
          <div className="theme-circles">
            {themes.map((theme, i) => {
              const offset = i - activeIndex;
              return (
                <button
                  key={theme.id}
                  className={`theme-circle ${i === activeIndex ? "theme-circle--active" : ""} ${theme.disabled ? "theme-circle--disabled" : ""}`}
                  style={{ "--offset": offset }}
                  onClick={() => {
                    if (i === activeIndex) {
                      handleSelect();
                    } else {
                      setActiveIndex(i);
                    }
                  }}
                  aria-label={`${theme.label}${theme.disabled ? " (coming soon)" : ""}`}
                  tabIndex={i === activeIndex ? 0 : -1}
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
              );
            })}
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
          <button
            className="nav-btn icon-btn"
            onClick={handlePrev}
            aria-label="Previous theme"
          >
            <img src="Back.svg" alt="" aria-hidden="true" />
          </button>
          <button
            className="nav-btn icon-btn"
            onClick={handleNext}
            aria-label="Next theme"
          >
            <img src="Forward.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="home-nav-center">
          {themes.map((theme, i) => (
            <span
              key={theme.id}
              className={`indicator ${i === activeIndex ? "active" : ""}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

