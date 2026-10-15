# HKA

Helen Keller Archive

## Setting up a fresh kiosk PC

The kiosk uses NVDA (the screen reader) with the Acapela **Sharon** voice. You install NVDA and Acapela yourself, then copy two HKA files into NVDA's settings folder: the settings file and the speech dictionary. You'll get the Acapela activation key separately.

### 1. Install NVDA 2026.1.1

Use this exact version, not the latest one.

1. Download [nvda_2026.1.1.exe](https://www.nvaccess.org/files/nvda/releases/2026.1.1/nvda_2026.1.1.exe) from NV Access.
2. Run it, accept the license, and choose **Install NVDA on this computer**.
3. Leave **Start NVDA after I sign in** ticked. NVDA must already be running **before** the HKA app opens, and this makes sure it is.
4. When the install finishes, NVDA starts talking and its icon appears in the system tray (bottom right, near the clock).

### 2. Install the Acapela voices

The Acapela license has to be activated on every kiosk PC, even if you're setting it up from an existing portable copy of NVDA instead of following step 1.

1. Go to the [Acapela TTS for NVDA download page (v1.9.5)](https://www.acapela-nvda.com/get-your-download-here-v1-9-5/) and download two files:
   - **Engines**: `Acapela TTS Voices for NVDA - Engines-1.9.5.nvda-addon` (required)
   - **Colibri voices**: `Acapela TTS Voices for NVDA - CO voices-1.9.5.nvda-addon`

   Do **not** download the separate "HQ voice - Sharon" file. HKA uses the **Colibri** Sharon voice, which comes in the Colibri bundle.
2. Double-click the Engines file and confirm the install. Then do the same for the Colibri voices file. Restart NVDA when it asks.
3. Activate Acapela with the activation key you were sent. The PC needs internet access for this step. Until it's activated, Acapela runs as a 15-day trial.
   1. Open the NVDA menu: press **Insert+N**, or right-click the NVDA icon in the system tray.
   2. Go to **Acapela**. In its submenu, choose the option to activate a license.
   3. Type in the activation key and confirm.

### 3. Copy in the HKA settings and dictionary

1. Download both files from this repo. On each page, click the **Download raw file** button (top right of the file view):
   - [backup-nvda.ini](backup-nvda.ini) (NVDA settings)
   - [backup-dictionary.dic](backup-dictionary.dic) (speech dictionary)
2. Quit NVDA: press **Insert+Q** and choose **Exit**. NVDA must be closed, or it will overwrite the settings file when it exits.
3. Press **Windows+R**, type `%APPDATA%\nvda`, and press **Enter**. NVDA's settings folder opens.
4. Copy `backup-nvda.ini` into that folder and rename it to `nvda.ini`, replacing the existing file.
5. Open the `speechDicts` folder inside it, copy `backup-dictionary.dic` there, and rename it to `default.dic`. Create the `speechDicts` folder if it isn't there.
6. If Windows hides file extensions, make sure the files didn't end up as `nvda.ini.txt` or `default.dic.txt` (File Explorer → **View** → **Show** → **File name extensions**).
7. Start NVDA again with **Ctrl+Alt+N**.
8. Check the voice: press **Insert+N** → **Preferences** → **Settings** → **Speech**. The synthesizer should be Acapela and the voice should be Sharon (Colibri, "Sharon22k_CO"), not the HQ Sharon.
9. Restart the PC and check that NVDA is speaking with the Sharon voice once Windows has signed in.

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
