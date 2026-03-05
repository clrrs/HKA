import React from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme, getArtifact, getNextArtifact, getPrevArtifact } from "../../data/artifacts";
import Carousel from "../Carousel";
import VideoPlayer from "../VideoPlayer";

export default function ArtifactScene() {
  const { artifactId, goToScene, subscene, currentTheme, speechMode } = useAppState();

  const theme = getTheme(currentTheme);
  const artifact = getArtifact(currentTheme, artifactId);
  const prevArtifact = getPrevArtifact(currentTheme, artifactId);
  const nextArtifact = getNextArtifact(currentTheme, artifactId);

  if (!artifact) {
    return (
      <div className="artifact-page">
        <h1>Artifact not found</h1>
        <nav className="artifact-nav">
          <button
            className="nav-btn nav-btn-icon-white"
            onClick={() => goToScene("travel")}
            aria-label="Back to theme, return to artifact list"
          >
            <img src="./Menu.svg" alt="" aria-hidden="true" />
            Back to Theme
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="artifact-page">
      <div className="artifact-content">
        <div className="artifact-text">
          <h2 className="artifact-header">
            <span className="artifact-header-accent">{theme.label}</span>
          </h2>
          <h1 tabIndex={speechMode ? 0 : -1}>{artifact.title}</h1>
          <p tabIndex={speechMode ? 0 : -1}>{artifact.description}</p>
        </div>
        <div className="artifact-media">
          {artifact.type === "video" ? (
            <VideoPlayer
              src={artifact.videoSrc}
              poster={artifact.posterSrc}
            />
          ) : (
            <Carousel images={artifact.images} />
          )}
        </div>
      </div>

      <nav className="artifact-nav">
        <div className="artifact-nav-left">
          <button
            className="nav-btn nav-btn-icon-white"
            onClick={() => goToScene("travel")}
            aria-label="Back to theme, return to artifact list"
          >
            <img src="./Menu.svg" alt="" aria-hidden="true" />
            Back to Theme
          </button>
          {prevArtifact && (
            <button
              className="nav-btn"
              onClick={() => goToScene("artifact", { artifactId: prevArtifact.id })}
              aria-label="Previous Artifact"
            >
              <img src="./Back.svg" alt="" aria-hidden="true" />
              Previous Artifact
            </button>
          )}
        </div>
        <div className="artifact-nav-right">
          {nextArtifact ? (
            <button
              className="nav-btn"
              onClick={() => goToScene("artifact", { artifactId: nextArtifact.id })}
              aria-label="Next Artifact"
            >
              Next Artifact
              <img src="./Forward.svg" alt="" aria-hidden="true" />
            </button>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </div>
  );
}
