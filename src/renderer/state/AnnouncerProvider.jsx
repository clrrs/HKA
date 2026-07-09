import React, { createContext, useContext, useCallback, useRef, useEffect } from "react";

const AnnouncerContext = createContext(null);
const ANNOUNCE_LOG_KEY = "__HKA_ANNOUNCE_LOG__";
const ANNOUNCE_TOOLS_KEY = "__HKA_ANNOUNCE_TOOLS__";
const EXPORT_ALL_TOOLS_KEY = "__HKA_EXPORT_DEBUG_LOGS__";
const CLEAR_ALL_TOOLS_KEY = "__HKA_CLEAR_DEBUG_LOGS__";
const MAX_LOG_ENTRIES = 400;
const ANNOUNCE_LOG_START =
  typeof window !== "undefined"
    ? (window.__HKA_ANNOUNCE_START__ = window.__HKA_ANNOUNCE_START__ || Date.now())
    : Date.now();

function writeAnnouncementLog(entry) {
  if (typeof window === "undefined") return;
  if (!window[ANNOUNCE_LOG_KEY]) {
    window[ANNOUNCE_LOG_KEY] = [];
  }
  const logs = window[ANNOUNCE_LOG_KEY];
  logs.push(entry);
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.splice(0, logs.length - MAX_LOG_ENTRIES);
  }
}

function ensureAnnouncementTools() {
  if (typeof window === "undefined" || window[ANNOUNCE_TOOLS_KEY]) return;
  window[ANNOUNCE_TOOLS_KEY] = {
    get() {
      return [...(window[ANNOUNCE_LOG_KEY] || [])];
    },
    clear() {
      window[ANNOUNCE_LOG_KEY] = [];
      return [];
    },
    exportText() {
      const lines = (window[ANNOUNCE_LOG_KEY] || [])
        .map(
          (entry) =>
            `${entry.seq}. +${entry.sinceStartMs}ms [${entry.politeness}] [${entry.source}] ${entry.message}`
        )
        .join("\n");
      return lines || "[no announcement logs recorded yet]";
    },
  };

  if (!window[EXPORT_ALL_TOOLS_KEY]) {
    window[EXPORT_ALL_TOOLS_KEY] = () => {
      const inputText =
        window.__HKA_INPUT_TOOLS__?.exportText?.() ||
        "[input log tools unavailable]";
      const announceText =
        window[ANNOUNCE_TOOLS_KEY]?.exportText?.() ||
        "[announcement log tools unavailable]";
      return `=== INPUT LOGS ===\n${inputText}\n\n=== ANNOUNCEMENT LOGS ===\n${announceText}`;
    };
  }

  if (!window[CLEAR_ALL_TOOLS_KEY]) {
    window[CLEAR_ALL_TOOLS_KEY] = () => {
      window.__HKA_INPUT_TOOLS__?.clear?.();
      window[ANNOUNCE_TOOLS_KEY]?.clear?.();
      return "cleared input + announcement logs";
    };
  }
}

export function useAnnounce() {
  return useContext(AnnouncerContext);
}

export default function AnnouncerProvider({ children }) {
  const politeRef = useRef(null);
  const assertiveRef = useRef(null);
  const lastMessageRef = useRef({ text: "", time: 0 });
  const sequenceRef = useRef(0);

  useEffect(() => {
    // Register debug helpers immediately on app load so operators can clear/export
    // before any announcement has fired.
    ensureAnnouncementTools();
  }, []);

  const announce = useCallback((message, options = {}) => {
    const {
      politeness = "assertive",
      dedupeMs = 0,
      clear = false,
      source = "unknown",
    } = options;

    if (clear) {
      if (politeRef.current) politeRef.current.textContent = "";
      if (assertiveRef.current) assertiveRef.current.textContent = "";
      lastMessageRef.current = { text: "", time: 0 };
      ensureAnnouncementTools();
      sequenceRef.current += 1;
      writeAnnouncementLog({
        seq: sequenceRef.current,
        ts: new Date().toISOString(),
        sinceStartMs: Date.now() - ANNOUNCE_LOG_START,
        politeness,
        source,
        message: "[clear]",
        dedupeMs: 0,
        status: "cleared",
      });
      return;
    }

    if (!message) return;

    const now = Date.now();
    if (
      dedupeMs > 0 &&
      message === lastMessageRef.current.text &&
      now - lastMessageRef.current.time < dedupeMs
    ) {
      ensureAnnouncementTools();
      sequenceRef.current += 1;
      writeAnnouncementLog({
        seq: sequenceRef.current,
        ts: new Date().toISOString(),
        sinceStartMs: now - ANNOUNCE_LOG_START,
        politeness,
        source,
        message,
        dedupeMs,
        status: "deduped",
      });
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

    ensureAnnouncementTools();
    sequenceRef.current += 1;
    const entry = {
      seq: sequenceRef.current,
      ts: new Date().toISOString(),
      sinceStartMs: now - ANNOUNCE_LOG_START,
      message,
      politeness,
      dedupeMs,
      source,
      status: "emitted",
    };
    writeAnnouncementLog(entry);
    if (window.__ANNOUNCE_DIAGNOSTIC__) {
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
