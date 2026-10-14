# HKA System Design

## Core ideas

- Single React app. Scenes are components shown/hidden by state.
- Scene manager controls `scene` and focuses the first focusable element (or the element marked `data-autofocus`) on scene change.
- Global `state` (Context, `StateProvider.jsx`) stores scene, theme, artifact, display prefs (text size, contrast, brightness), speech mode, pause state, Settings visibility, and test-shortcut flags.
- Selecting an artifact opens a popup (`ArtifactPopup.jsx`) on top of ThemeScene rather than navigating to a separate scene; zoom and transcript are nested layers within that popup with their own controls.
- Settings is an overlay (`AccessibilityMenu.jsx`) on top of whatever scene is active. The scenes underneath are made `inert` while it's open.
- Prefs always start from defaults and are never persisted, so the next visitor never inherits the previous visitor's settings.
- This system is designed for a custom, controlled kiosk use case with specific hardware.
- Accessibility has been intentionally curated to meet project requirements, and available options are limited and streamlined. Interaction is intended to be performed using a keypad device, with all primary actions mapped to keys as detailed below.

## Project layout

```
HKA/
├─ public/                     # static assets (images, fonts, videos, quote VOs, sfx)
├─ src/
│  ├─ main/                    # Electron main + preload
│  │   ├─ main.js              # window, IPC → PowerShell keystrokes
│  │   └─ preload.js           # kioskApi bridge (allow-listed IPC channels)
│  └─ renderer/
│      ├─ App.jsx              # scaling, idle timer, Settings overlay, focus park, HUDs
│      ├─ index.jsx            # React root; swallows the outgoing "6" signal
│      ├─ index.css
│      ├─ audio/               # earcons, headphone/speaker routing, NVDA speech control
│      ├─ components/
│      │   ├─ SceneContainer.jsx
│      │   ├─ Scene.jsx
│      │   ├─ ArtifactPopup.jsx
│      │   ├─ AccessibilityMenu.jsx
│      │   ├─ VideoPlayer.jsx
│      │   ├─ ZoomControls.jsx
│      │   └─ scenes/          # Attract, Instruction, Home, Quote, Theme
│      ├─ data/                # artifacts, quote screens, settings options
│      ├─ state/               # StateProvider, AnnouncerProvider, useSceneManager, interactionLog
│      └─ utils/               # settings focus, silent name, speech timing
├─ scripts/                    # content sync, SR announcement export, NVDA dictionary builder
├─ docs/                       # screen-reader-announcements.csv
├─ backup-nvda.ini             # backup of the NVDA settings (the live one ships in the portable copy)
├─ backup-dictionary.dic       # backup of the NVDA speech dictionary (the live one ships in the portable copy)
├─ package.json                # includes electron-builder config
└─ vite.config.js
```

Use Vite for the renderer dev/build. Use electron-builder for packaging.


# Keyboard / keypad mapping

All interaction in the final build is through a custom keypad. There is NO mouse navigation. The keypad sends mapped keystrokes which the app intercepts. A pointer shield blocks stray hover/clicks until the mouse is actually moved.

## Keypad Button → Keystroke → Function

| Keystroke | Function |
|-----------|----------|
| A | Settings: toggle the Settings overlay on/off |
| S | Home: navigate to theme selection (home scene) |
| Shift | Play / Pause: NVDA handles speech natively; app syncs auto-read timers and video |
| W | Volume Up: increase system volume (via Electron IPC) |
| I | Volume Down: decrease system volume (via Electron IPC) |
| K | Back: move to previous focusable element (Shift+Tab) |
| J | Select: activate focused element (Enter) |
| L | Next: move to next focusable element (Tab) |

Screen reader on/off is a Settings option, not a key.

## Keystrokes the app sends (Windows only)

The main process keeps one hidden PowerShell session open and sends keystrokes with `keybd_event`. Renderer → `window.kioskApi.send(channel)` → preload allow-list → `ipcMain` → PowerShell.

| IPC channel | Keystroke sent | Purpose |
|-------------|----------------|---------|
| `volume-up` / `volume-down` | VK_VOLUME_UP / VK_VOLUME_DOWN | System volume |
| `toggle-tts` | Insert+S, twice | Flip NVDA speech mode between Talk and Off (twice skips "beeps" mode) |
| `stop-speech` | Ctrl | Cut current NVDA speech (e.g. when media starts) |
| `attract-signal` | **6** (VK `0x36`) | Attract enter/exit signal, see below |

### "6": attract enter/exit signal

`AttractScene` sends `attract-signal` once when attract becomes active and once when the visitor leaves it (a ref guards against StrictMode's double effect run). The station's ESP32 receives the "6" and raises a Q-SYS GPIO trigger to fade the BrightSign attract audio.

Because the keystroke is synthesized on the same machine, the app also receives it. `index.jsx` registers a capture listener at module load that swallows `6` on keydown/keypress/keyup before any app handler sees it, and the attract/instruction "any key" handlers never react to it. "6" is never a keypad input.

The app ignores Ctrl in the attract and instruction "any key" handlers for the same reason (it's the app's own stop-speech keystroke).

## Test shortcuts

Not on the keypad; for testing on site. State is in memory only.

| Key | Function | Where |
|-----|----------|-------|
| 1 / 2 / 3 | Jump to instruction / home / Adventure quote | `useKeyboardNav` (`ENABLE_TEST_SHORTCUTS`) |
| 0 | Toggle the idle-timeout timer (badge: "Idle timer off") | module-level capture listener in `StateProvider.jsx` |
| 9 | Toggle 6× auto-read speed (badge: "Auto-read 6x") | module-level capture listener in `StateProvider.jsx` |
| Esc | Quit the app | `main.js` `before-input-event` |

0 and 9 are registered at module load so they run ahead of every scene-level capture handler (attract, instruction, theme tip, idle warning all swallow unrecognized keys).

## Implementation notes

- The global key handler lives in `useKeyboardNav()` (`src/renderer/state/useSceneManager.js`). It attaches a single `window` keydown listener that maps each keystroke to a logical action.
- Ignore key repeat: at the start of every keypad key handler, `if (e.repeat) return;` so holding a key does not retrigger (keydown fires repeatedly while held; `e.repeat` is true for those).
- Always call `preventDefault()` when intercepting to avoid OS shortcuts.
- Scenes that handle their own key events use capture listeners or React `onKeyDown` and call `stopPropagation()` when they fully handle the event, preventing the global handler from double-processing it.
- The global handler yields entirely during Attract and Quote; those scenes handle their own input.
- S is ignored for 500 ms after a `toggle-tts` so NVDA's synthesized Insert+S never sends the visitor Home.
- While Settings is open, L/K move within the panel only (`moveSettingsFocus`).
- On Home and Theme, and inside the artifact popup and transcript, L/K do not wrap around.
- Keep navigation deterministic: every scene has a defined "primary" focusable element.
- W / I are handled in a module-level capture listener in `StateProvider.jsx` and play a volume earcon without moving focus.

## Scene navigation flow (keypad-driven)

```
AttractScene → InstructionScene → (Settings onboarding) → HomeScene → QuoteScene → ThemeScene (artifact popup opens on top)
```

**AttractScene**: Looping attract video, routed to both headphones and speakers. Any key (except Ctrl) or a click advances to InstructionScene. Sends the "6" signal on enter and exit.

**InstructionScene**: Instructional video with a Skip button. On the first pass of a session, finishing or skipping opens Settings in onboarding mode over the video, then swaps Home in underneath; closing Settings reveals Home. After the video ends, any key advances, and it auto-continues after a short buffer.

**HomeScene**: L/K move through the four theme circles. J on a theme navigates to QuoteScene with that theme's data. Pressing S while already on Home re-announces "Home."

**QuoteScene**: Full-screen theme quote with its voice-over. Focus parks on a silent element; braille and speech come from one live announcement. Any keypress (or touch/click) dismisses it and navigates to ThemeScene. The global keypad handler explicitly yields during QuoteScene.

**ThemeScene**: Shows the theme description and artifact list. On first entry in a session, a theme tip overlay shows first. L/K navigate the list. J opens the artifact popup (`ArtifactPopup.jsx`) on top of the scene, with the bubble list still visible (dimmed) behind it and kept in sync with the open artifact. S returns to HomeScene.

**ArtifactPopup**: Shows artifact details with media (image/document or video) inside a popup card. L/K navigate between the prev-artifact arrow, title/description (guided description appears in that panel after the description timeout; Next Image shows that image's guided text), transcript, next-image button, zoom/play button, and next-artifact arrow, with no wraparound at either end. J activates the focused element; selecting the boundary prev/next arrow when there's no adjacent artifact closes the popup instead. With speech on, auto-read reads the artifact on timers. S returns to HomeScene.

## Settings

Opened with A from any scene except Attract and Quote, or automatically in onboarding mode after the instructional video. Options: Text Size, Contrast (dark/light), Brightness, Screen Reader (on/off), plus Reset to Defaults and Close (Skip during onboarding).

- NVDA speech stays on for the whole time Settings is open, even if Screen Reader is set to Off; muting is applied on close.
- No dialog/document roles: NVDA would speak and braille every container role. Modality comes from `inert` on `.app-scenes` plus a Tab trap.
- "Settings closed." is spoken as the name of `.app-scenes` when focus re-enters it, so it always lands before the restored control.

## Idle timeout

`App.jsx` runs the inactivity timer: 200 s by default, 400 s when focus is on a long read with speech on. A "Still there?" warning and a 10-step countdown precede the reset. The timer is suspended during Attract, Instruction, video overlays, and auto-read. On timeout, `resetToStart()` returns to Attract with default prefs and speech on.

## Screen reader / braille notes

- NVDA (portable copy, started from the Windows Startup folder) must be running before the app launches. `role="application"` keeps NVDA in focus mode.
- Named `role="application"` elements are silent in NVDA speech and braille, so the app uses them (with `SILENT_NAME`, U+2800) for focus parks and announcement carriers to avoid "section", "doc", "dialog", etc.
- A focus park in `App.jsx` catches focus every frame before it can fall to `<body>` (which NVDA brailles as "doc").
- The live speech dictionary ships inside the portable NVDA copy at `userConfig\speechDicts\default.dic`. It holds pronunciation fixes and strips remaining role words, and it is voice-agnostic (NVDA's default dictionary, not a per-voice one). Kiosks get it (and the settings file `userConfig\nvda.ini`) already in place; see README for install.
- `backup-nvda.ini` in the repo is only a backup of the NVDA settings (Acapela voice, role/formatting reporting turned off). To use it, copy it to `userConfig\` in the portable copy and rename it to `nvda.ini`. When the settings on a kiosk change, copy them back over `backup-nvda.ini`.
- `backup-dictionary.dic` in the repo is only a backup of the dictionary file. To use it, copy it to `userConfig\speechDicts\` in the portable copy and rename it to `default.dic`. When the dictionary on a kiosk changes, copy it back over `backup-dictionary.dic` so the backup stays current (keep it tab-separated, UTF-8 with BOM).
- `docs/screen-reader-announcements.csv` lists every spoken string. `npm run export:sr` regenerates it from source but replaces the hand-written scenario descriptions.
- Debug helpers on `window`: `__HKA_EXPORT_DEBUG_LOGS__()` exports the announcement, input, and focus trace; `__HKA_CLEAR_DEBUG_LOGS__()` clears them.

## Audio routing

`AudioRoutingProvider` enumerates audio outputs and picks headphone and speaker endpoints (stored picks win when still present). Attract plays to both; all other media and earcons go to headphones only.


# Build and Release Pipeline

The app ships as a single **portable** Windows exe (electron-builder `portable` target, `HKA-Kiosk-<version>.exe`). Nothing is installed: the exe unpacks itself to a temp folder on each launch, so start-up takes a few seconds longer than an installed app.

There is **no auto-update**. Kiosks only change when someone replaces the exe by hand: quit the app, swap in the new exe, reopen it.

Pushing a version tag (e.g. `v1.0.3`) triggers a GitHub Actions workflow that builds the exe on Windows and uploads it to a GitHub Release. Pushes to `main` without a tag do **not** trigger a build. The workflow can also be run manually (workflow_dispatch) with a version number. To build locally instead, run `npm run build:win`; the exe lands in `release/`.

**To release a new version:**

1. Bump `"version"` in `package.json` (e.g. `1.0.3`)
2. Commit and push to `main`
3. Tag the commit and push the tag:
   ```bash
   git tag v1.0.3
   git push origin v1.0.3
   ```
