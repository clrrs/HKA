/** Full-screen designer mockups for the quote interstitial (light/dark). */

export const QUOTE_THEME_IDS = ["change", "together", "adventure", "work"];

export function quoteScreenSrc(themeId, appearance) {
  if (!themeId) return "";
  const mode = appearance === "light" ? "light" : "dark";
  return `./QuoteScreens/${themeId}-${mode}.png`;
}

let preloadStarted = false;

/** Warm the browser cache so the first theme click does not flash an empty scene. */
export function preloadQuoteScreens() {
  if (preloadStarted || typeof Image === "undefined") return;
  preloadStarted = true;
  for (const themeId of QUOTE_THEME_IDS) {
    for (const appearance of ["dark", "light"]) {
      const img = new Image();
      img.decoding = "async";
      img.src = quoteScreenSrc(themeId, appearance);
    }
  }
}
