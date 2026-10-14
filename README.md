# HKA

Helen Keller Archive

## Setting up a fresh kiosk PC

The kiosk runs a **portable** copy of NVDA (the screen reader). It's a self-contained folder that is already set up for HKA: voice, settings and speech dictionary are all inside it, so nothing needs to be configured by hand.

### Install the portable NVDA copy

1. Download [NVDA-Portable.zip](NVDA-Portable.zip) from this repo.
2. In File Explorer, right-click the downloaded zip → **Properties**. If there is an **Unblock** checkbox at the bottom, tick it and click **OK**. (Otherwise Windows may block NVDA from running.)
3. Right-click the zip → **Extract All**, and extract it to `C:\NVDA-Portable`. Don't leave it in Downloads or on a OneDrive-synced Desktop.
4. Open `C:\NVDA-Portable` and double-click `nvda.exe`. If Windows shows “Windows protected your PC”, click **More info** → **Run anyway**.
5. NVDA should start talking. Its icon appears in the system tray (bottom right, near the clock).

### Start NVDA automatically with Windows

NVDA must already be running **before** the HKA app opens. A portable copy can’t use NVDA’s own “start after sign-in” setting, so add it to the Windows Startup folder:

1. Press **Windows+R**, type `shell:startup`, and press **Enter**. A folder opens.
2. In another File Explorer window, open `C:\NVDA-Portable`, right-click `nvda.exe` → **Show more options** → **Create shortcut**.
3. Move the new shortcut into the Startup folder.
4. Restart the PC and check that NVDA is speaking once Windows has signed in.

Note: a portable copy doesn’t speak on the Windows sign-in screen or on admin (UAC) prompts. That’s expected.

### Run the app

The app is a single `.exe` that runs without installing anything.

1. Download `HKA-Kiosk-<version>.exe` from the [Releases page](https://github.com/clrrs/HKA/releases/latest).
2. Move it somewhere permanent, for example `C:\HKA\`. Don't leave it in Downloads.
3. Make sure NVDA is running (system tray icon), then double-click the exe. If Windows shows “Windows protected your PC”, click **More info** → **Run anyway**.
4. If the app was opened before NVDA, quit it with **Esc** and open it again.

The app does **not** update itself. To update, quit the app, replace the old exe with the new one, and open it again.

**Quick check:** walk Attract → Instructions → Home → Quote → Theme → Artifact and move through a few controls. You should hear labels without trailing role words (no “… button”, “section”, “doc”).

## Using the app

### Keypad keys

| Key | Function |
|-----|----------|
| **A** | Settings: open/close the Settings menu (text size, contrast, brightness, screen reader on/off) |
| **S** | Home: back to theme selection |
| **L** / **K** | Next / Back: move focus forward / backward |
| **J** | Select: activate the focused item |
| **Shift** | Play / Pause: media and auto-read |
| **W** / **I** | Volume up / down |
| **Esc** | Quit the app (maintenance only, not on the keypad) |

Screen reader speech is turned on and off from the Settings menu (**A** → Screen Reader).

### “6” keystroke (attract audio signal)

The app sends a **6** keystroke (Windows virtual key `0x36`) every time the attract loop **starts** and every time a visitor **exits** it. The station’s ESP32 listens for it and raises a Q-SYS GPIO trigger that fades the BrightSign attract audio.

- “6” is an **outgoing signal only**. It is not a keypad key, and the app swallows it so it never triggers anything inside the app.
- Nothing needs to be configured on the PC. It goes out through the same Windows keyboard-event path the app uses for volume and NVDA control, so it only fires on Windows.

### Testing shortcuts

For testing only; these are not on the keypad. Their state lives in memory and resets when the app reloads.

| Key | Function |
|-----|----------|
| **1** | Jump to the instructional video |
| **2** | Jump to Home (theme selection) |
| **3** | Jump to the Adventure quote |
| **0** | Turn the idle-timeout timer off / on (an “Idle timer off” badge shows while it’s off) |
| **9** | Run auto-read 6× faster (an “Auto-read 6x” badge shows while it’s on) |

### NVDA (Screen Reader)

The app uses `role="application"` to put NVDA into focus mode, which only works if NVDA is already active when the app loads.

When the Screen Reader setting is *off*, the app mutes NVDA speech (by toggling NVDA’s speech mode with Insert+S), hides the gold focus outline, and on artifact pages the keypad navigation (L/K) moves *only* between buttons and media controls. This different focus/nav behavior for speech on vs speech off is controlled by the app, not NVDA. Speech always stays on while the Settings menu is open.

---

## Cloning the Repo *for development, not for kiosk install*

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19 or higher, required by Vite 7)
- npm (included with Node.js)

### Setup

```bash
git clone https://github.com/clrrs/HKA.git
cd HKA
npm install
```

### Development

```bash
# Vite dev server only (browser)
npm run dev

# Full Electron app with hot reload
npm run electron:dev
```

### Building

```bash
# Build for production
npm run build

# Package the Windows exe locally (written to release/)
npm run build:win
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run electron:dev` | Start Electron with hot reload |
| `npm run build` | Build for production |
| `npm run build:win` | Build the Windows portable exe (`release/HKA-Kiosk-<version>.exe`) |
| `npm run publish` | Build the portable exe and upload it to a GitHub Release (used by CI) |
| `npm run export:sr` | Regenerate `docs/screen-reader-announcements.csv` from source (overwrites hand-written descriptions) |

See [HKA System Design.md](HKA%20System%20Design.md) for architecture, the full key map, and the release process.
