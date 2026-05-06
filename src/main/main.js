const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");

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
  if (ps && ps.exitCode === null) return;
  ps = spawn("powershell.exe", ["-NoProfile", "-NoLogo", "-NoExit"], {
    stdio: ["pipe", "ignore", "pipe"],
    windowsHide: true,
  });
  ps.stderr.on("data", (d) => console.error("PS stderr:", d.toString()));
  ps.on("exit", () => { ps = null; });
  ps.stdin.write(
    "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; " +
    "public class KbdEvent { [DllImport(\"user32.dll\")] " +
    "public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }'\n"
  );
}

function sendKeys(script) {
  ensurePowerShell();
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

// Absolute NVDA speech rate reset to "normal" (rate 50 on NVDA's 0-100 scale).
// NVDA synth settings ring: NVDA+Ctrl+Up/Down changes the VALUE of the current
// setting; Left/Right cycles which setting is selected. Rate is the default/first
// setting so we only need Up/Down here.
// Presses NVDA+Ctrl+Down 22 times (floors the rate regardless of current value,
// since max steps is ~20), then NVDA+Ctrl+Up 10 times to land at rate 50.
ipcMain.on("reset-speech-rate", () => {
  const down = "0x28"; // VK_DOWN
  const up = "0x26";   // VK_UP
  const press = (vk) =>
    "[KbdEvent]::keybd_event(0x2D,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x11,0,0,[UIntPtr]::Zero);" +
    `[KbdEvent]::keybd_event(${vk},0,0,[UIntPtr]::Zero);` +
    `[KbdEvent]::keybd_event(${vk},0,2,[UIntPtr]::Zero);` +
    "[KbdEvent]::keybd_event(0x11,0,2,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x2D,0,2,[UIntPtr]::Zero);" +
    "Start-Sleep -Milliseconds 40;";
  sendKeys(press(down).repeat(22) + press(up).repeat(10));
});

// Adjust NVDA speech rate via NVDA+Ctrl+Up (faster) / NVDA+Ctrl+Down (slower).
// NVDA+Ctrl+Left/Right cycles WHICH synth setting is selected — NOT the value.
// delta > 0 = speed up, delta < 0 = slow down; magnitude = number of steps.
ipcMain.on("speech-rate-change", (event, delta) => {
  if (!delta || delta === 0) return;
  const arrowVk = delta > 0 ? "0x26" : "0x28"; // Up or Down arrow
  const count = Math.abs(Math.round(delta));
  const onePress =
    "[KbdEvent]::keybd_event(0x2D,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x11,0,0,[UIntPtr]::Zero);" +
    `[KbdEvent]::keybd_event(${arrowVk},0,0,[UIntPtr]::Zero);` +
    `[KbdEvent]::keybd_event(${arrowVk},0,2,[UIntPtr]::Zero);` +
    "[KbdEvent]::keybd_event(0x11,0,2,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x2D,0,2,[UIntPtr]::Zero);" +
    "Start-Sleep -Milliseconds 50;";
  sendKeys(onePress.repeat(count));
});

// Stop current NVDA speech immediately (Ctrl)
ipcMain.on("stop-speech", () => {
  sendKeys(
    "[KbdEvent]::keybd_event(0x11,0,0,[UIntPtr]::Zero);" +
    "[KbdEvent]::keybd_event(0x11,0,2,[UIntPtr]::Zero)"
  );
});

app.whenReady().then(() => {
  ensurePowerShell();
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
