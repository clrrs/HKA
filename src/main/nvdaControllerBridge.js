const fs = require("fs");
const path = require("path");
const koffi = (() => {
  try {
    return require("koffi");
  } catch {
    return null;
  }
})();

let nvdaClient = null;
let bridgeReady = false;

function toWideCString(text) {
  return Buffer.from(`${text}\0`, "utf16le");
}

function resolveNvdaDllPath() {
  const names = ["nvdaControllerClient.dll", "nvdaControllerClient64.dll"];
  const searchDirs = [
    process.cwd(),
    process.resourcesPath || "",
    "C:\\Program Files\\NVDA",
    "C:\\Program Files (x86)\\NVDA",
  ];

  const candidates = [
    ...searchDirs.flatMap((dir) => names.map((name) => path.join(dir, name))),
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return "nvdaControllerClient.dll";
}

function init() {
  if (bridgeReady) return true;

  if (!koffi) {
    console.warn("[NvdaBridge] koffi not available - running in mock mode");
    return false;
  }

  try {
    const dllPath = resolveNvdaDllPath();
    const lib = koffi.load(dllPath);
    nvdaClient = {
      nvdaController_speakText: lib.func("int nvdaController_speakText(const void *text)"),
      nvdaController_brailleMessage: lib.func("int nvdaController_brailleMessage(const void *message)"),
      nvdaController_cancelSpeech: lib.func("int nvdaController_cancelSpeech(void)"),
      nvdaController_testIfRunning: lib.func("int nvdaController_testIfRunning(void)"),
    };
    const rc = nvdaClient.nvdaController_testIfRunning();
    if (rc !== 0) {
      console.warn("[NvdaBridge] NVDA not running (rc=" + rc + ") — mock mode");
      nvdaClient = null;
      return false;
    }
    bridgeReady = true;
    console.log("[NvdaBridge] Connected to NVDA Controller Client via", dllPath);
    return true;
  } catch (err) {
    console.warn("[NvdaBridge] Failed to load NVDA controller client DLL:", err.message);
    nvdaClient = null;
    return false;
  }
}

function cancelSpeech(correlationId) {
  if (nvdaClient) {
    const rc = nvdaClient.nvdaController_cancelSpeech();
    console.log(`[NvdaBridge] cancelSpeech cid=${correlationId} rc=${rc}`);
    return rc;
  }
  console.log(`[NvdaBridge][mock] cancelSpeech cid=${correlationId}`);
  return 0;
}

function speakText(text, correlationId) {
  if (nvdaClient) {
    const rc = nvdaClient.nvdaController_speakText(toWideCString(text));
    console.log(`[NvdaBridge] speakText cid=${correlationId} rc=${rc} text="${text}"`);
    return rc;
  }
  console.log(`[NvdaBridge][mock] speakText cid=${correlationId} text="${text}"`);
  return 0;
}

function brailleMessage(text, correlationId) {
  if (nvdaClient) {
    const rc = nvdaClient.nvdaController_brailleMessage(toWideCString(text));
    console.log(`[NvdaBridge] brailleMessage cid=${correlationId} rc=${rc} text="${text}"`);
    return rc;
  }
  console.log(`[NvdaBridge][mock] brailleMessage cid=${correlationId} text="${text}"`);
  return 0;
}

function dispatch(payload) {
  const { text, brailleText, interrupt, correlationId } = payload;

  console.log(`[NvdaBridge] dispatch cid=${correlationId} interrupt=${interrupt} text="${text}"`);

  if (interrupt) {
    cancelSpeech(correlationId);
  }

  speakText(text, correlationId);
  brailleMessage(brailleText || text, correlationId);
}

module.exports = { init, dispatch, cancelSpeech, speakText, brailleMessage };
