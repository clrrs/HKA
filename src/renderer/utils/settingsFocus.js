const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusables(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  );
}

/**
 * Settings uses two focus layers: menu (items + chrome) and options (no wrap).
 * Menu wrap: Next on Close → first menu item; Prev on first menu item → Close
 * (skips onboarding intro/Skip on wrap).
 */
export function moveSettingsFocus(panel, direction) {
  if (!panel) return null;

  const optionsRoot = panel.querySelector(".setting-options");
  if (optionsRoot) {
    const focusables = visibleFocusables(optionsRoot);
    if (!focusables.length) return null;
    const idx = focusables.indexOf(document.activeElement);
    if (direction === "next") {
      if (idx === -1) return focusables[0];
      if (idx < focusables.length - 1) return focusables[idx + 1];
      return null;
    }
    if (idx === -1) return focusables[focusables.length - 1];
    if (idx > 0) return focusables[idx - 1];
    return null;
  }

  const focusables = visibleFocusables(panel).filter(
    (el) => !el.closest(".setting-options")
  );
  if (!focusables.length) return null;

  const firstMenuItem =
    focusables.find((el) => el.hasAttribute("data-settings-menu-item")) || null;
  const closeBtn =
    focusables.find((el) => el.hasAttribute("data-settings-close")) ||
    focusables[focusables.length - 1];
  const idx = focusables.indexOf(document.activeElement);

  if (direction === "next") {
    if (idx === -1) return focusables[0];
    const current = focusables[idx];
    if (
      current?.hasAttribute("data-settings-close") ||
      idx >= focusables.length - 1
    ) {
      return firstMenuItem || focusables[0];
    }
    return focusables[idx + 1];
  }

  if (idx === -1) return closeBtn;
  const current = focusables[idx];
  if (firstMenuItem && current === firstMenuItem) {
    return closeBtn;
  }
  if (idx > 0) return focusables[idx - 1];
  return null;
}
