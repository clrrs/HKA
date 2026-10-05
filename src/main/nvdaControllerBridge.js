const path = require("path");
const fs = require("fs");
const os = require("os");
const { app } = require("electron");

const MAX_MESSAGE_CHARS = 32000;
const TRUNCATION_MARKER = " … [end]";
const DLL_FILENAME = "nvdaControllerClient.dll";
const EXPECTED_SHA256 =
  "598b7ec3dc469814f571275929f676ce73834c469fbdb359a06fd4db4e0fc866";

/**
 * Resolve the packaged/dev path to the official NVDA Controller Client DLL.
 * Packaged: process.resourcesPath/nvdaControllerClient/
 * Dev: vendor/nvdaControllerClient/ next to the repo root.
 */
function resolveDllPath() {
  const packaged = path.join(
    process.resourcesPath || "",
    "nvdaControllerClient",
    DLL_FILENAME
  );
  if (process.resourcesPath && fs.existsSync(packaged)) {
    return packaged;
  }

  const fromMain = path.join(
    __dirname,
    "../../vendor/nvdaControllerClient",
    DLL_FILENAME
  );
  if (fs.existsSync(fromMain)) {
    return fromMain;
  }

  const fromCwd = path.join(
    process.cwd(),
    "vendor/nvdaControllerClient",
    DLL_FILENAME
  );
  if (fs.existsSync(fromCwd)) {
    return fromCwd;
  }

  return null;
}

function normalizeBrailleText(text) {
  if (typeof text !== "string") return "";
  let out = text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!out) return "";
  if (out.length > MAX_MESSAGE_CHARS) {
    const keep = Math.max(0, MAX_MESSAGE_CHARS - TRUNCATION_MARKER.length);
    out = `${out.slice(0, keep)}${TRUNCATION_MARKER}`;
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * PowerShell + Add-Type bridge to nvdaControllerClient.dll.
 * Reuses the persistent PowerShell session owned by main.js.
 * Results are written to a temp file so we do not need PS stdout.
 */
function createNvdaControllerBridge({ isWin, ensurePowerShell, sendKeys }) {
  let dllPath = null;
  let loadState = "uninitialized"; // uninitialized | ready | unavailable
  let loadReason = null;
  let lastError = null;
  let typeLoaded = false;
  let queue = Promise.resolve();
  let lastSentText = "";
  let lastSentAt = 0;
  const resultPath = path.join(os.tmpdir(), "hka-nvda-controller-result.txt");

  function status() {
    return {
      platform: process.platform,
      isWin: Boolean(isWin),
      available: loadState === "ready",
      loadState,
      reason: loadReason,
      dllPath,
      lastError,
      expectedSha256: EXPECTED_SHA256,
      maxMessageChars: MAX_MESSAGE_CHARS,
      appPackaged: Boolean(app?.isPackaged),
    };
  }

  function ensureLoaded() {
    if (!isWin) {
      loadState = "unavailable";
      loadReason = "platform";
      return { ok: false, reason: "platform" };
    }

    if (loadState === "ready" && typeLoaded) {
      return { ok: true };
    }

    dllPath = resolveDllPath();
    if (!dllPath) {
      loadState = "unavailable";
      loadReason = "missing_dll";
      lastError = "nvdaControllerClient.dll not found";
      console.error("[nvda-braille]", lastError);
      return { ok: false, reason: "missing_dll" };
    }

    ensurePowerShell();

    // Escape for a C# verbatim string: @"path"
    const dllLiteral = dllPath.replace(/"/g, '""');
    const typeDef =
      "if (-not ('NvdaControllerClient' -as [type])) {\n" +
      "  Add-Type -TypeDefinition @'\n" +
      "using System;\n" +
      "using System.Runtime.InteropServices;\n" +
      "public static class NvdaControllerClient {\n" +
      `  [DllImport(@"${dllLiteral}", CharSet = CharSet.Unicode, CallingConvention = CallingConvention.StdCall)]\n` +
      "  public static extern int nvdaController_testIfRunning();\n" +
      `  [DllImport(@"${dllLiteral}", CharSet = CharSet.Unicode, CallingConvention = CallingConvention.StdCall)]\n` +
      "  public static extern int nvdaController_brailleMessage([MarshalAs(UnmanagedType.LPWStr)] string message);\n" +
      "}\n" +
      "'@\n" +
      "}\n";

    try {
      sendKeys(typeDef);
      typeLoaded = true;
      loadState = "ready";
      loadReason = null;
      console.log("[nvda-braille] Controller Client loaded from", dllPath);
      return { ok: true };
    } catch (err) {
      loadState = "unavailable";
      loadReason = "load_failed";
      lastError = String(err?.message || err);
      console.error("[nvda-braille] load failed:", lastError);
      return { ok: false, reason: "load_failed" };
    }
  }

  async function runReturningCode(expression) {
    ensurePowerShell();
    try {
      if (fs.existsSync(resultPath)) {
        fs.unlinkSync(resultPath);
      }
    } catch {
      // ignore
    }

    // Single-quoted PowerShell path; escape any single quotes.
    const psResultPath = resultPath.replace(/'/g, "''");
    const script =
      `$__hkaCode = ${expression};` +
      `Set-Content -LiteralPath '${psResultPath}' -Value $__hkaCode -Encoding ascii`;

    try {
      sendKeys(script);
    } catch (err) {
      return { ok: false, reason: "write_failed", code: -1, error: String(err) };
    }

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      try {
        if (fs.existsSync(resultPath)) {
          const body = fs.readFileSync(resultPath, "utf8").trim();
          const code = Number.parseInt(body, 10);
          if (Number.isNaN(code)) {
            return { ok: false, reason: "parse", code: -1, raw: body };
          }
          return {
            ok: code === 0,
            code,
            reason: code === 0 ? null : "nvda_error",
          };
        }
      } catch {
        // retry while PS writes the file
      }
      await sleep(20);
    }
    return { ok: false, reason: "timeout", code: -1 };
  }

  function enqueue(fn) {
    const run = queue.then(fn, fn);
    queue = run.catch(() => {});
    return run;
  }

  async function testIfRunning() {
    const loaded = ensureLoaded();
    if (!loaded.ok) return { ...loaded, running: false };

    const result = await enqueue(() =>
      runReturningCode("[NvdaControllerClient]::nvdaController_testIfRunning()")
    );
    return {
      ...result,
      running: Boolean(result.ok),
      available: loadState === "ready",
    };
  }

  async function brailleMessage(text, options = {}) {
    const loaded = ensureLoaded();
    if (!loaded.ok) {
      return { ok: false, reason: loaded.reason, sent: false };
    }

    const normalized = normalizeBrailleText(text);
    if (!normalized) {
      return { ok: false, reason: "empty", sent: false };
    }

    const force = Boolean(options.force);
    const now = Date.now();
    if (!force && normalized === lastSentText && now - lastSentAt < 40) {
      return { ok: true, reason: "deduped", sent: false, text: normalized };
    }

    // UTF-16LE base64 so PowerShell cannot mangle punctuation/quotes.
    const b64 = Buffer.from(normalized, "utf16le").toString("base64");
    const expression =
      "([NvdaControllerClient]::nvdaController_brailleMessage(" +
      "([Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('" +
      b64 +
      "'))))";

    const result = await enqueue(() => runReturningCode(expression));
    if (result.ok) {
      lastSentText = normalized;
      lastSentAt = Date.now();
      lastError = null;
    } else {
      lastError = result.reason || `code ${result.code}`;
      console.warn("[nvda-braille] brailleMessage failed:", result);
    }
    return { ...result, sent: Boolean(result.ok), text: normalized };
  }

  return {
    status,
    testIfRunning,
    brailleMessage,
    normalizeBrailleText,
    resolveDllPath,
    MAX_MESSAGE_CHARS,
    EXPECTED_SHA256,
  };
}

module.exports = {
  createNvdaControllerBridge,
  normalizeBrailleText,
  resolveDllPath,
  MAX_MESSAGE_CHARS,
  EXPECTED_SHA256,
};
