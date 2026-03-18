---
name: NVDA Custom Output North Star
overview: Handoff-ready source of truth for deterministic NVDA speech + braille behavior in the HKA kiosk, starting from artifact 3A2 and scaling scene-by-scene.
todos:
  - id: define-reference-contract
    content: Define exact event->phrase output contract for Japanese Luncheon Set artifact flow.
    status: completed
  - id: create-nvda-test-matrix
    content: Create a repeatable NVDA settings matrix and logging format for observed vs expected output.
    status: completed
  - id: design-announcer-service
    content: Design a shared renderer announcer service API and migration plan for existing local announcers.
    status: completed
  - id: pilot-on-artifact-page
    content: Pilot the orchestrated announcement behavior on Artifact/Carousel/Zoom components only.
    status: completed
  - id: set-escalation-criteria
    content: Document objective gates for escalating from web-only orchestration to Electron/NVDA add-on integration.
    status: completed
isProject: false
lastUpdated: 2026-03-18
---

# NVDA Custom Output North Star

## Mission

Create deterministic, curated NVDA output (speech + braille) for a kiosk interactive.
This is not generic web accessibility work; this is a controlled, custom interaction model.

## Most Important Product Rule (Latest Decision)

**Whenever focus shifts / user navigates, announcements should interrupt what came before.**
In practical terms: focus/navigation-driven announcements are `assertive`.

`polite` is reserved only for optional background/status updates (if any exist later).

## Scope

- Start with artifact page reference: **Japanese Luncheon Set** (`id: 3A2`)
- Lock behavior there first
- Then apply same contract pattern to all scenes

## What Was Implemented Already

### Docs created

- `docs/NVDA_Custom_Output_Goal.md`
- `docs/NVDA_Artifact3A2_Announcement_Contract.md`
- `docs/NVDA_Test_Matrix.md`

### Runtime architecture implemented (pilot)

- Added shared announcer provider:
  - `src/renderer/state/AnnouncerProvider.jsx`
- Mounted provider in app root:
  - `src/renderer/index.jsx`
- Migrated local announcers to shared service:
  - `src/renderer/components/Carousel.jsx`
  - `src/renderer/components/ZoomControls.jsx`

### Policy alignment update completed

- Contract updated to use `assertive` for focus/navigation-related events.
- Goal doc updated with explicit “Announcement Policy”.
- Test matrix updated with reminder: focus/navigation should interrupt prior speech.
- Shared announcer default set to `assertive`.

## Current Architecture Snapshot

- Scene state + navigation:
  - `src/renderer/state/StateProvider.jsx`
  - `src/renderer/state/useSceneManager.js`
- Artifact flow:
  - `src/renderer/components/scenes/TravelScene.jsx` -> `src/renderer/components/scenes/ArtifactScene.jsx`
- Artifact data:
  - `src/renderer/data/artifacts.js` (`3A2` entry)
- Electron bridge path (future escalation):
  - `src/main/preload.js`
  - `src/main/main.js`

## Known Live Region / Announcement Locations

- Shared announcer infrastructure:
  - `src/renderer/state/AnnouncerProvider.jsx` (`aria-live="polite"` + `aria-live="assertive"`)
- Inactivity countdown (true status-style behavior):
  - `src/renderer/App.jsx` (`aria-live="assertive"`)
- Additional legacy/content live region to review later:
  - `src/renderer/components/scenes/QuoteScene.jsx` (`aria-live="polite"`)

## Testing Workflow (Operator + Agent)

### Operator (you)

For each run on artifact 3A2:

1. Run the contract sequence (entry, carousel, expanded, zoom, guided, transcript, exit, nav buttons)
2. Capture:
   - What NVDA spoke
   - What braille displayed
   - Ordering
   - Interrupt behavior
   - Duplicates/clipping
3. Share results in compact table (expected vs observed)

### Agent

- Diff expected vs observed
- Adjust contract wording/timing/dedupe rules
- Iterate in small batches

## What to Look For During Tests

- Exact phrase match
- Correct ordering
- Interrupt behavior works (new nav event interrupts old speech)
- No duplicate/phantom announcements
- Braille parity with intended speech contract

## Escalation Gates

### Gate 1: Web-only orchestration fails

Trigger:
- After 3 focused iterations, deterministic behavior still fails under locked NVDA profile(s)

Action:
- Add explicit Electron announcement channel and dispatch path.

### Gate 2: Electron bridge still fails

Trigger:
- NVDA still adds/reorders unwanted output beyond app control

Action:
- Implement dedicated NVDA app module/add-on for full deterministic scripting.

## Handoff Instructions for Next Agent

1. Read:
   - `docs/NVDA_Custom_Output_Goal.md`
   - `docs/NVDA_Artifact3A2_Announcement_Contract.md`
   - `docs/NVDA_Test_Matrix.md`
   - this file
2. Do not broaden scope yet; keep all work anchored to 3A2 behavior until stable.
3. Assume focus/navigation = assertive interruption unless user explicitly says otherwise.
4. Propose tiny iterations only (one cluster of events at a time).
5. Keep this file updated after each iteration for continuity across machines/agents.

## Copy-Paste Starter Prompt (Next Agent)

Use this exact prompt to start the next chat:

> Continue from `UserCopynvda_custom_output_plan.md` as source-of-truth.
> Scope is ONLY artifact `3A2` (Japanese Luncheon Set) until deterministic behavior is confirmed.
> Read first: `docs/NVDA_Custom_Output_Goal.md`, `docs/NVDA_Artifact3A2_Announcement_Contract.md`, `docs/NVDA_Test_Matrix.md`, and `UserCopynvda_custom_output_plan.md`.
> Critical policy: focus/navigation announcements must interrupt previous speech (assertive behavior).
> Work in small iterations: implement one cluster, wait for NVDA+braille test results, then refine.
> Keep `UserCopynvda_custom_output_plan.md` updated after each iteration with decisions, regressions, and next steps.

## Open Questions To Resolve Next

- Should `QuoteScene` keep `aria-live="polite"` or be brought into the same assertive policy?
- Do we want any true background/status announcements in final design, or none at all?
- Should we add a built-in on-screen diagnostics panel/export for announcement logs (instead of manual DevTools)?

## Success Definition (short)

- 3A2 passes deterministic speech+braille contract repeatedly
- Same policy scales scene-by-scene without regressions
- Escalation path is used only if deterministic output cannot be achieved with app-level orchestration