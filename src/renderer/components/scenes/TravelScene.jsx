import React from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme } from "../../data/artifacts";

export default function TravelScene() {
  const { goToScene, currentTheme } = useAppState();
  const theme = getTheme(currentTheme);

  if (!theme) {
    return (
      <div className="travel-scene">
        <h1>Theme not found</h1>
        <nav>
          <button className="nav-btn" onClick={() => goToScene("home")}>
            Back
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="travel-scene">
      <h1 tabIndex={0}>{theme.label}</h1>

      <p className="travel-description" tabIndex={0}>
        {theme.description}
      </p>

      <h4 tabIndex={0}>Select an Artifact</h4>

      <ul className="artifact-list">
        {theme.artifacts.map((artifact, index) => (
          <li key={artifact.id}>
            <button
              className="menu-link"
              onClick={() => goToScene("artifact", { artifactId: artifact.id })}
            >
              Artifact {index + 1}: {artifact.title}
            </button>
          </li>
        ))}
      </ul>

      <nav>
        <button
          className="nav-btn"
          onClick={() => goToScene("home")}
        >
          Back
        </button>
      </nav>
    </div>
  );
}
