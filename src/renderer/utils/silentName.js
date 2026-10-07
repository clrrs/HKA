/**
 * Accessible name that NVDA neither speaks nor brailles as a role word.
 *
 * role="application" only drops "app" / "application" when the element has a
 * name, and NVDA discards whitespace-only names (Python isspace(), which
 * includes U+00A0). U+2800 (braille pattern blank) is not whitespace, so it
 * counts as a name; NVDA's symbol table speaks it only at punctuation level
 * "all", and braille tables render it as one blank cell.
 */
export const SILENT_NAME = "⠀";
