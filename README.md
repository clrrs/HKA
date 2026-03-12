# HKA

Helen Keller Archive

> **Note:** This is a demo/prototyping version. Installation and update processes described here are for testing purposes and will change for the final release.

## For Solid Light/WET: Installing the Windows App

1. Go to the [Releases page](https://github.com/clrrs/HKA/releases/latest)
2. Download the `.exe` file (e.g. `HKA-Kiosk-Setup-1.0.0.exe`)
3. Run the installer. It will install and launch the app

### NVDA (Screen Reader)

[NVDA](https://www.nvaccess.org/download/) must be installed and running **before** the app launches. The app uses `role="application"` to put NVDA into focus mode, which only works if NVDA is already active at page load.

Speech mode (Q): Press **Q** to toggle NVDA speech on or off. When speech is off, the app hides the gold focus outline and on artifact pages keyboard navigation (L/K) moves only between buttons and media controls (title and description stay in the DOM for screen-reader order when speech is on).

For kiosk deployment, configure NVDA to start automatically:
NVDA menu > Preferences > Settings > General > **"Start NVDA after I sign in"**

1. Download the pre-configured NVDA settings file: [nvda.ini](nvda.ini)
2. Copy this onto your clipboard: %APPDATA%\nvda
3. Paste it into file explorer or the search bar.
4. Make sure NVDA is not running.
5. Replace the nvda.ini with the downloaded one.
6. Open NVDA

---

## To Note

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

