const { app, BrowserWindow } = require("electron");
const path = require("path");
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

app.whenReady().then(() => {
  createWindow();

  // Auto-update from GitHub Releases (only works in packaged app)
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', () => {
      console.log('Update available, downloading...');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('App is up to date.');
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, installing...');
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
    });
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
