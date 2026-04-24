export const MISSING_COPY = "MISSING COPY";

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function textOrMissing(value) {
  if (value == null) return MISSING_COPY;
  const t = String(value).trim();
  return t || MISSING_COPY;
}
