# HKA

Helen Keller Archive -- Electron + React kiosk app.

> **Note:** This is a demo/prototyping version. Installation and update processes described here are for testing purposes and will change for the final release.

## For Solid Light/WET: Installing the Windows App

1. Go to the [Releases page](https://github.com/clrrs/HKA/releases/latest)
2. Download the `.exe` file (e.g. `HKA-Kiosk-Setup-1.0.0.exe`)
3. Run the installer. It will install and launch the app
4. The app checks for updates on every launch. When a new version is available, it downloads silently and installs the next time the app is restarted.

No other setup required. Just run the installer once and restart the app to get future updates.

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

### Auto-Update Pipeline (For Development)

Pushing a version tag (e.g. `v1.0.3`) triggers a GitHub Actions workflow that builds the Windows exe and publishes it as a GitHub Release. The app uses `electron-updater` to check for new releases on launch. Pushes to `main` without a tag do **not** trigger a build.

**Required repo secret:** A `GH_TOKEN` secret with `repo` scope must be set in Settings > Secrets and variables > Actions.

**To release a new version:**

1. Bump `"version"` in `package.json` (e.g. `1.0.3`)
2. Commit and push to `main`
3. Tag the commit and push the tag:
   ```bash
   git tag v1.0.3
   git push origin v1.0.3
   ```
This keeps day-to-day pushes lightweight and only generates installers when you're ready for a release.
