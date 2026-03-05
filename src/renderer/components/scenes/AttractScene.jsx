import React, { useRef, useEffect } from "react";
import { useAppState } from "../../state/StateProvider";

export default function AttractScene({ isActive }) {
  const { goToScene } = useAppState();
  const advancingRef = useRef(false);
  const videoRef = useRef(null);

  // Only play when this scene is active; pause and reset when leaving
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const handleKeyDown = (e) => {
    if (e.repeat) return;
    if (advancingRef.current) return;
    advancingRef.current = true;
    e.preventDefault();
    e.stopPropagation();
    goToScene("instruction");
  };

  const handleClick = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    goToScene("instruction");
  };

  return (
    <div
      className="attract-scene"
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Press any key to continue"
    >
      <video
        ref={videoRef}
        className="attract-video"
        src="/3HK7_Attract_v02-260227_SMALL.mov"
        loop
        playsInline
        aria-hidden="true"
      />
    </div>
  );
}
