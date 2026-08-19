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

// Core Audio API — adjusts master volume without VK_VOLUME_* keys (those interrupt NVDA).
const AUDIO_VOLUME_TYPE_DEF = `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace HkaAudio {
  [ComImport]
  [Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
  public class MMDeviceEnumerator { }

  public enum EDataFlow { eRender, eCapture, eAll, EDataFlow_enum_count }
  public enum ERole { eConsole, eMultimedia, eCommunications, ERole_enum_count }

  [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IMMDeviceEnumerator {
    int EnumAudioEndpoints(EDataFlow dataFlow, uint dwStateMask, out IntPtr ppDevices);
    int GetDefaultAudioEndpoint(EDataFlow dataFlow, ERole role, out IMMDevice ppDevice);
  }

  [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IMMDevice {
    int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    int OpenPropertyStore(int stgmAccess, out IntPtr ppProperties);
    int GetId(out IntPtr ppstrId);
    int GetState(out uint pdwState);
    int RegisterPropertyChangeNotificationEvent(IntPtr hEvent, out IntPtr pdwReserved);
    int UnregisterPropertyChangeNotificationEvent(IntPtr hEvent);
  }

  [Guid("5CDF2C82-841E-4CB6-8862-9C077755D7A7"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IAudioEndpointVolume {
    int RegisterControlChangeNotify(IntPtr pNotify);
    int UnregisterControlChangeNotify(IntPtr pNotify);
    int GetChannelCount(out uint pnChannelCount);
    int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
    int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
    int GetMasterVolumeLevel(out float pfLevelDB);
    int GetMasterVolumeLevelScalar(out float pfLevel);
  }

  public static class Volume {
    const float Step = 0.05f;

    static IAudioEndpointVolume GetEndpointVolume() {
      var enumerator = (IMMDeviceEnumerator)new MMDeviceEnumerator();
      IMMDevice device;
      Marshal.ThrowExceptionForHR(
        enumerator.GetDefaultAudioEndpoint(EDataFlow.eRender, ERole.eMultimedia, out device)
      );
      Guid iid = typeof(IAudioEndpointVolume).GUID;
      object obj;
      Marshal.ThrowExceptionForHR(device.Activate(ref iid, 1, IntPtr.Zero, out obj));
      return (IAudioEndpointVolume)obj;
    }

    public static void Up() {
      var vol = GetEndpointVolume();
      float level;
      Marshal.ThrowExceptionForHR(vol.GetMasterVolumeLevelScalar(out level));
      Guid ctx = Guid.Empty;
      Marshal.ThrowExceptionForHR(
        vol.SetMasterVolumeLevelScalar(Math.Min(1f, level + Step), ref ctx)
      );
    }

    public static void Down() {
      var vol = GetEndpointVolume();
      float level;
      Marshal.ThrowExceptionForHR(vol.GetMasterVolumeLevelScalar(out level));
      Guid ctx = Guid.Empty;
      Marshal.ThrowExceptionForHR(
        vol.SetMasterVolumeLevelScalar(Math.Max(0f, level - Step), ref ctx)
      );
    }
  }
}
'@
`;

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
  ps.stdin.write(AUDIO_VOLUME_TYPE_DEF);
}

function sendKeys(script) {
  if (!IS_WIN) return;
  ensurePowerShell();
  ps.stdin.write(script + "\n");
}

function adjustVolume(direction) {
  if (!IS_WIN) return;
  sendKeys(`[HkaAudio.Volume]::${direction}()`);
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

// Volume Up/Down — Core Audio scalar step (no VK_VOLUME_*; those cut NVDA speech)
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
