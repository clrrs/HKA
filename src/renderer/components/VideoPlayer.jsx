import React, { useEffect, useRef, useState } from "react";

export default function VideoPlayer({ src, poster, transcriptText, guidedDescription }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (event.key !== "Escape") return;

      if (showTranscript) {
        event.preventDefault();
        setShowTranscript(false);
      } else if (showGuided) {
        event.preventDefault();
        setShowGuided(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTranscript, showGuided]);

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
        <div className="video-controls-row">
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
        <div className="video-controls-row">
          <button
            type="button"
            onClick={() => {
              setShowGuided(false);
              setShowTranscript(true);
            }}
            aria-label="Open transcript"
          >
            Transcript
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTranscript(false);
              setShowGuided(true);
            }}
            aria-label="Open guided description"
          >
            Guided Description
          </button>
        </div>
      </div>
      {showTranscript && (
        <div className="video-overlay" role="dialog" aria-modal="true" aria-label="Transcript">
          <div className="video-overlay-body">
            <button
              type="button"
              className="video-overlay-close"
              onClick={() => setShowTranscript(false)}
              aria-label="Close transcript"
            >
              Exit
            </button>
            <h2>Transcript</h2>
            <p>{transcriptText || "Transcript coming soon."}</p>
          </div>
        </div>
      )}
      {showGuided && (
        <div
          className="video-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Guided description"
        >
          <div className="video-overlay-body">
            <button
              type="button"
              className="video-overlay-close"
              onClick={() => setShowGuided(false)}
              aria-label="Close guided description"
            >
              Exit
            </button>
            <h2>Guided Description</h2>
            <p>{guidedDescription || "Guided description coming soon."}</p>
          </div>
        </div>
      )}
    </div>
  );
}

