/**
 * Extract a composite braille page from a focused DOM element using existing
 * accessible name / description markup. Pure DOM helpers; no IPC.
 */

function visibleText(el) {
  if (!el) return "";
  if (el.getAttribute?.("aria-hidden") === "true") return "";
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

function resolveIdRefs(root, idRefs) {
  if (!idRefs) return "";
  const parts = [];
  for (const id of idRefs.trim().split(/\s+/)) {
    if (!id) continue;
    const node = root.getElementById?.(id) || document.getElementById(id);
    const text = visibleText(node);
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

function computeAccessibleName(el) {
  if (!el || el.nodeType !== 1) return "";

  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const fromIds = resolveIdRefs(el.ownerDocument || document, labelledBy);
    if (fromIds) return fromIds;
  }

  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim() && ariaLabel.trim() !== "\u00a0") {
    return ariaLabel.trim();
  }

  if (el.tagName === "IMG") {
    return (el.getAttribute("alt") || "").trim();
  }

  // Native label association
  if (el.id) {
    const escape =
      typeof CSS !== "undefined" && CSS.escape
        ? CSS.escape
        : (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    const label = el.ownerDocument?.querySelector?.(`label[for="${escape(el.id)}"]`);
    const labelText = visibleText(label);
    if (labelText) return labelText;
  }

  const text = visibleText(el);
  return text;
}

function computeAccessibleDescription(el) {
  if (!el || el.nodeType !== 1) return "";
  const describedBy = el.getAttribute("aria-describedby");
  if (describedBy) {
    return resolveIdRefs(el.ownerDocument || document, describedBy);
  }
  return "";
}

function computeRole(el) {
  if (!el || el.nodeType !== 1) return "";
  const explicit = el.getAttribute("role");
  if (explicit) return explicit;
  const tag = el.tagName;
  if (tag === "BUTTON") return "button";
  if (tag === "A") return "link";
  if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6") {
    return "heading";
  }
  if (tag === "DIALOG") return "dialog";
  return "";
}

function computeStates(el) {
  if (!el || el.nodeType !== 1) return [];
  const states = [];
  if (el.matches?.("[aria-disabled='true'], :disabled")) states.push("unavailable");
  if (el.getAttribute("aria-pressed") === "true") states.push("pressed");
  if (el.getAttribute("aria-pressed") === "false") states.push("not pressed");
  if (el.getAttribute("aria-checked") === "true") states.push("checked");
  if (el.getAttribute("aria-checked") === "false") states.push("not checked");
  if (el.getAttribute("aria-expanded") === "true") states.push("expanded");
  if (el.getAttribute("aria-expanded") === "false") states.push("collapsed");
  if (el.getAttribute("aria-selected") === "true") states.push("selected");
  if (el.getAttribute("aria-current")) states.push("current");
  return states;
}

function findListContext(el) {
  if (!el?.closest) return null;
  const list = el.closest('[role="list"], ul, ol');
  if (!list) return null;
  const label =
    list.getAttribute("aria-label") ||
    resolveIdRefs(el.ownerDocument || document, list.getAttribute("aria-labelledby") || "");
  return label || null;
}

function findDialogContext(el) {
  if (!el?.closest) return null;
  const dialog = el.closest('[role="dialog"], [role="alertdialog"], dialog');
  if (!dialog) return null;
  const name = computeAccessibleName(dialog);
  return name && name !== "\u00a0" ? name : null;
}

/**
 * Build a default focus page for an element.
 * Returns "" when the element should not drive braille (empty / decorative).
 */
export function buildFocusBraillePage(el) {
  if (!el || el.nodeType !== 1) return "";
  if (el === document.body || el === document.documentElement) return "";

  // Explicit opt-out for silent focus parks.
  if (el.dataset?.brailleIgnore === "true") return "";
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel === "\u00a0") return "";

  const name = computeAccessibleName(el);
  const description = computeAccessibleDescription(el);
  const role = computeRole(el);
  const states = computeStates(el);
  const list = findListContext(el);
  const dialog = findDialogContext(el);

  // Prefer meaningful content; skip empty parks.
  if (!name && !description) {
    // Live-region / status containers may still hold textContent used for braille pages.
    const text = visibleText(el);
    if (!text || text === "\u00a0") return "";
    return text;
  }

  const parts = [];
  if (dialog && dialog !== name) parts.push(dialog);
  if (list) parts.push(list);
  if (name) parts.push(name);
  if (role && role !== "presentation" && role !== "none") {
    // Keep role short; NVDA abbreviations are not required for Controller pages.
    parts.push(role);
  }
  if (states.length) parts.push(states.join(" "));
  if (description) parts.push(description);

  return parts
    .map((p) => String(p).replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((part, index, arr) => index === 0 || part !== arr[index - 1])
    .join(" — ");
}

export {
  computeAccessibleName,
  computeAccessibleDescription,
  computeRole,
  computeStates,
};
