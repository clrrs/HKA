import React, { useRef, useEffect } from "react";
import { useAppState } from "../../state/StateProvider";
import { useAudioRouting } from "../../audio/AudioRoutingProvider";
import { setMediaSink } from "../../audio/audioRoutingCore";
import {
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechForMediaStart,
} from "../../audio/nvdaSpeechControl";

const ATTRACT_SRC = "3HK7_Attract_v03-260501.mp4";

export default function AttractScene({ isActive }) {
  const { goToScene } = useAppState();
  const advancingRef = useRef(false);
  const videoRef = useRef(null);
  const mirrorRef = useRef(null);
  const { ready, speakerSinkId, applyHeadphoneSink } = useAudioRouting();

  // Sync mirror playback to the visible (master) video
  useEffect(() => {
    const master = videoRef.current;
    const slave = mirrorRef.current;
    if (!master || !slave) return;

    const syncSlaveTime = () => {
      if (Math.abs(slave.currentTime - master.currentTime) > 0.25) {
        slave.currentTime = master.currentTime;
      }
    };

    const onPlay = () => {
      slave.currentTime = master.currentTime;
      if (speakerSinkId) {
        slave.play().catch(() => {});
      }
    };
    const onPause = () => {
      slave.pause();
    };
    const onSeeked = () => {
      slave.currentTime = master.currentTime;
    };

    master.addEventListener("play", onPlay);
    master.addEventListener("pause", onPause);
    master.addEventListener("seeked", onSeeked);
    master.addEventListener("timeupdate", syncSlaveTime);

    return () => {
      master.removeEventListener("play", onPlay);
      master.removeEventListener("pause", onPause);
      master.removeEventListener("seeked", onSeeked);
      master.removeEventListener("timeupdate", syncSlaveTime);
    };
  }, [speakerSinkId]);

  useEffect(() => {
    const master = videoRef.current;
    const slave = mirrorRef.current;
    if (!master || !slave || !ready) return;

    let cancelled = false;

    (async () => {
      await applyHeadphoneSink(master);
      if (speakerSinkId) {
        await setMediaSink(slave, speakerSinkId);
        slave.muted = false;
      } else {
        slave.muted = true;
        slave.pause();
      }

      if (cancelled) return;

      if (isActive) {
        master.currentTime = 0;
        slave.currentTime = 0;
        stopNvdaSpeechForMediaStart();
        master.play().catch((err) => {
          // eslint-disable-next-line no-console
          console.log("[AttractScene] play() error", err);
        });
      } else {
        master.pause();
        slave.pause();
        master.currentTime = 0;
        slave.currentTime = 0;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, ready, applyHeadphoneSink, speakerSinkId]);

  useEffect(() => {
    const master = videoRef.current;
    if (!master || !isActive) return undefined;
    return guardNvdaSpeechSilenceWhilePlaying(master);
  }, [isActive]);

  // Allow activation each time we (re)enter the attract scene
  useEffect(() => {
    if (isActive) {
      advancingRef.current = false;
    }
  }, [isActive]);

  // Window listener so any key still advances if DOM focus was lost (idle timeout).
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === "Control" || e.ctrlKey) return;
      if (advancingRef.current) return;
      advancingRef.current = true;
      e.preventDefault();
      e.stopPropagation();
      goToScene("instruction");
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, goToScene]);

  const handleClick = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    goToScene("instruction");
  };

  return (
    <div
      className="attract-scene"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      data-autofocus={true}
      aria-label="Press any button to begin. Headphones are located to the right."
    >
      <video
        ref={videoRef}
        className="attract-video"
        src={ATTRACT_SRC}
        loop
        playsInline
        tabIndex={-1}
        aria-hidden="true"
      />
      <video
        ref={mirrorRef}
        className="attract-video attract-video-audio-mirror"
        src={ATTRACT_SRC}
        loop
        playsInline
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
