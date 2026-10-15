const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const IS_WIN = process.platform === "win32";

// Loaded once into the persistent PowerShell session (Windows kiosk only).
const KBD_EVENT_TYPE_DEF =
  "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; " +
  "public class KbdEvent { [DllImport(\"user32.dll\")] " +
  "public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'\n";

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    // kiosk: true, // DISABLED FOR DEVELOPMENT - enable for production
    kiosk: false,
    fullscreen: true, // Set to true for production
    autoHideMenuBar: true,
    // Avoid a white flash while the portable exe's page loads.
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // ESC to quit (scoped to window, no OS-level shortcut hijacking)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      app.quit();
    }
  });

  // Development: load from Vite dev server
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // Production: load built files
    const indexPath = path.join(__dirname, "../../dist/renderer/index.html");
    console.log("Loading production file:", indexPath);
    win.loadFile(indexPath);
  }
}

let ps = null;

function ensurePowerShell() {
  if (!IS_WIN) return;
  if (ps && ps.exitCode === null) return;
  const child = spawn("powershell.exe", ["-NoProfile", "-NoLogo", "-NoExit"], {
    stdio: ["pipe", "ignore", "pipe"],
    windowsHide: true,
  });
  ps = child;
  child.stderr.on("data", (d) => console.error("PS stderr:", d.toString()));
  // Unhandled, a spawn failure or a write after PowerShell dies throws in the
  // main process and shows an error dialog over the kiosk.
  child.on("error", (err) => {
    console.error("PowerShell error:", err);
    if (ps === child) ps = null;
  });
  child.stdin.on("error", (err) => console.error("PowerShell stdin error:", err));
  child.on("exit", () => { if (ps === child) ps = null; });
  child.stdin.write(KBD_EVENT_TYPE_DEF);
}

function sendKeys(script) {
  if (!IS_WIN) return;
  ensurePowerShell();
  if (!ps) return;
  ps.stdin.write(script + "\n");
}

// Toggle NVDA speech (Insert+S x2 to skip "beeps" mode: talk → off or off → talk)
ipcMain.on("toggle-tts", () => {
  const press =
    "[KbdEvent]::keybd_event(0x2D,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x53,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x53,0,2,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x2D,0,2,[UIntPtr]::Zero);";
  sendKeys(press + "Start-Sleep -Milliseconds 100;" + press);
});

// Volume Up (VK_VOLUME_UP = 0xAF)
ipcMain.on("volume-up", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0xAF,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0xAF,0,2,[UIntPtr]::Zero)"
  );
});

// Volume Down (VK_VOLUME_DOWN = 0xAE)
ipcMain.on("volume-down", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0xAE,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0xAE,0,2,[UIntPtr]::Zero)"
  );
});

// Stop current NVDA speech immediately (Ctrl)
ipcMain.on("stop-speech", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0x11,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x11,0,2,[UIntPtr]::Zero)"
  );
});

// Attract enter/exit signal ("6", VK 0x36) for the station's ESP32 → Q-SYS GPIO
ipcMain.on("attract-signal", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0x36,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x36,0,2,[UIntPtr]::Zero)"
  );
});

// The portable exe takes a while to unpack, so a second double-click is easy.
// A second copy would double every keystroke, sound and "6" signal.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    if (IS_WIN) ensurePowerShell();
    createWindow();
  });
}

app.on("window-all-closed", () => {
  if (ps) ps.kill();
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
