import React from "react";
import { useAppState } from "../../state/StateProvider";
import { getArtifact, getNextArtifact, getPrevArtifact, getArtifactIndex } from "../../data/artifacts";
import Carousel from "../Carousel";
import VideoPlayer from "../VideoPlayer";

export default function ArtifactScene() {
  const { artifactId, goToScene } = useAppState();
  
  const artifact = getArtifact(artifactId);
  const prevArtifact = getPrevArtifact(artifactId);
  const nextArtifact = getNextArtifact(artifactId);
  const artifactNum = getArtifactIndex(artifactId) + 1;
  
  if (!artifact) {
    return (
      <div className="container">
        <h1>Artifact not found</h1>
        <nav>
          <button className="nav-btn" onClick={() => goToScene("travel")}>
            Back to Travel Menu
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="container">
      <h4>Travel and Adventure</h4>
      <h2>Artifact {artifactNum}</h2>
      <h1 tabIndex={0}>{artifact.title}</h1>
      
      <p tabIndex={0}>{artifact.description}</p>
      
      {artifact.type === "video" ? (
        <VideoPlayer 
          src={artifact.videoSrc} 
          poster={artifact.posterSrc}
        />
      ) : (
        <Carousel images={artifact.images} />
      )}
      
      <nav>
        {prevArtifact && (
          <button 
            className="nav-btn nav-btn-icon"
            onClick={() => goToScene("artifact", { artifactId: prevArtifact.id })}
            aria-label="Back"
          >
            <img src="/Back.svg" alt="" aria-hidden="true" />
          </button>
        )}
        {nextArtifact && (
          <button 
            className="nav-btn nav-btn-icon"
            onClick={() => goToScene("artifact", { artifactId: nextArtifact.id })}
            aria-label="Next"
          >
            <img src="/Forward.svg" alt="" aria-hidden="true" />
          </button>
        )}
        <br />
        <button 
          className="nav-btn"
          onClick={() => goToScene("travel")}
        >
          Travel and Adventure Menu
        </button>
        <br />
        <button 
          className="nav-btn"
          onClick={() => goToScene("home")}
        >
          Home
        </button>
        <button 
          className="nav-btn"
          onClick={() => goToScene("accessibility")}
        >
          Accessibility Settings
        </button>
      </nav>
    </div>
  );
}

