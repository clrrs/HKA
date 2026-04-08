import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  enumerateAudioOutputs,
  loadStoredSinkIds,
  pickHeadphoneAndSpeaker,
  saveStoredSinkIds,
  setMediaSink,
} from "./audioRoutingCore";

const AudioRoutingContext = createContext(null);

export function useAudioRouting() {
  const ctx = useContext(AudioRoutingContext);
  if (!ctx) {
    throw new Error("useAudioRouting must be used within AudioRoutingProvider");
  }
  return ctx;
}

/**
 * Safe no-op when provider missing (e.g. tests) — prefer useAudioRouting in app code.
 */
export function useAudioRoutingOptional() {
  return useContext(AudioRoutingContext);
}

/** Bind a media element to the headphone sink whenever ref attaches or depKey changes. */
export function useHeadphoneSinkEffect(mediaRef, depKey) {
  const { ready, applyHeadphoneSink } = useAudioRouting();
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !ready) return;
    applyHeadphoneSink(el);
  }, [ready, applyHeadphoneSink, mediaRef, depKey]);
}

export default function AudioRoutingProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [headphoneSinkId, setHeadphoneSinkId] = useState(null);
  const [speakerSinkId, setSpeakerSinkId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = loadStoredSinkIds();
      const outputs = await enumerateAudioOutputs();
      if (cancelled) return;

      const picked = pickHeadphoneAndSpeaker(outputs, stored);
      setHeadphoneSinkId(picked.headphoneSinkId);
      setSpeakerSinkId(picked.speakerSinkId);

      if (picked.headphoneSinkId && picked.speakerSinkId) {
        saveStoredSinkIds(picked.headphoneSinkId, picked.speakerSinkId);
      }

      setReady(true);

      // eslint-disable-next-line no-console
      console.log(
        "[audio] outputs:",
        outputs.map((o) => ({ id: o.deviceId?.slice?.(0, 12), label: o.label }))
      );
      // eslint-disable-next-line no-console
      console.log("[audio] headphone sink:", picked.headphoneSinkId?.slice?.(0, 12));
      // eslint-disable-next-line no-console
      console.log("[audio] speaker sink:", picked.speakerSinkId?.slice?.(0, 12));
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyHeadphoneSink = useCallback(
    async (mediaEl) => {
      if (!ready || !headphoneSinkId || !mediaEl) return;
      await setMediaSink(mediaEl, headphoneSinkId);
    },
    [ready, headphoneSinkId]
  );

  const value = useMemo(
    () => ({
      ready,
      headphoneSinkId,
      speakerSinkId,
      applyHeadphoneSink,
    }),
    [ready, headphoneSinkId, speakerSinkId, applyHeadphoneSink]
  );

  return (
    <AudioRoutingContext.Provider value={value}>
      {children}
    </AudioRoutingContext.Provider>
  );
}
