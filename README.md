# HKA

Helen Keller Archive

> **Note:** This is a demo/prototyping version. Installation and update processes described here are for testing purposes and will change for the final release.

## For Solid Light/WET: Installing the Electron App

1. Go to the [Releases page](https://github.com/clrrs/HKA/releases/latest)
2. Download the `.exe` file (e.g. `HKA-Kiosk-Setup-1.0.0.exe`)
3. Run the installer. It will install and launch the app
4. (Optional, since you will have to repeat this step for every release) To pin the Electron app to the taskbar, hit Windows+Tab to minimize, then right click on the Electron icon in the taskbar. Click "Pin to Taskbar"

*BTW I added keyboard shortcuts for testing. Use 1,2,3 to skip to different pages quickly.*

### NVDA (Screen Reader)

[NVDA](https://www.nvaccess.org/download/) must be installed and running **before** the app launches. The app uses `role="application"` to put NVDA into focus mode, which only works if NVDA is already active at page load.

Once NVDA is running in the Electron app, you can toggle speech mode. TTS button (Q): Press **Q** to toggle NVDA speech on or off. When speech is *off,* the app hides the gold focus outline, and on artifact pages the keypad navigation (L/K) moves *only* between buttons and media controls (title and description stay in the DOM for screen-reader order when speech is on). This different focus/nav behavior for speech on vs speech off is controlled by the app, not NVDA.

1. Download the pre-configured NVDA settings file: [nvda.ini](nvda.ini)
2. Copy this onto your clipboard: %APPDATA%\nvda
3. Paste it into file explorer or the search bar.
4. Make sure NVDA is not running.
5. Replace the nvda.ini with the downloaded one.
6. Open NVDA

---

## Cloning the Repo *for development, not for demo install*

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
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

# Package Windows exe locally
npm run build:win
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run electron:dev` | Start Electron with hot reload |
| `npm run build` | Build for production |
| `npm run build:win` | Build Windows installer |
| `npm run publish` | Build + publish to GitHub Releases |

