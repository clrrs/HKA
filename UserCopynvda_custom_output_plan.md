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
   - `docs/NVDA_Electron_Escalation_Findings.md`
   - this file
2. Escalation decision is now accepted: move implementation to Electron/NVDA integration path.
3. Keep functional validation anchored to 3A2 behavior until deterministic.
4. Assume focus/navigation = assertive interruption unless user explicitly says otherwise.
5. Propose tiny iterations only (one cluster of events at a time).
6. Keep this file updated after each iteration for continuity across machines/agents.

## Escalation Decision Snapshot (Accepted)

Decision:
- Web-only orchestration reached practical NVDA limits for strict "no structural role/context speech" requirement.
- Next phase is Electron-level announcement control first, then NVDA app module if needed.

Why:
- Iterations `2026-03-18-A` through `2026-03-18-M` reduced chatter but could not fully eliminate NVDA focus-role suffixes (`section` -> `paragraph`).
- See:
  - `docs/NVDA_Electron_Escalation_Findings.md`
  - iteration log in this file

## Copy-Paste Starter Prompt (Next Agent — Electron Phase)

Use this exact prompt to start the next chat:

> Continue from `UserCopynvda_custom_output_plan.md` as source-of-truth.
> We are now in the Electron escalation phase for NVDA determinism.
> Scope remains anchored to artifact `3A2` (Japanese Luncheon Set) for validation, but implementation target is Electron/NVDA integration.
> Read first: `docs/NVDA_Custom_Output_Goal.md`, `docs/NVDA_Electron_Escalation_Findings.md`, `docs/NVDA_Artifact3A2_Announcement_Contract.md`, `docs/NVDA_Test_Matrix.md`, and `UserCopynvda_custom_output_plan.md`.
> Critical policy: focus/navigation announcements must interrupt previous speech (assertive behavior).
> Implement smallest vertical slice first: renderer -> preload IPC -> main process announcement bridge.
> If needed, use NVDA Controller client wrapper for speech + braille dispatch; keep logs/correlation IDs.
> Work in tiny iterations: implement one cluster, wait for NVDA+braille results, then refine.
> Keep `UserCopynvda_custom_output_plan.md` updated after each iteration with decisions, regressions, and next steps.

## Open Questions To Resolve Next

- Should `QuoteScene` keep `aria-live="polite"` or be brought into the same assertive policy?
- Do we want any true background/status announcements in final design, or none at all?
- Should we add a built-in on-screen diagnostics panel/export for announcement logs (instead of manual DevTools)?

## Iteration Log (3A2 Only)

### Iteration 2026-03-18-A — Announcement Logging Baseline

Cluster:
- Shared announcer logging only (no phrase/politeness behavior changes).
- Kept scope anchored to artifact `3A2` flow components (`Carousel`, `ZoomControls`) for source tagging.

Decisions:
- Keep focus/navigation policy as `assertive` interruption (unchanged).
- Persist announcement events to `window.__HKA_ANNOUNCE_LOG__` for every emitted or deduped event.
- Expose helper API at `window.__HKA_ANNOUNCE_TOOLS__`:
  - `.get()` -> structured log objects
  - `.exportText()` -> copy-paste friendly lines
  - `.clear()` -> reset log between runs
- Added `source` tag to announcer calls from:
  - `Carousel`
  - `ZoomControls`

Regressions observed in code review:
- None expected for runtime behavior (announcement text + politeness path unchanged).

Operator test procedure (for next run):
1. Launch app + NVDA with the usual profile.
2. In DevTools console, run:
   - `window.__HKA_ANNOUNCE_TOOLS__.clear()`
3. Execute one 3A2 contract sequence cluster.
4. In DevTools console, run:
   - `window.__HKA_ANNOUNCE_TOOLS__.exportText()`
5. Copy/paste the resulting text into chat with your observed NVDA speech and braille notes.

Next step after results:
- Compare exported app announcement sequence vs observed NVDA speech/braille.
- Pick one failing cluster only (if any) and refine timing/dedupe/phrase behavior in a single small iteration.

### Iteration 2026-03-18-B — Input Logging (Move/Select Trace)

Cluster:
- Input-side logging for artifact `3A2` interactions only.
- Goal: capture what user input triggered each navigation/select action.

Decisions:
- Added input log store + tools:
  - `window.__HKA_INPUT_LOG__`
  - `window.__HKA_INPUT_TOOLS__.get()`
  - `window.__HKA_INPUT_TOOLS__.clear()`
  - `window.__HKA_INPUT_TOOLS__.exportText()`
- Logged keypad navigation in `useKeyboardNav` (artifact scene only):
  - `K` -> previous focus target
  - `L` -> next focus target
  - `J` -> select active element
- Logged direct carousel input in artifact flow:
  - `Enter` on surface -> open expanded
  - `Escape` in overlays -> close/exit action path
- Logged zoom interaction actions:
  - zoom in/out, pan directions, reset

Regressions observed in code review:
- None expected for behavior; logs are additive.

Operator test procedure (input + announcement capture):
1. Before run, clear both logs:
   - `window.__HKA_INPUT_TOOLS__.clear()`
   - `window.__HKA_ANNOUNCE_TOOLS__.clear()`
2. Execute one 3A2 cluster.
3. Export both:
   - `window.__HKA_INPUT_TOOLS__.exportText()`
   - `window.__HKA_ANNOUNCE_TOOLS__.exportText()`
4. Paste both outputs into chat + your observed NVDA speech and braille.

Next step after results:
- Correlate input line -> app announcement line -> observed NVDA/braille output.
- Fix one mismatch cluster at a time (do not broaden beyond 3A2).

### Iteration 2026-03-18-C — DevTools Logging UX Hardening

Cluster:
- Make log exports easier and explicit when no events are recorded yet.

Decisions:
- Added combined helpers on `window`:
  - `__HKA_CLEAR_DEBUG_LOGS__()` clears both input + announcement logs
  - `__HKA_EXPORT_DEBUG_LOGS__()` returns both logs in one block
- Export functions now return explicit text when empty:
  - `[no input logs recorded yet]`
  - `[no announcement logs recorded yet]`

Regressions observed in code review:
- None expected; logging surface only.

Operator note:
- DevTools may block pasted commands until user types `allow pasting`.
- If blocked, type commands manually or run `allow pasting` once in that DevTools session.

### Iteration 2026-03-18-D — Debug Helper Availability Fix

Cluster:
- Ensure debug clear/export helpers exist before the first announcement event.

Decisions:
- Register announcer debug tools on provider mount (`useEffect`) instead of only lazily during announce calls.
- This makes `window.__HKA_CLEAR_DEBUG_LOGS__()` callable immediately after app load.

Regression identified:
- Prior iteration required at least one announcement before helper functions existed.

Operator verify:
1. Reload app (`npm run electron:dev` session).
2. In Electron DevTools Console:
   - `window.__HKA_CLEAR_DEBUG_LOGS__()`
3. Expected return:
   - `"cleared input + announcement logs"`

### Iteration 2026-03-18-E — De-dup Side-Effects in 3A2 Nav/Zoom

Cluster:
- Remove duplicate app announcements for:
  - Carousel next/previous image
  - Zoom pan directions

Evidence from operator logs:
- `Image 2 of 2` emitted twice at same timestamp.
- `Panned up/down` emitted in immediate duplicate pairs.

Root cause:
- Announcement side-effects were inside React state updater callbacks (`setState(prev => ...)`).
- In dev mode, updater functions can be invoked more than once, causing duplicate announces.

Changes made:
- `Carousel`:
  - Moved `announce(...)` out of `setCurrentIndex(prev => ...)`.
  - Added `currentIndexRef` to compute next/prev deterministically without side-effects in updater.
- `ZoomControls`:
  - Moved `announce(...)` out of `setPosition(prev => ...)` in pan path.
  - Added `positionRef` for deterministic pan calculations and single announce per action.

Expected result:
- One app announcement per intended input action for this cluster.

### Iteration 2026-03-18-F — Exit Expanded Focus Restore

Cluster:
- Exit image carousel (expanded -> surface) behavior only.

Issue observed:
- On exiting expanded carousel, NVDA reads extra page-level content (landmarks/headings/buttons) beyond intended exit phrase.

Hypothesis:
- Focus was left on an unmounted element from expanded layer, causing fallback focus/context churn.

Change made:
- Added explicit focus restore to carousel surface element on `exitExpanded`.
- Sequence now:
  1. Set subscene to surface
  2. Announce `Exited navigation mode.`
  3. Programmatically focus surface control (`Image carousel, 2 images, press Enter to open`)

Expected result:
- Exit action should no longer dump broad page/landmark announcements.
- NVDA should stay anchored to carousel surface context after exit.

### Iteration 2026-03-18-G — Suppress Structural Landmark Chatter

Cluster:
- Reduce unwanted `application/main/navigation landmark` announcements in 3A2 path.
- Remove `aria-hidden` focus conflict source seen in console warnings.

Changes made:
- Removed root `role="application"` in `App`.
- Replaced scene wrapper `<main>` with `<div>` in `SceneContainer`.
- Replaced artifact scene `<nav>` wrappers with `<div className="artifact-nav">`.
- Removed `aria-hidden={!isActive}` from scene wrapper; retained `inert` + `display:none` scene hiding.

Rationale:
- These semantics can trigger extra structural speech (landmarks/application context) before focused control text.
- `aria-hidden` on a scene whose descendant still has focus causes warnings and unstable AT context.

Expected result:
- Fewer/no `application`, `main landmark`, `navigation landmark` prefixes in 3A2 speech.
- Console should no longer emit the blocked `aria-hidden` focused-descendant warning for scene transitions.

Note on Electron dev vs packaged:
- CSP warning is dev-only noise.
- Screen reader output behavior should be materially the same between dev and packaged builds for these semantics.

### Iteration 2026-03-18-H — Exit Phrase + Title Role Suppression

Cluster:
- Artifact `3A2` exit-expanded behavior and title focus phrase only.

Requested behavior:
- On exit: say only `Exited image carousel.` (no `document`/`landmark` context preface).
- On title focus: avoid `heading level 1`.

Changes made:
- `Carousel`:
  - Exit phrase changed from `Exited navigation mode.` to `Exited image carousel.`
  - Exit flow now waits for surface mode render, then focuses surface and announces exit phrase.
- `ArtifactScene`:
  - Replaced title element from semantic heading (`h1`) to styled focusable text block (`div.artifact-title`) with `aria-label` equal to title text.

Expected result:
- Title focus should read just title text (without heading level metadata).
- Exit path should be anchored to surface and prefer the explicit exit phrase.

### Iteration 2026-03-18-I — Scene Transition Focus Gap Removal

Cluster:
- Global scene transition focus handoff (still validated through 3A2 flow first).

Issue:
- NVDA still announces document context (`Helen Keller Archives, document`) during some scene transitions.

Hypothesis:
- Previous focus handoff used delayed `setTimeout(50)` in `useSceneFocus`, creating a brief body/document focus gap.

Change made:
- Switched scene focus effect from `useEffect` to `useLayoutEffect`.
- Removed delayed timeout; focus now moves immediately to scene autofocus target on activation.

Expected result:
- Reduced/removed transient document-level announcements during scene changes.
- More deterministic focus target speech on scene entry.

### Iteration 2026-03-18-J — Global Landmark Cleanup + Speech-On Title Autofocus

Cluster:
- Expand landmark-chatter suppression to remaining scene surfaces.
- Travel (`artifact selection`) speech-on autofocus and title semantics cleanup.
- Artifact title semantic cleanup follow-through.

Changes made:
- Removed final remaining `<nav>` usage (`AccessibilityScene`) to avoid navigation landmark speech.
- `TravelScene`:
  - Speech mode ON now autofocuses the visible title (`Adventure`) directly.
  - Speech mode OFF keeps previous non-title autofocus behavior (`travel-heading-inner`) to preserve button-only nav expectations.
  - Converted title element from heading semantics to non-heading text (`span.travel-title`) to avoid level announcements.
  - Removed heading container `aria-label` that could cause extra structural utterances.
- `ArtifactScene`:
  - Title remains non-heading text and now has explicit `data-autofocus` in speech mode.
  - Keeps title focus path aligned with deterministic phrase-only goal.

Expected result:
- No `application/main/navigation landmark` chatter across scenes from leftover landmark tags.
- On artifact selection page with speech ON, initial focus lands on `Adventure`.
- Title focus on both artifact selection and 3A2 artifact page should avoid extra `heading level`/`section` suffixes.

### Iteration 2026-03-18-K — Title Role Text Override

Cluster:
- Residual `section` suffix on focused titles only.

Issue observed:
- `Adventure` and `Japanese Luncheon Set, 1948` still announced with trailing `section`.

Change made:
- Added `role="text"` to both focusable title elements:
  - `TravelScene` title (`travel-title`)
  - `ArtifactScene` title (`artifact-title`)

Expected result:
- NVDA should treat these as text-focused targets and suppress generic container role suffix (`section`).

### Iteration 2026-03-18-L — NVDA Landmark Reporting Disabled

Cluster:
- Remove residual structural speech (`section` / landmark chatter) at the NVDA profile layer.

Issue observed:
- Even after title semantic changes, NVDA still announces trailing `section` on focused titles.

Change made:
- Updated kiosk NVDA profile (`nvda.ini`):
  - `[documentFormatting] reportLandmarks = False`

Rationale:
- Structural role speech is controlled partly by NVDA formatting verbosity settings, not only app markup.
- For deterministic kiosk output, profile-level suppression is the most reliable path for "never announce landmark/section context".

Operator action:
1. Restart NVDA (or reload config) after updating `nvda.ini`.
2. Retest title focus on:
   - Artifact selection (`Adventure`)
   - Artifact page (`Japanese Luncheon Set, 1948`)

Expected result:
- `section` suffix should be suppressed in these title reads.

### Iteration 2026-03-18-M — Title Element Type + Screen Layout Verbosity

Cluster:
- Persisting `section` suffix on focused titles.

Investigation findings:
- NVDA config spec confirms additional virtual buffer verbosity controls beyond landmarks.
- Focusable generic inline/container title nodes may still be surfaced with structural role speech.

Changes made:
- App markup:
  - `TravelScene` title changed to focusable `<p className="travel-title">`.
  - `ArtifactScene` title changed to focusable `<p className="artifact-title">`.
  - Removed temporary `role="text"` overrides.
- NVDA profile (`nvda.ini`):
  - Added `[virtualBuffers] useScreenLayout = False`
  - Kept `reportLandmarks = False`

Rationale:
- Paragraph elements are often announced as plain text more consistently than generic focusable containers.
- Disabling screen layout reporting reduces structural verbosity in web document output.

Operator action:
1. Restart NVDA to load updated profile.
2. Retest title focus:
   - `Adventure`
   - `Japanese Luncheon Set, 1948`
3. Confirm whether `section` still appears.

### Iteration 2026-03-18-N — Escalation Research + Phase Switch

Cluster:
- Research and decision for Electron/NVDA integration phase.

Observed outcome after M:
- NVDA output changed from `section` to `paragraph` on focused titles.
- This confirms residual speech is native role/type output, not solely landmark verbosity.

Research summary:
- NVDA Controller Client API supports explicit speech + braille dispatch from external apps.
- Windows UIA notification event is available but may still be subject to reader/user setting behavior.
- NVDA app module is the strongest path to suppress default focus-role chatter for kiosk window events.

Decision:
- Escalation accepted.
- Next implementation phase: Electron bridge first, then NVDA app module if role chatter persists.

Docs added/updated:
- Added: `docs/NVDA_Electron_Escalation_Findings.md`
- Updated: `docs/NVDA_Custom_Output_Goal.md` deliverables list
- Updated: this file handoff + starter prompt for Electron phase

## Success Definition (short)

- 3A2 passes deterministic speech+braille contract repeatedly
- Same policy scales scene-by-scene without regressions
- Escalation path is used only if deterministic output cannot be achieved with app-level orchestration