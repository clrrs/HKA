import test from "node:test";
import assert from "node:assert/strict";

// Minimal window/kioskApi mock before importing the control module.
globalThis.window = {
  kioskApi: {
    async brailleMessage(text) {
      globalThis.__lastBraille = text;
      return { ok: true, sent: true, text };
    },
  },
};

const {
  setBraillePage,
  pushBrailleModal,
  popBrailleModal,
  appendBrailleStatus,
  getBrailleSnapshot,
  resetBrailleState,
  onAnnounceForBraille,
} = await import("../src/renderer/braille/brailleControl.js");

test("setBraillePage sends normalized text", async () => {
  resetBrailleState();
  await setBraillePage("Hello\nworld", { immediate: true, source: "test" });
  assert.equal(globalThis.__lastBraille, "Hello world");
  assert.equal(getBrailleSnapshot().currentPage, "Hello world");
});

test("modal stack restores base with status", async () => {
  resetBrailleState();
  await setBraillePage("Base control", { immediate: true });
  await pushBrailleModal("idle-warning", "Still there?", { immediate: true });
  assert.equal(getBrailleSnapshot().currentPage, "Still there?");
  await popBrailleModal("idle-warning", {
    status: "Idle warning dismissed.",
    immediate: true,
  });
  assert.match(getBrailleSnapshot().currentPage, /Idle warning dismissed/);
  assert.match(getBrailleSnapshot().currentPage, /Base control/);
});

test("onAnnounceForBraille respects skipBraille", async () => {
  resetBrailleState();
  await setBraillePage("Keep me", { immediate: true });
  onAnnounceForBraille("Speech only chunk", { skipBraille: true });
  // Allow coalesce timer to be idle
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(getBrailleSnapshot().currentPage, "Keep me");
});

test("appendBrailleStatus updates tracking modal", async () => {
  resetBrailleState();
  await pushBrailleModal("settings", "Settings", { immediate: true });
  await appendBrailleStatus("Large", { immediate: true });
  assert.match(getBrailleSnapshot().currentPage, /Large/);
  assert.equal(getBrailleSnapshot().modalStack[0].id, "settings");
});
