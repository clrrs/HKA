import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBraillePage,
  joinBrailleParts,
  withBrailleStatus,
  buildIdleBraillePage,
  buildHomeThemeBraillePage,
  buildThemeArtifactBraillePage,
  buildArtifactOpenBraillePage,
  buildSettingsClosedBraillePage,
  buildTipBraillePage,
  BRAILLE_PAGE_MAX_CHARS,
  BRAILLE_TRUNCATION_MARKER,
} from "../src/renderer/braille/braillePage.js";

test("normalizeBraillePage collapses whitespace and newlines", () => {
  assert.equal(
    normalizeBraillePage("  Hello\n\nworld\t!  "),
    "Hello world !"
  );
});

test("normalizeBraillePage truncates with marker", () => {
  const huge = "a".repeat(BRAILLE_PAGE_MAX_CHARS + 100);
  const out = normalizeBraillePage(huge);
  assert.ok(out.endsWith(BRAILLE_TRUNCATION_MARKER));
  assert.ok(out.length <= BRAILLE_PAGE_MAX_CHARS);
});

test("joinBrailleParts drops empties and adjacent dupes", () => {
  assert.equal(
    joinBrailleParts(["A", "", "A", "B", null, "B"]),
    "A — B"
  );
});

test("withBrailleStatus prefixes without duplicating", () => {
  assert.equal(
    withBrailleStatus("Childhood button", "Settings closed."),
    "Settings closed. — Childhood button"
  );
  assert.equal(
    withBrailleStatus("Settings closed. — Childhood button", "Settings closed."),
    "Settings closed. — Childhood button"
  );
});

test("buildIdleBraillePage is stable (no ticking digits)", () => {
  assert.equal(
    buildIdleBraillePage(),
    "Still there? — Press any key to stay. — Returning to start in 10 seconds."
  );
});

test("buildHomeThemeBraillePage includes list on first entry only", () => {
  const first = buildHomeThemeBraillePage({
    name: "Change, 1 of 4",
    description: "Image: alt. Press select key to view the artifacts in this theme.",
    includeListLabel: true,
  });
  assert.match(first, /^Theme selection list —/);
  const next = buildHomeThemeBraillePage({
    name: "Change, 1 of 4",
    description: "Image: alt. Press select key to view the artifacts in this theme.",
    includeListLabel: false,
  });
  assert.doesNotMatch(next, /^Theme selection list/);
  assert.match(next, /button/);
});

test("buildThemeArtifactBraillePage", () => {
  const page = buildThemeArtifactBraillePage({
    name: "Biplane, 1 of 7",
    description: " , An airplane. Press select key to learn more.",
  });
  assert.match(page, /Artifact selection/);
  assert.match(page, /Biplane/);
});

test("buildArtifactOpenBraillePage precomputes story chunks", () => {
  const page = buildArtifactOpenBraillePage({
    title: "Biplane",
    alt: "Image: a plane.",
    storyChunks: [{ text: "Story one." }, { text: "Story two." }],
    endHint: "Use left and right keys to navigate artifact tool bar.",
  });
  assert.match(page, /Biplane opened/);
  assert.match(page, /Story one/);
  assert.match(page, /Story two/);
  assert.match(page, /tool bar/);
});

test("buildSettingsClosedBraillePage", () => {
  assert.equal(
    buildSettingsClosedBraillePage("Home heading"),
    "Settings closed. — Home heading"
  );
});

test("buildTipBraillePage", () => {
  assert.equal(buildTipBraillePage("Tip: hello"), "Tip: hello");
});
