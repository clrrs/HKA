# HKA System Design

**Action Plan:**

1. Look at current HTML based build for content, organization, and style. The way its designed takes precedent over the following examples for zoom and carousel, but needs to be reformatted to work within the new framework.
2. DO NOT SET KIOSK MODE TO TRUE in Electron since we are developing
3. Scaffold React + Vite + Electron minimal app.
4. Implement `StateProvider` and global prefs.
5. Implement `Scene` component and `useSceneFocus`.
6. Implement keyboard/keypad handler.
7. Add Accessibility menu UI storing prefs.
8. Package in Electron and enable kiosk mode.
9. Test on target hardware and tune timings, focus, and visual contrast.

## Core ideas

- Single React app = one HTML. Scenes are components shown/hidden by state.
- Scene manager controls `currentScene` and focuses the first focusable element on scene change.
- Global `state` (Context) stores theme, text size, brightness, subscene, zoom state.
- Carousel is a subscene, and zoom is a nested sub-subscene within carousel with its own controls.
- Electron wraps the app for kiosk: fullscreen, kiosk true, disables menus. Use preload + IPC for any native APIs later.

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

# Important code snippets

## 3.1 State provider (global)

`src/renderer/state/StateProvider.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AppState = createContext();

export function useAppState() { return useContext(AppState); }

export default function StateProvider({ children }) {
  const [scene, setScene] = useState("home");
  const [subscene, setSubscene] = useState(null);
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("prefs")) || { textSize: "medium", theme: "light", brightness: 1 }; }
    catch { return { textSize: "medium", theme: "light", brightness: 1 }; }
  });

  useEffect(() => {
    localStorage.setItem("prefs", JSON.stringify(prefs));
    document.documentElement.classList.remove("text-small","text-medium","text-large");
    document.documentElement.classList.add(`text-${prefs.textSize}`);
    document.documentElement.classList.toggle("theme-dark", prefs.theme === "dark");
    document.documentElement.style.setProperty("--brightness", prefs.brightness);
  }, [prefs]);

  const setPref = (k, v) => setPrefs(prev => ({...prev, [k]: v}));

  return (
    <AppState.Provider value={{ scene, setScene, subscene, setSubscene, prefs, setPref }}>
      {children}
    </AppState.Provider>
  );
}

```

CSS uses `--brightness` and classes for text size/theme.

## 3.2 Scene manager and focus helper

`src/renderer/state/useSceneManager.js`

```jsx
import { useEffect, useRef } from "react";

export function useSceneFocus(sceneId) {
  const lastFocusedRef = useRef(null);
  useEffect(() => {
    const sceneEl = document.querySelector(`[data-scene="${sceneId}"]`);
    if (!sceneEl) return;
    const first = sceneEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (first) {
      // small timeout to ensure visible
      setTimeout(() => { first.focus(); }, 0);
    }
    return () => { lastFocusedRef.current = document.activeElement; };
  }, [sceneId]);
}

```

Usage inside a `Scene` component:

```jsx
import React from "react";
import { useSceneFocus } from "../state/useSceneManager";

export default function Scene({ id, children, hidden }) {
  useSceneFocus(id);
  return (
    <section data-scene={id} aria-hidden={hidden} className={hidden ? "hidden" : ""}>
      {children}
    </section>
  );
}

```

## 3.3 Generic show/hide nav buttons

Make buttons use data attributes not hardcoded focus calls:

```jsx
<button aria-label="Next" onClick={() => { setScene("gallery"); }}>
  Next
</button>

```

## 3.4 Carousel + expanded + zoom structure (React)

`Carousel.jsx` (simplified)

```jsx
import React, { useState, useRef } from "react";
import ZoomControls from "./ZoomControls";
import { useAppState } from "../state/StateProvider";

export default function Carousel({ images = [] }) {
  const { setSubscene } = useAppState();
  const [index, setIndex] = useState(0);

  return (
    <div data-subscene="carousel" className="subscene">
      <div className="thumbs">
        {/* render thumbnails */}
        <button onClick={() => setSubscene("expanded")} aria-label="Expand image">Expand</button>
      </div>

      <div data-subscene="expanded" className="hidden subscene" aria-hidden>
        <div className="expanded-carousel">
          <img src={images[index]} alt="" className="expanded-img" />
          <button onClick={() => setSubscene("zoom")} aria-label="Enter zoom mode">Zoom</button>
          <button onClick={() => setSubscene("carousel")}>Close</button>
        </div>
      </div>

      <div data-subscene="zoom" className="hidden subscene" aria-hidden>
        <ZoomControls imgSelector=".expanded-img" />
        <button onClick={() => setSubscene("expanded")}>Exit zoom</button>
      </div>
    </div>
  );
}

```

## 3.5 Zoom controls

`ZoomControls.jsx`

```jsx
import React, { useEffect, useRef, useState } from "react";

export default function ZoomControls({ imgSelector }) {
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    imgRef.current = document.querySelector(imgSelector);
  }, [imgSelector]);

  const apply = () => {
    if (!imgRef.current) return;
    imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  useEffect(() => apply(), [scale, x, y]);

  return (
    <div className="zoom-controls" role="toolbar" aria-label="Zoom controls">
      <button onClick={() => setScale(s => s + 0.1)} aria-label="Zoom in">+</button>
      <button onClick={() => setScale(s => Math.max(1, s - 0.1))} aria-label="Zoom out">−</button>
      <button onClick={() => setY(y - 20)} aria-label="Pan up">↑</button>
      <button onClick={() => setY(y + 20)} aria-label="Pan down">↓</button>
      <button onClick={() => setX(x - 20)} aria-label="Pan left">←</button>
      <button onClick={() => setX(x + 20)} aria-label="Pan right">→</button>
    </div>
  );
}

```

## 3.6 Brightness, theme, text size (CSS + apply)

`index.css` (important bits)

```css
:root { --brightness: 1; }
body { filter: brightness(var(--brightness)); transition: filter .2s ease; }
.text-small { font-size: 14px; }
.text-medium { font-size: 18px; }
.text-large { font-size: 22px; }
.theme-dark { background: #111; color: #eee; }
.hidden { display: none; }
.subscene { transition: opacity .2s; }

```

StateProvider sets `--brightness` and classes.

# Keyboard / keypad mapping

- Build a small key handler:
    - Map keypad buttons to logical actions, e.g. Next, Back, Select, Up, Down, Left, Right.
    - In Electron you can intercept raw keycodes if needed, or in renderer listen to `keydown`.
- Always call `preventDefault()` when intercepting to avoid OS shortcuts.
- Keep navigation deterministic: every scene has a defined “primary” focusable element.

# Electron wrapper (kiosk)

`src/main/main.js`

```jsx
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1920, height: 1080,
    kiosk: true, // forces kiosk mode
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

```

`src/main/preload.js`

```jsx
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("kioskApi", {
  // placeholder for safe native calls
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, cb) => ipcRenderer.on(channel, (e, ...args) => cb(...args))
});

```

Security notes

- Keep `contextIsolation: true` and `nodeIntegration: false`.
- Expose only minimal safe APIs via preload if you need native features.

# Dev & build scripts (example `package.json` scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "start": "electron .",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  }
}

```

Use `electron-builder` or `electron-forge` to make installers. `concurrently` and `wait-on` help dev flow.

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