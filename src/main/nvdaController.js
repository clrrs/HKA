const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// NVDA Controller Client (NV Access, LGPL): lets the app send speech and braille
// to NVDA separately, and stop speech without injecting a keystroke.
// Windows only; every call returns false when the DLL or NVDA is unavailable so
// callers can fall back to live regions / the Ctrl hush.

const IS_WIN = process.platform === "win32";
const DLL_NAME = "nvdaControllerClient.dll";

let api = null;
let loadAttempted = false;

function dllPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "nvda", DLL_NAME)
    : path.join(__dirname, "../../resources/nvda", DLL_NAME);
}

function load() {
  if (loadAttempted) return api;
  loadAttempted = true;
  if (!IS_WIN) return null;

  const file = dllPath();
  if (!fs.existsSync(file)) {
    console.log("NVDA controller client not found:", file);
    return null;
  }

  try {
    const koffi = require("koffi");
    const lib = koffi.load(file);
    api = {
      testIfRunning: lib.func("unsigned long __stdcall nvdaController_testIfRunning()"),
      speakText: lib.func("unsigned long __stdcall nvdaController_speakText(str16 text)"),
      brailleMessage: lib.func(
        "unsigned long __stdcall nvdaController_brailleMessage(str16 message)"
      ),
      cancelSpeech: lib.func("unsigned long __stdcall nvdaController_cancelSpeech()"),
    };
  } catch (err) {
    console.error("NVDA controller client failed to load:", err);
    api = null;
  }
  return api;
}

function call(fnName, ...args) {
  const a = load();
  if (!a) return false;
  try {
    return a[fnName](...args) === 0;
  } catch (err) {
    console.error(`NVDA controller ${fnName} failed:`, err);
    return false;
  }
}

function isAvailable() {
  return call("testIfRunning");
}

function speak(text) {
  if (!text) return false;
  return call("speakText", String(text));
}

function braille(text) {
  if (!text) return false;
  return call("brailleMessage", String(text));
}

function cancel() {
  return call("cancelSpeech");
}

module.exports = { isAvailable, speak, braille, cancel };
