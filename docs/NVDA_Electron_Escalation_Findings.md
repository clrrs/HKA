# NVDA Escalation Findings (Electron + NVDA Integration)

Date: 2026-03-18
Status: Approved for next phase (user confirmed escalation)

## Why We Are Escalating

Web-level orchestration reduced noise significantly, but did not satisfy the hard requirement:

- Requirement: only announce the focused/contracted phrase, never structural chatter (`document`, `main`, `navigation landmark`, `section`, `paragraph`).
- Observed: after multiple focused iterations, NVDA still appended native role/context terms in some focus flows.

Conclusion:
- Pure web semantics + live regions can improve output, but cannot reliably guarantee zero native role/context speech in all transitions.

## What We Tried (And Why It Was Not Enough)

Reference: `UserCopynvda_custom_output_plan.md` iteration log (`2026-03-18-A` through `2026-03-18-M`).

Key attempts:
- Unified announcer + assertive policy + dedupe/timing fixes.
- Input + announcement logging for deterministic diffing.
- Focus handoff fixes (expanded exit restore, scene focus gap removal).
- Landmark suppression in app markup (`role="application"`, `<main>`, `<nav>` removal).
- NVDA profile tuning (`reportLandmarks=False`, `useScreenLayout=False`).
- Title semantic variants to suppress suffixes (`h1` -> non-heading, `span`/`p`, `role="text"`).

Result:
- Major improvement, but residual role/type suffix behavior remained in focus announcements under real NVDA runs.

## Research Findings

### 1) NVDA Controller Client API (external API)
- Purpose-built API for external apps to send speech and braille.
- Supports explicit speech and braille dispatch from outside NVDA.
- Good fit for deterministic announcement payload delivery from Electron main process.

### 2) Windows UIA Notification event
- Can raise explicit AT notifications on Windows.
- Useful fallback/interop path, but still subject to screen reader handling and user notification settings.

### 3) NVDA App Module (add-on)
- App-specific Python module can intercept focus/event handling for a target app.
- Most reliable path to suppress unwanted native focus/context speech and let scripted output dominate.

## Recommended Architecture

Use a phased Electron-level escalation:

1. **E1: Electron announcement bridge (now)**
   - Renderer sends explicit payloads through IPC.
   - Main process forwards to NVDA Controller client wrapper.
   - Assertive path cancels current speech before speaking next phrase.

2. **E2: Deterministic queue + correlation logging**
   - One speech/braille queue in main.
   - Sequence IDs and timestamps to correlate:
     - user input
     - renderer event
     - dispatched NVDA payload
     - observed NVDA output

3. **E3: NVDA app module (if E1/E2 still leak role chatter)**
   - Target kiosk executable/window.
   - Suppress default focus speech for controlled events.
   - Preserve only scripted phrase/braille behavior.

## Why This Is The Best Next Step

- Keeps existing renderer contract and 3A2 event table as source of truth.
- Moves control to the layer that can actually control final AT output.
- Aligns with previously defined escalation gates in `docs/NVDA_Custom_Output_Goal.md`.

## Implementation Targets

Primary files for E1:
- `src/main/main.js`
- `src/main/preload.js`
- `src/renderer/state/AnnouncerProvider.jsx`

Suggested additions:
- `src/main/nvdaControllerBridge.js` (or helper process wrapper)
- `docs/NVDA_Electron_Bridge_Test_Log.md` (optional run log)

## Risks And Notes

- Dev vs packaged executable naming affects future app-module mapping.
- NVDA Controller client distribution/bitness must match runtime architecture.
- Kiosk security note: avoid speaking sensitive data on secure/lock screens.

## Entry Criteria For Next Agent

The next agent should:
- Stay scoped to 3A2 behavior until deterministic at Electron layer.
- Implement E1 only first (smallest vertical slice).
- Wait for NVDA+braille operator results after each small cluster.
- Keep `UserCopynvda_custom_output_plan.md` updated after every iteration.
