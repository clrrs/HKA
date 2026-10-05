import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { buildFocusBraillePage } from "../braille/focusPage.js";
import {
  applyFocusBraillePage,
  appendBrailleStatus,
  getBrailleSnapshot,
  normalizeBraillePage,
  onAnnounceForBraille,
  popBrailleModal,
  pushBrailleModal,
  resendCurrentBraillePage,
  resetBrailleState,
  setBraillePage,
  subscribeBrailleLog,
} from "../braille/brailleControl.js";

const BrailleContext = createContext(null);

export function useBraille() {
  return useContext(BrailleContext);
}

/**
 * Owns Controller Client braille pages.
 * Speech remains on AnnouncerProvider / focus; this channel is braille-only.
 */
export default function BrailleProvider({ children }) {
  const refreshFromFocus = useCallback((el = document.activeElement) => {
    const page = buildFocusBraillePage(el);
    if (!page) {
      if (typeof window !== "undefined" && window.__BRAILLE_DIAGNOSTIC__) {
        console.warn("[Braille] empty focus page", el);
      }
      return;
    }
    applyFocusBraillePage(page, { source: "focusin" });
  }, []);

  useEffect(() => {
    const onFocusIn = (event) => {
      refreshFromFocus(event.target);
    };
    window.addEventListener("focusin", onFocusIn, true);
    // Initial page once the first autofocus lands.
    const t = window.setTimeout(() => refreshFromFocus(), 100);
    return () => {
      window.removeEventListener("focusin", onFocusIn, true);
      window.clearTimeout(t);
    };
  }, [refreshFromFocus]);

  useEffect(() => {
    // Operator diagnostics: window.__HKA_BRAILLE_TOOLS__
    subscribeBrailleLog(() => {});
    if (typeof window !== "undefined") {
      window.__HKA_BRAILLE_RESEND__ = () => resendCurrentBraillePage("manual");
      window.__HKA_BRAILLE_SNAPSHOT__ = () => getBrailleSnapshot();
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.__HKA_BRAILLE_RESEND__;
        delete window.__HKA_BRAILLE_SNAPSHOT__;
      }
    };
  }, []);

  // After speech-cancel (Ctrl), optionally reassert the page if hardware clears it.
  useEffect(() => {
    const originalSend = window.kioskApi?.send;
    if (!originalSend || !window.kioskApi) return undefined;

    let wrapped = false;
    const send = (channel, data) => {
      const result = originalSend(channel, data);
      if (channel === "stop-speech") {
        // Debounced resend: only if testing proves Ctrl dismisses Controller messages.
        // Enabled via window.__HKA_BRAILLE_RESEND_AFTER_STOP__ = true
        if (window.__HKA_BRAILLE_RESEND_AFTER_STOP__) {
          window.setTimeout(() => {
            resendCurrentBraillePage("after-stop-speech");
          }, 180);
        }
      }
      return result;
    };

    try {
      window.kioskApi.send = send;
      wrapped = true;
    } catch {
      wrapped = false;
    }

    return () => {
      if (wrapped) {
        try {
          window.kioskApi.send = originalSend;
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const api = useMemo(
    () => ({
      setPage: setBraillePage,
      pushModal: pushBrailleModal,
      popModal: popBrailleModal,
      appendStatus: appendBrailleStatus,
      onAnnounce: onAnnounceForBraille,
      refreshFromFocus,
      resend: resendCurrentBraillePage,
      reset: resetBrailleState,
      normalize: normalizeBraillePage,
      getSnapshot: getBrailleSnapshot,
    }),
    [refreshFromFocus]
  );

  return (
    <BrailleContext.Provider value={api}>{children}</BrailleContext.Provider>
  );
}
