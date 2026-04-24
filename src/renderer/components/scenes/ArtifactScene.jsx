import React, { useEffect, useRef, useState } from "react";
import { useAppState } from "../../state/StateProvider";
import { getTheme, getArtifact, getNextArtifact, getPrevArtifact } from "../../data/artifacts";
import Carousel from "../Carousel";
import DocumentViewer from "../DocumentViewer";
import ArtifactVideoPreview from "../ArtifactVideoPreview";
import ArtifactVideoOverlay from "../ArtifactVideoOverlay";

export default function ArtifactScene() {
  const {
    artifactId,
    goToScene,
    subscene,
    currentTheme,
    speechMode,
    setVideoOverlayOpen,
  } = useAppState();

  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const titleRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const theme = getTheme(currentTheme);
  const artifact = getArtifact(currentTheme, artifactId);
  const prevArtifact = getPrevArtifact(currentTheme, artifactId);
  const nextArtifact = getNextArtifact(currentTheme, artifactId);

  const videoPreviewAlt = (() => {
    if (!artifact) return "";
    if (artifact.id === "3A1") return "Helen Keller rides a biplane, 1919";

    const base = artifact.displayTitle || artifact.title || "Video preview";
    if (artifact.year) return `${base} (${artifact.year})`;
    return base;
  })();

  // When switching artifacts (artifactId changes) while staying on the
  // "artifact" scene, keep screen reader focus on the title/description
  // group in speech mode. In speech-off mode, preserve focus on the nav button.
  useEffect(() => {
    if (!speechMode) return;
    if (showVideoOverlay) return;
    if (!artifact) return;
    titleRef.current?.focus({ preventScroll: true });
  }, [artifactId, speechMode, showVideoOverlay]);

  if (!artifact) {
    return (
      <div className="artifact-page">
        <h1>Artifact not found</h1>
        <div className="artifact-nav">
          <button
            className="nav-btn nav-btn-icon-white"
            onClick={() => goToScene("travel")}
            aria-label="Back to theme, return to artifact list"
          >
            <img src="./Menu.svg" alt="" aria-hidden="true" />
            Back to Theme
          </button>
        </div>
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
          <div
            className="artifact-heading-inner"
            ref={titleRef}
            tabIndex={speechMode ? 0 : -1}
            data-autofocus={speechMode ? true : undefined}
            aria-label={
              speechMode ? `${artifact.title}. ${artifact.description}` : undefined
            }
          >
            <p
              className="artifact-title"
              tabIndex={-1}
              aria-hidden={speechMode ? true : undefined}
            >
              {artifact.title}
            </p>
            <p tabIndex={-1} aria-hidden={speechMode ? true : undefined}>
              {artifact.description}
            </p>
          </div>
        </div>
        <div className="artifact-media">
          {artifact.type === "video" && (
            <ArtifactVideoPreview
              ref={videoPreviewRef}
              poster={artifact.posterSrc}
              videoAlt={videoPreviewAlt}
              onOpen={() => {
                setShowVideoOverlay(true);
                setVideoOverlayOpen(true);
              }}
            />
          )}
          {artifact.type === "document" && <DocumentViewer artifact={artifact} />}
          {artifact.type !== "video" && artifact.type !== "document" && (
            <Carousel
              images={artifact.images}
              transcriptText={artifact.transcriptText}
              guidedDescription={artifact.guidedDescription}
            />
          )}
        </div>
      </div>

      <div className="artifact-nav">
        <div className="artifact-nav-left">
          {nextArtifact && (
            <button
              className="nav-btn"
              onClick={() => goToScene("artifact", { artifactId: nextArtifact.id })}
              aria-label="Next Artifact"
              data-autofocus={speechMode ? undefined : true}
            >
              Next Artifact
              <img src="./Forward.svg" alt="" aria-hidden="true" />
            </button>
          )}
          {prevArtifact && (
            <button
              className="nav-btn"
              onClick={() => goToScene("artifact", { artifactId: prevArtifact.id })}
              aria-label="Previous Artifact"
              data-autofocus={speechMode ? undefined : !nextArtifact ? true : undefined}
            >
              <img src="./Back.svg" alt="" aria-hidden="true" />
              Previous Artifact
            </button>
          )}
          <button
            className="nav-btn nav-btn-icon-white"
            onClick={() => goToScene("travel")}
            aria-label="Back to theme, return to artifact list"
            data-autofocus={
              speechMode ? undefined : !nextArtifact && !prevArtifact ? true : undefined
            }
          >
            <img src="./Menu.svg" alt="" aria-hidden="true" />
            Back to Theme
          </button>
        </div>
      </div>
      {artifact.type === "video" && showVideoOverlay && (
        <ArtifactVideoOverlay
          src={artifact.videoSrc}
          poster={artifact.posterSrc}
          transcript={artifact.transcriptText}
          guidedDescription={artifact.guidedDescription}
          videoAlt={videoPreviewAlt}
          onClose={() => {
            setShowVideoOverlay(false);
            setVideoOverlayOpen(false);
            if (videoPreviewRef.current) {
              videoPreviewRef.current.focus();
            }
          }}
        />
      )}
    </div>
  );
}
