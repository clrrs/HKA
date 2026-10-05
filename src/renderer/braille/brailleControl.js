import {
  normalizeBraillePage,
  withBrailleStatus,
  BRAILLE_PART_SEPARATOR,
} from "./braillePage.js";

const LOG_KEY = "__HKA_BRAILLE_LOG__";
const TOOLS_KEY = "__HKA_BRAILLE_TOOLS__";
const MAX_LOG = 400;

let currentPage = "";
let basePage = "";
let modalStack = [];
let lastSent = "";
let coalesceTimer = null;
let pendingText = null;
let generation = 0;
let suppressFocusUntil = 0;

const listeners = new Set();

function writeLog(entry) {
  if (typeof window === "undefined") return;
  if (!window[LOG_KEY]) window[LOG_KEY] = [];
  const logs = window[LOG_KEY];
  logs.push(entry);
  if (logs.length > MAX_LOG) logs.splice(0, logs.length - MAX_LOG);
}

function ensureTools() {
  if (typeof window === "undefined" || window[TOOLS_KEY]) return;
  window[TOOLS_KEY] = {
    get() {
      return [...(window[LOG_KEY] || [])];
    },
    clear() {
      window[LOG_KEY] = [];
      return [];
    },
    exportText() {
      const lines = (window[LOG_KEY] || [])
        .map(
          (e) =>
            `${e.seq}. +${e.sinceStartMs}ms [${e.action}]` +
            `${e.sent === false ? " [NOT SENT]" : ""}` +
            `${e.reason ? ` (${e.reason})` : ""} ${e.text || ""}`
        )
        .join("\n");
      return lines || "[no braille logs recorded yet]";
    },
    getCurrentPage() {
      return currentPage;
    },
  };
}

let seq = 0;
const startMs = Date.now();

function emit(action, text, extra = {}) {
  ensureTools();
  seq += 1;
  const entry = {
    seq,
    ts: new Date().toISOString(),
    sinceStartMs: Date.now() - startMs,
    action,
    text,
    ...extra,
  };
  writeLog(entry);
  for (const listener of listeners) {
    try {
      listener(entry);
    } catch {
      // ignore subscriber errors
    }
  }
  if (typeof window !== "undefined" && window.__BRAILLE_DIAGNOSTIC__) {
    console.log("[Braille]", entry);
  }
  return entry;
}

async function sendToNvda(text, { force = false, source = "unknown" } = {}) {
  const page = normalizeBraillePage(text);
  if (!page) {
    emit("skip", "", { reason: "empty", source, sent: false });
    return { ok: false, reason: "empty", sent: false };
  }
  if (!force && page === lastSent) {
    emit("dedupe", page, { source, sent: false });
    return { ok: true, reason: "deduped", sent: false, text: page };
  }

  const api = typeof window !== "undefined" ? window.kioskApi : null;
  if (!api?.brailleMessage) {
    lastSent = page;
    currentPage = page;
    emit("local-only", page, {
      source,
      sent: false,
      reason: "no_bridge",
    });
    return { ok: false, reason: "no_bridge", sent: false, text: page };
  }

  try {
    const result = await api.brailleMessage(page, { force, source });
    if (result?.ok && result.sent !== false) {
      lastSent = page;
    } else if (result?.ok && result.reason === "deduped") {
      lastSent = page;
    }
    currentPage = page;
    emit("send", page, {
      source,
      sent: Boolean(result?.sent ?? result?.ok),
      reason: result?.reason || null,
      code: result?.code,
    });
    return result;
  } catch (err) {
    emit("error", page, {
      source,
      sent: false,
      reason: String(err?.message || err),
    });
    return { ok: false, reason: "invoke_failed", sent: false };
  }
}

function flushPending() {
  coalesceTimer = null;
  if (pendingText == null) return;
  const text = pendingText;
  pendingText = null;
  void sendToNvda(text, { source: "coalesced" });
}

function scheduleSend(text, { immediate = false, source = "page" } = {}) {
  const page = normalizeBraillePage(text);
  currentPage = page;
  if (immediate) {
    if (coalesceTimer != null) {
      clearTimeout(coalesceTimer);
      coalesceTimer = null;
    }
    pendingText = null;
    return sendToNvda(page, { force: true, source });
  }
  pendingText = page;
  if (coalesceTimer != null) clearTimeout(coalesceTimer);
  coalesceTimer = setTimeout(flushPending, 50);
  return Promise.resolve({ ok: true, reason: "queued", sent: false, text: page });
}

function activePageFromStack() {
  if (modalStack.length) {
    return modalStack[modalStack.length - 1].text;
  }
  return basePage;
}

/**
 * Replace the current braille page. Focus-driven updates write the base page
 * unless a modal page is stacked.
 */
export function setBraillePage(text, options = {}) {
  const {
    source = "setBraillePage",
    asBase = true,
    immediate = false,
    suppressFocusMs = 0,
  } = options;
  const page = normalizeBraillePage(text);
  if (suppressFocusMs > 0) {
    suppressFocusUntil = Date.now() + suppressFocusMs;
  }
  if (asBase && !modalStack.length) {
    basePage = page;
  } else if (asBase && modalStack.length) {
    // Remember restored content under the modal.
    basePage = page;
    emit("base-under-modal", page, { source });
    return Promise.resolve({ ok: true, reason: "deferred_modal", sent: false, text: page });
  }
  return scheduleSend(page, { immediate, source });
}

/**
 * Push a modal braille page (tip, settings, idle, transcript, zoom).
 */
export function pushBrailleModal(id, text, options = {}) {
  const page = normalizeBraillePage(text);
  const source = options.source || `modal:${id}`;
  // Replace existing modal with same id.
  modalStack = modalStack.filter((m) => m.id !== id);
  modalStack.push({ id, text: page });
  if (options.suppressFocusMs) {
    suppressFocusUntil = Date.now() + options.suppressFocusMs;
  }
  return scheduleSend(page, {
    immediate: options.immediate !== false,
    source,
  });
}

/**
 * Pop a modal page and restore the previous page (optionally with a status prefix).
 */
export function popBrailleModal(id, options = {}) {
  const before = modalStack.length;
  modalStack = modalStack.filter((m) => m.id !== id);
  if (modalStack.length === before && !options.forceRestore) {
    return Promise.resolve({ ok: true, reason: "not_found", sent: false });
  }
  let page = activePageFromStack();
  if (options.status) {
    page = withBrailleStatus(page, options.status);
  }
  if (options.suppressFocusMs) {
    suppressFocusUntil = Date.now() + options.suppressFocusMs;
  }
  return scheduleSend(page, {
    immediate: options.immediate !== false,
    source: options.source || `modal-pop:${id}`,
  });
}

/**
 * Attach a short status to whatever page is currently showing.
 */
export function appendBrailleStatus(status, options = {}) {
  const page = withBrailleStatus(activePageFromStack() || currentPage, status);
  if (modalStack.length) {
    modalStack[modalStack.length - 1].text = page;
  } else if (options.updateBase) {
    basePage = page;
  }
  return scheduleSend(page, {
    immediate: Boolean(options.immediate),
    source: options.source || "status",
  });
}

/**
 * Announcer hook: include immediate live announcements in the braille page.
 * Delayed/sequenced speech should NOT call this for each chunk — callers should
 * precompute a full page instead (pass braille: false or skipBraille: true).
 */
export function onAnnounceForBraille(message, options = {}) {
  if (options.skipBraille || options.braille === false) return;
  if (options.braillePage) {
    return setBraillePage(options.braillePage, {
      source: options.source || "announce-page",
      immediate: true,
      suppressFocusMs: options.suppressFocusMs ?? 120,
    });
  }
  if (options.brailleMode === "replace") {
    return setBraillePage(message, {
      source: options.source || "announce-replace",
      immediate: true,
      suppressFocusMs: options.suppressFocusMs ?? 120,
    });
  }
  if (options.brailleMode === "modal" && options.brailleModalId) {
    return pushBrailleModal(options.brailleModalId, message, {
      source: options.source || "announce-modal",
    });
  }
  // Default: status prefix on current page (for immediate statuses like Settings closed).
  if (options.brailleMode === "status" || options.brailleStatus) {
    return appendBrailleStatus(message, {
      source: options.source || "announce-status",
      immediate: true,
      updateBase: true,
    });
  }
  // Most announces are speech timing aids; focus/page engine owns braille.
  // Only fold in when explicitly requested.
  if (options.includeInBraille) {
    return appendBrailleStatus(message, {
      source: options.source || "announce",
      immediate: true,
      updateBase: true,
    });
  }
}

/**
 * Modals that should track focus inside them (not freeze on the open banner).
 */
const FOCUS_TRACKING_MODALS = new Set(["settings", "transcript", "zoom"]);

export function applyFocusBraillePage(page, options = {}) {
  if (Date.now() < suppressFocusUntil) {
    emit("focus-suppressed", page, { source: options.source || "focus" });
    return Promise.resolve({ ok: true, reason: "suppressed", sent: false });
  }
  const normalized = normalizeBraillePage(page);
  if (!normalized) {
    return Promise.resolve({ ok: false, reason: "empty", sent: false });
  }

  if (modalStack.length) {
    const top = modalStack[modalStack.length - 1];
    if (FOCUS_TRACKING_MODALS.has(top.id)) {
      top.text = normalized;
      return scheduleSend(normalized, {
        immediate: false,
        source: options.source || `focus-modal:${top.id}`,
      });
    }
    // Non-tracking modal (tip/idle): remember restored base only.
    basePage = normalized;
    emit("focus-under-modal", basePage, { source: options.source || "focus" });
    return Promise.resolve({ ok: true, reason: "modal", sent: false });
  }

  basePage = normalized;
  return scheduleSend(basePage, {
    immediate: false,
    source: options.source || "focus",
  });
}

export function resendCurrentBraillePage(source = "resend") {
  const page = activePageFromStack() || currentPage;
  return sendToNvda(page, { force: true, source });
}

export function bumpBrailleGeneration() {
  generation += 1;
  return generation;
}

export function getBrailleSnapshot() {
  return {
    currentPage,
    basePage,
    modalStack: modalStack.map((m) => ({ ...m })),
    lastSent,
    generation,
    suppressFocusUntil,
  };
}

export function resetBrailleState() {
  currentPage = "";
  basePage = "";
  modalStack = [];
  lastSent = "";
  pendingText = null;
  if (coalesceTimer != null) {
    clearTimeout(coalesceTimer);
    coalesceTimer = null;
  }
  suppressFocusUntil = 0;
  bumpBrailleGeneration();
}

export function subscribeBrailleLog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export { BRAILLE_PART_SEPARATOR, normalizeBraillePage };
