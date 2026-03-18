import React, { forwardRef, useState } from "react";

const ArtifactVideoPreview = forwardRef(function ArtifactVideoPreview(
  { poster, onOpen, videoAlt },
  ref
) {
  const [isHovering, setIsHovering] = useState(false);
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

  const ariaLabel = videoAlt ? `Open video player: ${videoAlt}` : "Open video player";

  return (
    <div
      className="artifact-video-preview"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={ref}
    >
      <div className="artifact-video-preview-frame">
        {poster && (
          <div className="artifact-video-preview-viewport">
            <img src={poster} alt={videoAlt || ""} />
          </div>
        )}
        <div className="artifact-video-preview-play-icon" aria-hidden="true">
          ▶
        </div>
      </div>
      {isHovering && (
        <div className="artifact-video-preview-prompt" aria-hidden="true">
          <span>Open Video Player</span>
        </div>
      )}
    </div>
  );
});

export default ArtifactVideoPreview;

