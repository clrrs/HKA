import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  normalizeBrailleText,
  resolveDllPath,
  MAX_MESSAGE_CHARS,
  EXPECTED_SHA256,
} = require("../src/main/nvdaControllerBridge.js");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("normalizeBrailleText matches renderer normalization rules", () => {
  assert.equal(normalizeBrailleText("a\nb\tc"), "a b c");
  assert.equal(normalizeBrailleText("   "), "");
  assert.equal(normalizeBrailleText(null), "");
});

test("normalizeBrailleText enforces max length", () => {
  const out = normalizeBrailleText("x".repeat(MAX_MESSAGE_CHARS + 50));
  assert.ok(out.length <= MAX_MESSAGE_CHARS);
  assert.ok(out.includes("[end]"));
});

test("resolveDllPath finds vendor DLL in repo", () => {
  const dll = resolveDllPath();
  assert.ok(dll, "expected DLL path");
  assert.ok(existsSync(dll), dll);
  assert.ok(dll.endsWith("nvdaControllerClient.dll"));
});

test("EXPECTED_SHA256 is the pinned 2026.2 x64 hash", () => {
  assert.equal(
    EXPECTED_SHA256,
    "598b7ec3dc469814f571275929f676ce73834c469fbdb359a06fd4db4e0fc866"
  );
  assert.ok(existsSync(path.join(root, "vendor/nvdaControllerClient/nvdaControllerClient.dll")));
});

test("createNvdaControllerBridge status is platform-safe off Windows", async () => {
  const { createNvdaControllerBridge } = require("../src/main/nvdaControllerBridge.js");
  const bridge = createNvdaControllerBridge({
    isWin: false,
    ensurePowerShell: () => {},
    sendKeys: () => {},
  });
  const status = bridge.status();
  assert.equal(status.isWin, false);
  const result = await bridge.brailleMessage("hello");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "platform");
});
