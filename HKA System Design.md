# HKA System Design

## Core ideas

- Single React app. Scenes are components shown/hidden by state.
- Scene manager controls `currentScene` and focuses the first focusable element on scene change.
- Global `state` (Context) stores theme, text size, brightness, subscene, zoom state.
- Carousel is a subscene, and zoom is a nested sub-subscene within carousel with its own controls.
- This system is designed for a custom, controlled kiosk use case with specific hardware
- Accessibility has been intentionally curated to meet project requirements, and available options are limited and streamlined. Interaction is intended to be performed using a keypad device, with all primary actions mapped to keys as detailed below.

## Project layout

```
kiosk-app/
├─ public/                  # static assets (images, fonts, videos)
├─ src/
│  ├─ main/                 # electron main + preload
│  │   ├─ main.js
│  │   └─ preload.js
│  ├─ renderer/
│  │   ├─ App.jsx
│  │   ├─ index.css
│  │   ├─ index.jsx
│  │   ├─ components/
│  │   │   ├─ SceneContainer.jsx
│  │   │   ├─ Scene.jsx
│  │   │   ├─ Carousel.jsx
│  │   │   ├─ ZoomControls.jsx
│  │   │   └─ AccessibilityMenu.jsx
│  │   └─ state/
│  │       ├─ StateProvider.jsx
│  │       └─ useSceneManager.js
├─ package.json
├─ vite.config.js
└─ electron-builder.yml (optional)

```

Use Vite for the renderer dev/build. Use electron for packaging.



# Keyboard / keypad mapping

All interaction in the final build is through a custom keypad. There is NO mouse navigation. The keypad sends mapped keystrokes which the app intercepts.

## Keypad Button → Keystroke → Function

| Keystroke | Function |
|-----------|----------|
| A | Settings – toggle popup overlay on/off |
| S | Home – navigate to theme selection (home scene) |
| Q | TTS – toggle NVDA speech on/off (via Electron IPC) |
| W | Volume Up – increase system volume (via Electron IPC) |
| I | Volume Down – decrease system volume (via Electron IPC) |
| K | Back – move to previous focusable element (Shift+Tab) |
| J | Select – activate focused element (Enter) |
| L | Next – move to next focusable element (Tab) |

## Implementation notes

- The global key handler lives in `useKeyboardNav()` (`src/renderer/state/useSceneManager.js`). It attaches a single `window` keydown listener that maps each keystroke to a logical action.
- Always call `preventDefault()` when intercepting to avoid OS shortcuts.
- Scenes that handle their own key events (HomeScene, StartScene) use React `onKeyDown` and call `stopPropagation()` when they fully handle the event, preventing the global handler from double-processing it.
- Keep navigation deterministic: every scene has a defined "primary" focusable element.
- Native features (TTS, volume) use Electron IPC: renderer → preload → main process → PowerShell child_process.

## Scene navigation flow (keypad-driven)

```
StartScene → HomeScene → QuoteScene → TravelScene → ArtifactScene
```

**StartScene**: Focus starts on the help (?) button. L (next) to reach the bubble, then L again to enter HomeScene.

**HomeScene**: L/K cycle through the four theme circles. J (select) on a theme navigates to QuoteScene with that theme's data.

**QuoteScene**: Displays the theme's quote full-screen. ANY keypress (or touch/click) dismisses it and navigates to TravelScene. The global keypad handler (`useKeyboardNav`) explicitly yields during QuoteScene -- it early-returns so that only QuoteScene's own dismiss listener processes input. A 250ms debounce prevents the J keypress that entered the scene from immediately dismissing it via key-repeat.

**TravelScene**: Shows the theme description and artifact list. L/K navigate the list. J selects an artifact to open ArtifactScene. The Back button (or S for Home) returns to HomeScene.

**ArtifactScene**: Shows artifact details with media (carousel or video). L/K navigate between the title, description, media, and prev/next artifact buttons. J activates the focused element. S returns to HomeScene.


# Auto-Update Pipeline (For Development)

Pushing a version tag (e.g. `v1.0.3`) triggers a GitHub Actions workflow that builds the Windows exe and publishes it as a GitHub Release. The app uses `electron-updater` to check for new releases on launch. Pushes to `main` without a tag do **not** trigger a build.

**To release a new version:**

1. Bump `"version"` in `package.json` (e.g. `1.0.3`)
2. Commit and push to `main`
3. Tag the commit and push the tag:
   ```bash
   git tag v1.0.3
   git push origin v1.0.3
   ```

# Kiosk deployment checklist

- Create a dedicated kiosk user account on the machine with auto-login.
- Set Electron app to launch on startup.
- Disable sleep and screensaver system-wide.
- Keep system hotkeys since active
- On macOS set `kiosk: true` and consider `fullscreen: true`.
- Test with keypad
- Ensure graceful recovery on crashes (auto restart via systemd or launchd).

# Persistence and state recovery

- Save `prefs` in `localStorage`
- Keep state small and serializable
