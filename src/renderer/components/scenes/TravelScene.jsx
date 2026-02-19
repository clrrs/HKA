import React from "react";
import { useAppState } from "../../state/StateProvider";
import { artifacts } from "../../data/artifacts";

export default function TravelScene() {
  const { goToScene } = useAppState();

  return (
    <div className="container">
      <h1 tabIndex={0}>Adventure</h1>
      <h4 className="quote" tabIndex={0}>
        "Life is either a daring adventure or nothing."
      </h4>
      
      <h4 tabIndex={0}>Select an Artifact</h4>
      
      <ul className="artifact-list">
        {artifacts.map((artifact, index) => (
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

