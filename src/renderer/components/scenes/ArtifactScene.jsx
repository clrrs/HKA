import React from "react";
import { useAppState } from "../../state/StateProvider";
import { getArtifact, getNextArtifact, getPrevArtifact, getArtifactIndex } from "../../data/artifacts";
import Carousel from "../Carousel";
import VideoPlayer from "../VideoPlayer";

export default function ArtifactScene() {
  const { artifactId, goToScene, subscene } = useAppState();
  const isCarouselModal = subscene === "expanded" || subscene === "zoom";

  const artifact = getArtifact(artifactId);
  const prevArtifact = getPrevArtifact(artifactId);
  const nextArtifact = getNextArtifact(artifactId);
  const artifactNum = getArtifactIndex(artifactId) + 1;

  if (!artifact) {
    return (
      <div className="artifact-page">
        <h1>Artifact not found</h1>
        <nav className="artifact-nav">
          <button className="nav-btn" onClick={() => goToScene("travel")}>
            Back to Adventure Menu
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="artifact-page">
      <div className="artifact-content" inert={isCarouselModal ? "" : undefined}>
        <div className="artifact-text">
          <h2 className="artifact-header">
            <span className="artifact-header-accent">Adventure — </span>
            <span>Artifact {artifactNum}</span>
          </h2>
          <h1 tabIndex={0}>{artifact.title}</h1>
          <p tabIndex={0}>{artifact.description}</p>
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

      <nav className="artifact-nav" inert={isCarouselModal ? "" : undefined}>
        {prevArtifact ? (
          <button
            className="nav-btn"
            onClick={() => goToScene("artifact", { artifactId: prevArtifact.id })}
            aria-label="Previous Artifact"
          >
            <img src="./Back.svg" alt="" aria-hidden="true" />
            Previous Artifact
          </button>
        ) : (
          <span />
        )}
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
      </nav>
    </div>
  );
}
