import React, { useRef, useEffect } from "react";
import { useAppState } from "../../state/StateProvider";
import { useAudioRouting } from "../../audio/AudioRoutingProvider";
import { setMediaSink } from "../../audio/audioRoutingCore";
import { stopNvdaSpeechForMediaStart } from "../../audio/nvdaSpeechControl";

// Test: aria-braillelabel (React: ariaBrailleLabel) — braille-specific string vs aria-label for speech.
const ATTRACT_BRAILLE_LABEL_TEST =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const ATTRACT_SRC = "3HK7_Attract_v02-260227_small.mp4";

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

  // Allow activation each time we (re)enter the attract scene
  useEffect(() => {
    if (isActive) {
      advancingRef.current = false;
    }
  }, [isActive]);

  const handleKeyDown = (e) => {
    if (e.repeat) return;
    if (e.key === "Control" || e.ctrlKey) return;
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
      data-autofocus={true}
      aria-label="The Helen Keller Archives. Press any key to continue. Headphones are located to the right."
      ariaBrailleLabel={ATTRACT_BRAILLE_LABEL_TEST}
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
