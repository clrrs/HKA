const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");

const IS_WIN = process.platform === "win32";

// Loaded once into the persistent PowerShell session (Windows kiosk only).
const KBD_EVENT_TYPE_DEF =
  "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; " +
  "public class KbdEvent { [DllImport(\"user32.dll\")] " +
  "public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'\n";

function volumeStepScriptPath() {
  // Packaged: extraResources places the .ps1 next to the app (outside asar).
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "volume-step.ps1");
  }
  return path.join(__dirname, "../../scripts/volume-step.ps1");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    // kiosk: true, // DISABLED FOR DEVELOPMENT - enable for production
    kiosk: false,
    fullscreen: true, // Set to true for production
    autoHideMenuBar: true,
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
  ps = spawn("powershell.exe", ["-NoProfile", "-NoLogo", "-NoExit"], {
    stdio: ["pipe", "ignore", "pipe"],
    windowsHide: true,
  });
  ps.stderr.on("data", (d) => console.error("PS stderr:", d.toString()));
  ps.on("exit", () => { ps = null; });
  ps.stdin.write(KBD_EVENT_TYPE_DEF);
}

function sendKeys(script) {
  if (!IS_WIN) return;
  ensurePowerShell();
  ps.stdin.write(script + "\n");
}

function sendVolumeKey(direction) {
  // July fallback: VK_VOLUME_UP (0xAF) / VK_VOLUME_DOWN (0xAE). Cuts NVDA briefly.
  const vk = direction === "Up" ? "0xAF" : "0xAE";
  sendKeys(
    `[KbdEvent]::keybd_event(${vk},0,0,[UIntPtr]::Zero);` +
    `[KbdEvent]::keybd_event(${vk},0,2,[UIntPtr]::Zero)`
  );
}

function adjustVolume(direction) {
  if (!IS_WIN) return Promise.resolve(null);
  const arg = direction === "Up" ? "up" : "down";
  const scriptPath = volumeStepScriptPath();
  return new Promise((resolve) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, arg],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
    );
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => console.error("volume-step:", d.toString()));
    child.on("error", (err) => {
      console.error("volume-step: spawn failed:", err.message);
      sendVolumeKey(direction);
      resolve(null);
    });
    child.on("exit", (code) => {
      if (code !== 0) {
        console.error(`volume-step: exited with code ${code}; falling back to VK_VOLUME`);
        sendVolumeKey(direction);
        resolve(null);
        return;
      }
      const pct = parseInt(String(out).trim(), 10);
      if (!Number.isFinite(pct)) {
        console.error("volume-step: no percent in stdout; falling back to VK_VOLUME");
        sendVolumeKey(direction);
        resolve(null);
        return;
      }
      resolve(pct);
    });
  });
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

// Volume Up/Down — Core Audio first (no NVDA cut); VK_VOLUME_* fallback if script fails
ipcMain.handle("volume-up", () => adjustVolume("Up"));
ipcMain.handle("volume-down", () => adjustVolume("Down"));
ipcMain.on("volume-up", () => {
  adjustVolume("Up");
});
ipcMain.on("volume-down", () => {
  adjustVolume("Down");
});

// Stop current NVDA speech immediately (Ctrl)
ipcMain.on("stop-speech", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0x11,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x11,0,2,[UIntPtr]::Zero)"
  );
});

app.whenReady().then(() => {
  if (IS_WIN) ensurePowerShell();
  createWindow();

  // Auto-update from GitHub Releases (only works in packaged app)
  if (app.isPackaged) {
    // Download updates silently, install on next app launch
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', () => {
      console.log('Update available, downloading in background...');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('App is up to date.');
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded. Will install on next restart.');
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
    });

    autoUpdater.checkForUpdates();
  }
});

app.on("window-all-closed", () => {
  if (ps) ps.kill();
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
