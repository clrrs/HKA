# Play / Pause — Implementation Plan

Status: **draft** · Validated: NVDA **Shift** pause/resume works mid-utterance on kiosk (Windows OneCore).

Custom NVDA add-ons / speech-done callbacks are **out of scope for v1**. Keep word-count timers for auto-advance. Revisit an add-on only if timing is consistently bad in testing.

---

## Goals

- **Q** becomes Play/Pause (replaces speech on/off).
- Pause freezes: NVDA speech (mid-sentence), media, and auto-advance timers.
- Pause does **not** freeze the idle timeout; pressing Pause **does** count as activity (resets idle), same as any other key.
- Resume continues speech mid-sentence and media at the same position.
- Navigating (L / K / J) while paused dismisses pause and continues with normal focus/speech.
- Visible corner HUD (same style as speech on/off) + spoken feedback.

## Non-goals (v1)

- Custom NVDA add-on / real `synthDoneSpeaking` signal
- Controller Client SSML-driven auto-read
- Pause during Quote scene
- True pause state on Attract (any interaction just interrupts / advances as today)
- Replacing auto-read timers with speech-completion events

---

## Product decisions (locked)

| Topic | Decision |
|-------|----------|
| Input | **Q** = Play/Pause |
| Speech on/off | Move to Accessibility Settings only (new section, same pattern as Speech Speed) |
| NVDA pause mechanism | Simulate **Shift** (not Ctrl). Ctrl remains `stop-speech` for media preemption |
| Resume fidelity | Mid-sentence (Shift / OneCore) |
| While paused + L/K/J | Clear pause immediately, then run normal nav |
| Idle | Keep counting; Pause resets activity timestamp |
| Attract | No pause state — existing interrupt/advance behavior |
| Quote | Pause key ignored / no-op (global handler already yields here) |
| Instruction | Pause/resume video at `currentTime` |
| Speech mode off | Still pause/resume video; no speech/auto-advance work (auto-advance already off) |
| Feedback | Spoken announce + corner HUD |
| Auto-read timing | Keep estimated chunk timers; freeze remaining delay + chunk index on pause |

---

## Architecture

### Global state (`StateProvider`)

Add:

- `isPaused` (boolean)
- `setPaused(next)` / `togglePaused()` / `clearPaused()`
- Optional: `pauseReason` only if needed later — skip for v1

Consumers subscribe and:

- Pause/resume their media
- Freeze/resume their timers
- Skip starting new auto-advance while paused

### NVDA IPC (`main.js` / `preload.js`)

| Channel | Key sim | Use |
|---------|---------|-----|
| `pause-speech` (new) | **Shift** | Toggle NVDA pause/resume |
| `stop-speech` (existing) | Ctrl | Interrupt before media play (unchanged) |
| `toggle-tts` (existing) | Insert+S ×2 | Only from Settings speech on/off (no longer from Q) |

Notes:

- Track app-side `isPaused` as source of truth. Each Pause press should send Shift **once** and flip `isPaused`. Avoid double-Shift races.
- When nav clears pause, send Shift again **only if** `isPaused` was true (so NVDA unpauses before new focus speech).
- When starting media that already calls `stop-speech`, clear `isPaused` first if needed so app state doesn’t think we’re still paused after Ctrl cancels the paused utterance.

### Media coordination

No full media framework required for v1. Prefer a small registry or context:

- `registerMedia(el)` / `unregisterMedia(el)` on mount/unmount of `<video>` / `<audio>` that should respect global pause
- On `isPaused === true`: `el.pause()` for registered elements that were playing; remember which ones to resume
- On resume: `play()` only those that were playing at pause time

**In scope for media pause:**

- Instruction scene video
- Artifact video overlay
- Home help video (if open)
- Any other visitor-facing video that can be playing outside Attract/Quote

**Out of scope / special:**

- Attract: no pause state
- Quote audio: pause key not active in that scene

### Auto-advance / timers to freeze

| Timer | Location | On pause | On resume |
|-------|----------|----------|-----------|
| Artifact auto-read chunk chain | `ArtifactPopup.jsx` | Clear timeout; store remaining ms + chunk index | Restart timeout with remaining ms |
| Home theme 3s blurb | `HomeScene.jsx` | Clear dwell timeout; store remaining | Restart remaining |
| Theme tip 20s dismiss | `ThemeScene.jsx` | Same pattern if tip visible | Resume remaining |
| Quote 1s post-audio | `QuoteScene.jsx` | N/A (pause inactive) | — |

Idle timer in `App.jsx`: **do not freeze**. Pause key participates in existing activity listeners.

### HUD

Reuse `.speech-mode-hud` pattern in `App.jsx` / `index.css`:

- Speech on/off HUD: keep flash-on-change behavior when toggled from Settings
- Pause HUD: show **Paused** while `isPaused` (sticky until play or nav-dismiss)
- Optional brief **Playing** flash on resume — nice-to-have; sticky Paused is the must-have

Spoken:

- Pause → assertive announce `"Paused"`
- Resume via Q → `"Playing"` (or `"Resumed"`)
- Nav-dismiss: no extra “Playing” required if focus speech immediately follows (decide in implementation; prefer less chatter)

---

## Behavior matrix

| Scene / context | Q (Pause) | Q (Play) | L/K/J while paused |
|-----------------|-----------|----------|--------------------|
| Attract | No pause state (existing advance/interrupt) | — | — |
| Instruction | Pause video (+ Shift if speech on) | Resume video (+ Shift) | Clear pause, then nav |
| Home / Theme / Artifact | Pause speech + timers + any open video | Resume all | Clear pause, then nav |
| Quote | No-op (handler yields) | — | — |
| Settings open | Pause still works (speech/media under overlay if any); idle still runs | Same | Clear pause, then settings nav |
| Idle warning visible | Any key including Q dismisses warning (existing); then apply pause if still desired — **prefer:** Q dismisses idle like today, and also toggles pause only if we explicitly want both. Default: treat as activity first; if warning was showing, dismiss it and **do not** enter pause on that same keypress (simplest, matches “like everything else”). |

---

## Implementation steps

### 1. IPC: `pause-speech`

- [ ] `main.js`: `ipcMain.on("pause-speech", …)` → keybd_event for Shift (VK `0x10`) down/up
- [ ] `preload.js`: allowlist `"pause-speech"`
- [ ] Manual check: Q path later; for now can invoke from console

### 2. Global `isPaused` + Q remap

- [ ] `StateProvider.jsx`: `isPaused`, `togglePaused`, `clearPaused`
- [ ] `useSceneManager.js`: Q calls pause toggle instead of `toggleSpeechMode` / `toggle-tts`
- [ ] Remove / relocate `lastTtsToggleRef` guard if it only existed for Insert+S leaking `s` — keep if Settings toggle-tts still needs it
- [ ] On toggle to paused: `kioskApi.send("pause-speech")` when `speechMode`; always pause registered media; set `isPaused`
- [ ] On toggle to playing: `pause-speech` again when `speechMode`; resume media; clear `isPaused`
- [ ] Attract: early-return before pause logic (or no-op inside toggle)
- [ ] Quote: already returns before Q — confirm Q never reaches pause there (today Q is after the quote early-return — **verify order**; if Q is unreachable in quote, document as intentional)

> Check key handler order: `if (scene === "quote" \|\| scene === "attract") return;` currently sits **before** Q. Attract/Quote will not get Play/Pause unless we special-case Q above that return. **Plan:** handle Q **before** that early return for Instruction/Home/etc., and for Attract explicitly no-op or leave early-return; for Quote leave unreachable / no-op.

**Recommended handler shape:**

1. Test shortcuts…
2. **If Q → play/pause logic** (no-op on attract & quote; active elsewhere)
3. If quote/attract → return (other keys)
4. Rest of keypad…

### 3. HUD + announce

- [ ] Mirror speech HUD for pause (sticky while paused)
- [ ] `announce("Paused")` / `announce("Playing")` on Q toggle
- [ ] Update `docs/screen-reader-announcements.csv` via `npm run export:sr` after strings land
- [ ] Update keypad table in `HKA System Design.md` (Q = Play/Pause)

### 4. Media pause/resume

- [ ] Small helper/context: track playing elements at pause time
- [ ] Wire InstructionScene, ArtifactVideoOverlay, Home help video
- [ ] Ensure local play/pause buttons stay consistent with global `isPaused` (if user hits global pause, local UI shows paused)

### 5. Freeze auto-advance timers

- [ ] `ArtifactPopup` auto-read: pause-aware timeout wrapper (remaining ms)
- [ ] `HomeScene` 3s theme blurb
- [ ] `ThemeScene` tip dismiss if applicable
- [ ] Do not start new auto-read steps while `isPaused`

### 6. Nav dismisses pause

- [ ] At start of L / K / J handling: if `isPaused`, `clearPaused()` + send Shift if `speechMode` + resume media/timers, then continue nav
- [ ] Also clear on Select activating something that moves focus? Covered by J
- [ ] Home (S) / Settings (A): clear pause as well (treat as navigation/UI change)

### 7. Settings: Screen Reader On/Off

- [ ] New section in `AccessibilityMenu.jsx` (On / Off), wired to `speechMode` + `toggle-tts`
- [ ] When turning speech off while paused: clear pause state, Ctrl/`stop-speech` as needed, leave media pause rules consistent (speech off → video can still be globally paused)
- [ ] Onboarding copy: mention screen reader toggle lives in settings (Q is no longer TTS)
- [ ] Keep existing Speech Speed / Text Size / Contrast / Brightness sections

### 8. Idle interaction

- [ ] Confirm Pause key hits existing activity listeners (keydown capture) — should already reset idle
- [ ] Confirm idle countdown is **not** gated on `isPaused`
- [ ] Idle warning + Q: dismiss warning only on that press (no pause toggle), unless testing shows otherwise

### 9. Edge cases

- [ ] Media `stop-speech` on play: clear `isPaused` if set
- [ ] Scene change while paused: clear pause (resume NVDA via Shift if needed, or Ctrl stop + clear — prefer **clear pause + stop-speech** on scene change to avoid Shift desync)
- [ ] `resetToStart` / attract: force `isPaused = false`
- [ ] Speech rate changes while paused: allow; no special case
- [ ] Double-tap Q: toggles cleanly; ignore `e.repeat`

---

## File touch list (expected)

| File | Change |
|------|--------|
| `src/main/main.js` | `pause-speech` IPC (Shift) |
| `src/main/preload.js` | Allowlist channel |
| `src/renderer/state/StateProvider.jsx` | `isPaused` API |
| `src/renderer/state/useSceneManager.js` | Q remap; Q before attract/quote yield; nav clears pause |
| `src/renderer/App.jsx` | Pause HUD; idle unchanged |
| `src/renderer/index.css` | Reuse / slight variant of speech HUD if needed |
| `src/renderer/components/AccessibilityMenu.jsx` | Screen Reader On/Off section |
| `src/renderer/components/scenes/InstructionScene.jsx` | Respect global pause |
| `src/renderer/components/ArtifactVideoOverlay.jsx` | Respect global pause |
| `src/renderer/components/scenes/HomeScene.jsx` | Help video + 3s blurb freeze |
| `src/renderer/components/ArtifactPopup.jsx` | Auto-read freeze |
| `src/renderer/components/scenes/ThemeScene.jsx` | Tip timer freeze if needed |
| `src/renderer/audio/nvdaSpeechControl.js` | Optionally clear pause when stopping for media |
| `HKA System Design.md` | Keypad: Q = Play/Pause |
| `docs/screen-reader-announcements.csv` | Regen after copy lands |

Optional new file:

- `src/renderer/audio/PauseCoordinator.jsx` (or `.js`) — media registry + pause/resume helpers to avoid scattering logic

---

## Test plan

1. **Speech on, artifact auto-read:** Q pauses mid-sentence; Q resumes mid-sentence; UI/timers don’t advance while paused.
2. **Pause then L/K/J:** pause clears; next control is read; media resumes rules as specified (nav clears pause ⇒ resume speech path; media that was paused should resume unless product wants media to stay paused — **locked: clearing pause resumes everything frozen**).
3. **Instruction video:** pause/resume at same `currentTime`.
4. **Speech off + instruction/artifact video:** Q still pauses/resumes video; no Shift needed.
5. **Attract:** Q does not enter sticky pause state.
6. **Quote:** Q does nothing (or doesn’t break dismiss/auto-advance).
7. **Idle:** sit paused; idle warning still appears on schedule; keys dismiss as today.
8. **Settings:** Screen Reader Off/On works; speech HUD still flashes; Q no longer toggles speech.
9. **Scene change / Home (S) while paused:** clean clear, no stuck silent NVDA.
10. **Braille (smoke):** pause/resume doesn’t break display updates after nav.

---

## Follow-up (only if needed)

If auto-read timers feel consistently early/late after pause/resume:

1. Spike a tiny NVDA global plugin listening to `synthDoneSpeaking`
2. Bridge “utterance done” to Electron (named pipe / localhost)
3. Drive artifact chunk advance from that signal instead of word-count estimates

Do not start this until v1 pause is shipped and timing pain is real.

---

## Open micro-decisions (resolve during impl)

1. Exact announce strings: `"Paused"` / `"Playing"` vs `"Resumed"`.
2. On nav-dismiss, announce anything or rely on focus speech only.
3. Scene change while paused: Shift-unpause vs `stop-speech` + clear (recommend stop + clear).
4. Whether Home help video and artifact video share one media registry module.
