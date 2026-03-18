const INPUT_LOG_KEY = "__HKA_INPUT_LOG__";
const INPUT_TOOLS_KEY = "__HKA_INPUT_TOOLS__";
const INPUT_LOG_START_KEY = "__HKA_INPUT_START__";
const MAX_INPUT_LOG_ENTRIES = 600;

function getInputLogStart() {
  if (typeof window === "undefined") return Date.now();
  if (!window[INPUT_LOG_START_KEY]) {
    window[INPUT_LOG_START_KEY] = Date.now();
  }
  return window[INPUT_LOG_START_KEY];
}

function writeInputLog(entry) {
  if (typeof window === "undefined") return;
  if (!window[INPUT_LOG_KEY]) {
    window[INPUT_LOG_KEY] = [];
  }
  const logs = window[INPUT_LOG_KEY];
  logs.push(entry);
  if (logs.length > MAX_INPUT_LOG_ENTRIES) {
    logs.splice(0, logs.length - MAX_INPUT_LOG_ENTRIES);
  }
}

function exportInputText() {
  if (typeof window === "undefined") return "";
  const lines = (window[INPUT_LOG_KEY] || [])
    .map((entry) => {
      const subscene = entry.subscene || "none";
      const key = entry.key || "-";
      const target = entry.target || "unknown";
      const details = entry.details ? ` ${entry.details}` : "";
      return `${entry.seq}. +${entry.sinceStartMs}ms [${entry.scene}/${subscene}] [${entry.source}] key=${key} action=${entry.action} target=${target}${details}`;
    })
    .join("\n");
  return lines || "[no input logs recorded yet]";
}

export function ensureInputLogTools() {
  if (typeof window === "undefined" || window[INPUT_TOOLS_KEY]) return;
  window[INPUT_TOOLS_KEY] = {
    get() {
      return [...(window[INPUT_LOG_KEY] || [])];
    },
    clear() {
      window[INPUT_LOG_KEY] = [];
      return [];
    },
    exportText() {
      return exportInputText();
    },
  };
}

export function getElementSummary(el) {
  if (!el) return "none";
  const tag = (el.tagName || "").toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const role = el.getAttribute?.("role");
  const ariaLabel = el.getAttribute?.("aria-label");
  const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50);
  const label = ariaLabel || text || "no-label";
  return `${tag}${id}${role ? `[${role}]` : ""}:${label}`;
}

export function logInputEvent({
  source = "unknown",
  scene = "unknown",
  subscene = null,
  key = "",
  action = "unknown",
  target = "",
  details = "",
}) {
  if (typeof window === "undefined") return;
  ensureInputLogTools();

  const now = Date.now();
  const existing = window[INPUT_LOG_KEY] || [];
  writeInputLog({
    seq: existing.length + 1,
    ts: new Date().toISOString(),
    sinceStartMs: now - getInputLogStart(),
    source,
    scene,
    subscene,
    key,
    action,
    target,
    details,
  });
}
