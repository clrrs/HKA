import React, { forwardRef } from "react";

const ArtifactVideoPreview = forwardRef(function ArtifactVideoPreview(
  { poster, onOpen },
  ref
) {
  const handleActivate = () => {
    if (onOpen) {
      onOpen();
    }
  };

  const handleKeyDown = (event) => {
    if (event.repeat) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      className="artifact-video-preview"
      role="button"
      tabIndex={0}
      aria-label="Open video player"
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      ref={ref}
    >
      <div className="artifact-video-preview-frame">
        {poster && (
          <div className="artifact-video-preview-viewport">
            <img src={poster} alt="" />
          </div>
        )}
        <div className="artifact-video-preview-play-icon" aria-hidden="true">
          ▶
        </div>
      </div>
      <div className="artifact-video-preview-label">Open Video Player</div>
    </div>
  );
});

export default ArtifactVideoPreview;

