import React, { useEffect, useRef, useState } from "react";
import { useHeadphoneSinkEffect } from "../audio/AudioRoutingProvider";
import { textOrMissing } from "../data/contentPlaceholder";
import { useStepScroll } from "./useStepScroll";

export default function VideoPlayer({ src, poster, transcriptText, guidedDescription }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const {
    bodyRef: transcriptBodyRef,
    closeButtonRef: transcriptCloseRef,
    handleKeyDown: handleTranscriptKeyDown,
    resetAnchors: resetTranscriptAnchors,
  } = useStepScroll();
  const {
    bodyRef: guidedBodyRef,
    closeButtonRef: guidedCloseRef,
    handleKeyDown: handleGuidedKeyDown,
    resetAnchors: resetGuidedAnchors,
  } = useStepScroll();
  const transcriptButtonRef = useRef(null);
  const guidedButtonRef = useRef(null);

  useHeadphoneSinkEffect(videoRef, src);

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
              Play
            </button>
          ) : (
            <button onClick={pause} aria-label="Pause video">
              Pause
            </button>
          )}
        </div>
        <div className="video-controls-row">
          <button
            type="button"
            onClick={() => {
              setShowGuided(false);
              setShowTranscript(true);
              setTimeout(() => {
                resetTranscriptAnchors();
              }, 0);
            }}
            aria-label="Open transcript"
            ref={transcriptButtonRef}
          >
            Transcript
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTranscript(false);
              setShowGuided(true);
              setTimeout(() => {
                resetGuidedAnchors();
              }, 0);
            }}
            aria-label="Open guided description"
            ref={guidedButtonRef}
          >
            Guided Description
          </button>
        </div>
      </div>
      {showTranscript && (
        <div className="video-overlay" role="dialog" aria-modal="true" aria-label="Transcript">
          <div className="video-overlay-body" onKeyDown={handleTranscriptKeyDown}>
            <button
              type="button"
              className="video-overlay-close"
              onClick={() => {
                setShowTranscript(false);
                if (transcriptButtonRef.current) {
                  transcriptButtonRef.current.focus();
                }
              }}
              aria-label="Close transcript"
              ref={transcriptCloseRef}
            >
              Exit
            </button>
            <h2>Transcript</h2>
            <div
              className="artifact-document-transcript-text"
              ref={transcriptBodyRef}
              tabIndex={0}
            >
              <p>{textOrMissing(transcriptText)}</p>
            </div>
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
          <div className="video-overlay-body" onKeyDown={handleGuidedKeyDown}>
            <button
              type="button"
              className="video-overlay-close"
              onClick={() => {
                setShowGuided(false);
                if (guidedButtonRef.current) {
                  guidedButtonRef.current.focus();
                }
              }}
              aria-label="Close guided description"
              ref={guidedCloseRef}
            >
              Exit
            </button>
            <h2>Guided Description</h2>
            <div
              className="artifact-document-transcript-text"
              ref={guidedBodyRef}
              tabIndex={0}
            >
              <p>{textOrMissing(guidedDescription)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

