# NVDA Custom Output — Project Goal

## Scope

Build a deterministic custom announcement system for NVDA speech and braille output
across every interactive page/scene in the HKA kiosk application.

This is a curated museum kiosk — not a general-purpose accessible website.
We control the hardware, the NVDA configuration, and the entire interaction model.

## Constraints

- **Kiosk-only deployment**: single Windows machine, single NVDA version, single braille display.
- **Custom keypad input**: navigation uses physical keypad mapped to J/K/L/A/S/Q/W/I keys.
- **Not pursuing WCAG conformance**: this is intentionally custom behavior, not standards compliance.
- **Speech + braille are not independently controllable**: users may have speech+braille on or off, but never independently on or off
- **No mouse/touch input**: all interaction is keyboard-driven.

## Architecture Choice

**Phased web-first approach:**

1. Centralized renderer-level announcer service using a single shared `aria-live` region.
2. All components delegate announcements through a single `useAnnounce()` hook.
3. Existing per-component live regions are replaced by the shared announcer.
4. If web-only orchestration cannot achieve deterministic output under locked NVDA settings,
   escalate to Electron IPC bridge, then to NVDA add-on/app module.

### Announcement Policy

- Focus/navigation-driven announcements are treated as `assertive` and must interrupt prior speech.
- `polite` is reserved for non-navigation background/status updates only.

## Success Criteria

An artifact page (starting with Japanese Luncheon Set, 3A2) is considered passing when:

1. Every interaction event produces exactly the specified speech phrase (see announcement contract).
2. Every interaction event produces the specified braille display text.
3. No duplicate or phantom announcements occur.
4. Announcement sequence order matches the contract invariants.
5. Results are repeatable across 3 consecutive test runs under the same NVDA profile.
6. Results are consistent across all 3 NVDA test profiles (A, B, C).

## Escalation Gates

### Gate 1: Web-Only Fails
**Trigger**: After 3 adjustment iterations, any contract event still produces inconsistent
output (wrong phrase, wrong order, duplicates, or timing collisions) under locked NVDA profiles.

**Action**: Add Electron IPC announcement channel. Renderer sends explicit announcement
payloads via `window.kioskApi.send("announce", { text, politeness })`. Main process
dispatches via Windows UIA notification or NVDA controller client.

### Gate 2: Electron Bridge Fails
**Trigger**: UIA/controller approach still cannot prevent NVDA from adding unwanted
role/state announcements or re-ordering output.

**Action**: Implement a dedicated NVDA app module (Python) that intercepts events
for the kiosk Electron window and produces fully scripted speech/braille output.

## Deliverables

| Document | Purpose |
|---|---|
| `NVDA_Artifact3A2_Announcement_Contract.md` | Exact event-to-phrase table for reference artifact |
| `NVDA_Test_Matrix.md` | NVDA setting profiles and test log format |
| `NVDA_Custom_Output_Goal.md` | This document — scope, criteria, escalation |

## Reference Files

| File | Role |
|---|---|
| `src/renderer/state/StateProvider.jsx` | App state including `speechMode` |
| `src/renderer/state/useSceneManager.js` | Global keyboard nav + scene focus |
| `src/renderer/components/scenes/ArtifactScene.jsx` | Artifact page |
| `src/renderer/components/Carousel.jsx` | Image carousel + announcer |
| `src/renderer/components/ZoomControls.jsx` | Zoom/pan controls + announcer |
| `src/renderer/components/DocumentViewer.jsx` | Document viewer |
| `src/renderer/components/ArtifactVideoOverlay.jsx` | Video overlay |
| `src/main/main.js` | Electron main process (IPC, NVDA toggle) |
| `src/main/preload.js` | Electron preload (IPC bridge) |

## Scenes To Cover (Phase 4)

| Scene | File |
|---|---|
| Attract | `src/renderer/components/scenes/AttractScene.jsx` |
| Instruction | `src/renderer/components/scenes/InstructionScene.jsx` |
| Start | `src/renderer/components/scenes/StartScene.jsx` |
| Home | `src/renderer/components/scenes/HomeScene.jsx` |
| Quote | `src/renderer/components/scenes/QuoteScene.jsx` |
| Travel | `src/renderer/components/scenes/TravelScene.jsx` |
| Artifact | `src/renderer/components/scenes/ArtifactScene.jsx` |
