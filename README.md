# HKA

Helen Keller Archive

> **Note:** This is a demo/prototyping version. Installation and update processes described here are for testing purposes and will change for the final release.

## For Solid Light/WET: Installing the Windows App

1. Go to the [Releases page](https://github.com/clrrs/HKA/releases/latest)
2. Download the `.exe` file (e.g. `HKA-Kiosk-Setup-1.0.0.exe`)
3. Run the installer. It will install and launch the app

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

