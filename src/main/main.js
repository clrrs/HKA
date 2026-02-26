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
