const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusables(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  );
}

function isNavTarget(el) {
  return el.getAttribute("aria-disabled") !== "true";
}

/**
 * Settings focus: menu items + chrome in one layer.
 * Wrap: Next on Close → first menu item; Prev on first menu item → Close
 * (skips onboarding intro/Skip on wrap).
 * Unavailable controls (aria-disabled) are skipped when navigating to them, but
 * if focus is already parked on one (e.g. Reset after restore), Next/Prev leave it.
 */
export function moveSettingsFocus(panel, direction) {
  if (!panel) return null;

  const all = visibleFocusables(panel);
  const focusables = all.filter(isNavTarget);
  if (!focusables.length) return null;

  const firstMenuItem =
    focusables.find((el) => el.hasAttribute("data-settings-menu-item")) || null;
  const closeBtn =
    focusables.find((el) => el.hasAttribute("data-settings-close")) ||
    focusables[focusables.length - 1];
  const active = document.activeElement;
  const idx = focusables.indexOf(active);

  // Focus is on an unavailable control that is still in the DOM (Reset after click).
  if (idx === -1 && all.includes(active)) {
    const allIdx = all.indexOf(active);
    if (direction === "next") {
      for (let i = allIdx + 1; i < all.length; i += 1) {
        if (isNavTarget(all[i])) return all[i];
      }
      return firstMenuItem || focusables[0];
    }
    for (let i = allIdx - 1; i >= 0; i -= 1) {
      if (isNavTarget(all[i])) return all[i];
    }
    return closeBtn;
  }

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
