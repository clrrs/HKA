import React, { createContext, useContext, useCallback, useRef } from "react";

const AnnouncerContext = createContext(null);

export function useAnnounce() {
  return useContext(AnnouncerContext);
}

const DIAGNOSTIC = typeof window !== "undefined" && window.__ANNOUNCE_DIAGNOSTIC__;

export default function AnnouncerProvider({ children }) {
  const politeRef = useRef(null);
  const assertiveRef = useRef(null);
  const lastMessageRef = useRef({ text: "", time: 0 });

  const announce = useCallback((message, options = {}) => {
    const {
      politeness = "assertive",
      dedupeMs = 0,
      clear = false,
    } = options;

    if (clear) {
      if (politeRef.current) politeRef.current.textContent = "";
      if (assertiveRef.current) assertiveRef.current.textContent = "";
      lastMessageRef.current = { text: "", time: 0 };
      return;
    }

    if (!message) return;

    const now = Date.now();
    if (
      dedupeMs > 0 &&
      message === lastMessageRef.current.text &&
      now - lastMessageRef.current.time < dedupeMs
    ) {
      return;
    }

    lastMessageRef.current = { text: message, time: now };

    const target =
      politeness === "assertive" ? assertiveRef.current : politeRef.current;

    if (!target) return;

    // Clear then set on next tick so the browser treats it as a new announcement
    target.textContent = "";
    setTimeout(() => {
      if (target) target.textContent = message;
    }, 50);

    if (DIAGNOSTIC) {
      const entry = {
        time: new Date().toISOString(),
        message,
        politeness,
        dedupeMs,
      };
      window.__ANNOUNCE_LOG__ = window.__ANNOUNCE_LOG__ || [];
      window.__ANNOUNCE_LOG__.push(entry);
      console.log("[Announcer]", entry);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div
        ref={politeRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      <div
        ref={assertiveRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />
    </AnnouncerContext.Provider>
  );
}
