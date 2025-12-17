import React, { useRef, useState } from "react";

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="video-container">
      <video 
        ref={videoRef}
        src={src}
        poster={poster}
        onEnded={handleEnded}
        tabIndex={0}
        aria-label="Video player"
      />
      <div className="video-controls">
        {!isPlaying ? (
          <button onClick={play} aria-label="Play video">
            Play ▶
          </button>
        ) : (
          <button onClick={pause} aria-label="Pause video">
            Pause ⏸
          </button>
        )}
      </div>
    </div>
  );
}

