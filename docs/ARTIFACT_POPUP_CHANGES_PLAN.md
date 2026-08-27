# Artifact Popup Changes — Usage-Split Overview

**Status:** packages A–G, I, J, K are **implemented**. H is still pending content. See “Status” and “Punchlist” below before doing more work here.  

---

## Status

| Package | State | Notes |
|---------|-------|-------|
| A. Story button + text transition | **Done** | `textMode` intro/guided, 1s hand-off, Story never changes the image |
| B. Next Image + image/text link | **Done** | Shared `goToImage`, document page announce, letter sections |
| C. Button order + Previous Image | **Done** | Previous Image at 5+ images; video order revised (see E) |
| D. Auto-read timing split | **Done** | `SECTION_TRANSITION_MS` 1s, `POST_READ_DWELL_MS` 4s |
| E. Video Play / Pause | **Done** | Placement moved into the toolbar — see revised section |
| F. Prev/next artifact unlock | **Done** | `navArrowBump` removed |
| G. Visual polish | **Done** | Scrim 0.28, Zoom is the word |
| H. Content source consolidation | **Not started** | Waiting on the Adventure content matrix |
| I. SR announcement CSV | **Done** | `docs/screen-reader-announcements.csv` + `.cursor/rules/screen-reader-announcements.mdc` |
| J. Overflow text focus return | **Done** | Added after A–G; see section below |
| K. Description on non-video | **Done** | Description after Story on images; guided auto-read takeover leaves Description |

---

## How to use agents (save usage)

| Role | Use for | Do not use for |
|------|---------|----------------|
| **You (product)** | Final product answers, copy approval, Adventure content doc drop | Coding |
| **Smarter agent** | Planning, UX state machines, auto-read timing, focus/a11y behavior, risky nav changes, architecture | Pure CSS tweaks, CSV row edits, “change this string” |
| **Cheaper model** | Mechanical edits with a clear checklist, CSS/copy swaps, SR CSV sync after code lands, content field paste from a provided matrix | Designing behavior, inventing edge cases, refactoring `ArtifactPopup` without a plan |

**Planning owner:** smarter agent (one short plan pass after questions are answered). Cheaper models execute checklists from that plan; they do not re-plan.

**Suggested batching (when you execute later):**

1. Smarter: resolve open questions → write a tight implementation checklist.  
2. Cheaper: visual/copy polish + SR CSV format cleanup (parallel-safe).  
3. Smarter: Story / timing / image↔text / toolbar / nav-unlock core.  
4. Cheaper: content matrix updates + SR CSV row sync for new strings.  
5. Smarter (short): verify focus order + auto-read paths; fix regressions.

---

## Current baseline (relevant)

- Main UI: `src/renderer/components/ArtifactPopup.jsx`
- Runtime content: `src/renderer/data/artifacts.js` (all themes)
- Content process: `docs/CSV_CONTENT_SYNC.md` — only Adventure matrix CSV is in-repo (`Adventure Content - Sheet1.csv`)
- Auto-read buffers today: uniform **6s** chunk buffer + **6s** transcript dwell (not yet 1s / 4s split)
- No Story button; no Previous Image button
- Toolbar today (non-video): Transcript → Next Image → Zoom (icon)
- End-of-list L/K on prev/next **artifact** arrows: bump animation + re-announce (no second-press navigate)
- Two SR announcement CSVs exist; user’s preferred format is in `docs/HKA screen-reader-announcements - screen-reader-announcements.csv` (stale vs code); `docs/screen-reader-announcements.csv` is closer to current code

---

## Work packages

### A. Story button + automatic text transition  
**Owner:** smarter agent (design + implement) · cheaper: none until strings/checklist exist

| Requirement | Notes |
|-------------|--------|
| Story shows **Text A** (Story intro) | Existing `description` — **no field/content changes** |
| After intro displayed/read → ~**1s** → condensed guided description | Existing `guidedDescription` (per image where applicable) |
| Clicking Story always brings back Story intro | Reset text mode only — **does not change the image on screen** |
| Opening an artifact | Always **first image active** + **Story intro visible** |
| Story intro must **not** auto-reappear on Next Image | Separate “text mode” from `imageIndex` |

**Complexity:** high — touches display state, auto-read chunking, focus, announcements.

---

### B. Next Image + image/text relationship  
**Owner:** smarter agent · cheaper: document-page announce string once specified

| Requirement | Notes |
|-------------|--------|
| Next Image advances image | Already wraps; may need Prev Image + non-reset of Story |
| Content box shows guided copy for **that** image | Sync panel to `currentImageIndex` |
| Documents: no per-page guided copy after first | Announce then speak guided: `Page X of Y of [document name]. For full text, go to Transcript.` then the document’s guided description |
| Story pressed while on image 2+ | Text resets to intro; **current image stays on screen** |

---

### C. Button order + Previous Image  
**Owner:** smarter for focus-order / `getPopupFocusables` · cheaper for label/DOM order once behavior is specified

| Requirement | Notes |
|-------------|--------|
| Default order: **Story → Description → [Previous Image] → Next Image → Zoom → Transcript** | Previous Image only when **5+ images**; sits **before** Next Image. **Do not rename** any labels (visual or SR). |
| Video toolbar | **Story → Play → Pause → Description → Transcript** (Play/Pause stay immediately after Story) |

---

### D. Auto-read timing split  
**Owner:** smarter only

| Case | Target delay |
|------|----------------|
| Between reading sections (e.g. Story intro → guided) | ~**1s** |
| After auto-read drops focus on next controls (Zoom, Transcript, next-artifact arrow, etc.) | **~4s** dwell — **auto-read handoff only** (not manual Story → guided) |

Replace single `CHUNK_BUFFER_MS` with section-transition vs post-read dwell constants. Update `scripts/audit_autoread_duration.mjs` if it mirrors these.

---

### E. Video Play / Pause buttons  
**Owner:** smarter for behavior/focus · cheaper for CSS placement if handed a mock/checklist

- **Play** and **Pause** both live **in the artifact toolbar, immediately after Story** — where the single Play button used to sit. (Superseded an earlier pass that put them in a column beside the video.)
- Video toolbar order: **Story → Play → Pause → Description → Transcript**
- Inactive button stays in place but looks inactive and is **not in focus order** — same pattern as zoom pan buttons  
- Selecting Play or Pause does **not** move focus/cursor  
- Pressing the focused button again toggles (redundant but intentional — e.g. Pause while on Pause → play)  
- When **auto-read** starts the video, gold stays on **Play** (not Pause). L/K takeover matches sitting on Play during manual nav: **L → Pause**, **K → Story**, and the video **keeps playing** (playback is claimed as manual so cancel does not pause it).
- Non-video and video artifacts both get **Story** + **Description** toolbar buttons (same text flow). On non-video, Description sits **immediately after Story**.
- **Transcript shows on every video artifact**, even without `transcriptText` (reads as `MISSING COPY`)
- Keep existing **Transcript** label (no rename) 

---

### F. Prev/next artifact direction unlock  
**Owner:** smarter (nav edge cases) · cheaper: remove bump CSS/class if smarter leaves a one-line note

- On prev/next **artifact** arrow only: Left (prev) / Right (next) again should **navigate**, not bounce  
- Theme carousel ends unchanged  
- Select (J) still activates  
- Remove bounce / `navArrowBump` usage for this case  

---

### G. Visual polish  
**Owner:** cheaper model

| Item | Where |
|------|--------|
| Scrim / circle dim a bit less dark | `index.css` — “visibly lighter,” no fixed opacity target |
| Zoom control: visible word **“Zoom”** instead of icon | `ArtifactPopup.jsx` + CSS |

---

### H. Content source consolidation  
**Owner:** smarter for schema + sync script · cheaper for applying matrix rows when you paste a doc

**Today:**

- Runtime truth: `artifacts.js` (themes, artifacts, blurbs, quotes, descriptions)
- Process doc: `docs/CSV_CONTENT_SYNC.md`
- In-repo theme matrix: Adventure CSV only (`Adventure Content - Sheet1.csv`)

**Intent:** one **master CSV** for all four themes that syncs into:

- `artifacts.js` (artifact popup copy)
- Theme selection pages (`theme.description`, `theme.quote`, artifact list)
- Home page (`screenReaderBlurb`, theme carousel labels via `getThemeCarouselLabel`)

Smarter defines CSV columns + sync path; cheaper runs sync when content arrives. Remove unused per-theme CSVs / duplicate docs after master exists.

**Later (Adventure chat):** drop updated copy → cheaper agent syncs master CSV → `artifacts.js` (+ related fields). Smarter only if schema changes.

---

### I. Screen-reader announcement source  
**Owner:** smarter sets rule · cheaper reformats + syncs rows

| Task | Agent |
|------|--------|
| **Canonical file:** `docs/screen-reader-announcements.csv` | keep this name/path |
| **Reference format:** `docs/HKA screen-reader-announcements - screen-reader-announcements.csv` | use for column layout + detail level only |
| Reformat existing CSV to match reference org; merge current code truth | cheaper |
| Delete reference file after merge | cheaper |
| Rule: any aria-label / live-announce / alt change → update canonical CSV in same change | smarter writes Cursor rule; cheaper follows |
| New strings (Story, Description, Play/Pause, doc page announce, Zoom word, etc.) — **no label renames** | cheaper after code lands |

Reference columns (no screenshots): `type, location, Trigger, Scenario, Message, …file/line…, Notes`

---

### J. Overflow text focus return  
**Owner:** smarter (focus state machine)

When **Story**, **Previous Image**, **Next Image**, or **Description** reveals copy that overflows the text panel, focus moves into the panel so the next forward key scrolls. Leaving that panel — off the bottom going forward or off the top going back — returns focus to **the button that put you there**, not the next item in the global order.

Conditions:

- Only when the newly revealed copy **actually overflows**. If it fits, focus stays on the button.
- Only while the visitor is **driving**. Auto-read scrolls the panel itself and keeps focus where it is.
- Clicking / selecting the text panel directly still uses the old next/previous exit order (no return button to go back to).
- **Transcript is untouched** — its overlay and focus handling stay as they were.

Implementation: `textNavSourceRef` records the trigger; `scheduleOverflowTextNavRef` does the measure-then-enter after layout; `exitTextNav` prefers the recorded source. If the panel stops overflowing while text nav is active (e.g. Story intro → shorter guided copy), focus falls back to the same source button.

---

### K. Description button on non-video artifacts  
**Owner:** smarter (focus order + auto-read takeover)

Non-video artifacts now show **Description** immediately after **Story**, matching the video control’s label and action (shows the guided copy for the current image). This fills the gap where single-image artifacts had no way to reach guided copy during manual navigation.

- Non-video order: **Story → Description → [Previous Image] → Next Image → Zoom → Transcript**
- Video order unchanged: **Story → Play → Pause → Description → Transcript**
- Auto-read takeover during the guided section mirrors Story/Play: gold is already on Description, so **L** leaves to the next toolbar button and **K** goes to Story (or the back arrow if Story is absent).
- Overflow hand-off for Description was already wired via `scheduleOverflowTextNavRef(guidedDescBtnRef)`.

---

## Suggested execution order (when you greenlight later)

```
Questions answered
    → Smarter: short implementation checklist (not this overview)
    → Cheaper: G (CSS/Zoom word) + I format cleanup (canonical CSV)
    → Smarter: A–F core behavior
    → Cheaper: H content updates (when Adventure doc arrives) + I row sync
    → Smarter: smoke / a11y pass
```

---

## Out of scope for this overview

- Actually implementing any of the above  
- Writing the Adventure content itself  
- Redesigning themes outside the artifact popup  

---

## Decisions (locked)

| Topic | Decision |
|-------|----------|
| Story vs image | Story resets **text only**; image unchanged. Open artifact → image 1 + Story intro. |
| Story / guided text fields | Use existing `description` → then `guidedDescription`. **No content-field changes** — wire UI to what’s already there. |
| Previous Image | When **5+ images**; order: Story → Description → **Previous Image** → Next Image → … |
| Labels | **No renames** — keep Transcript / Zoom / etc. as today (visual + SR) |
| Video toolbar | **Story → Play → Pause → Description → Transcript**; Transcript always present on video |
| Non-video toolbar | **Story → Description → [Previous Image] → Next Image → Zoom → Transcript** |
| Play/Pause | In the toolbar right after Story. Both always visible; inactive one unfocusable + styled inactive (zoom pan pattern); no focus move on activate; re-press toggles; auto-read gold stays on Play; L/K takeover leaves Play like manual nav (Pause / Story) without pausing the video |
| Description button | On all non-combined artifacts (video and non-video). Manual press shows guided for the current image; auto-read guided takeover leaves Description (L → next control, K → Story) |
| Overflow text focus | Story / Prev Image / Next Image / Description hand focus to the text panel **only** on real overflow **and only** on manual navigation; exiting either end returns to that button |
| Direction unlock | **Artifact popup arrows only** (not theme carousel) |
| Scrim | Visibly lighter; no specific opacity |
| Doc Next Image announce | `Page X of Y of [document name]. For full text, go to Transcript.` then document guided description |
| 1s vs 4s timing | **1s** between auto-read Story → guided; **4s** only when auto-read drops you on next controls — **not** for manual Story press |
| Content | One master CSV → `artifacts.js` + theme pages + home blurbs |
| SR CSV | Reformat `docs/screen-reader-announcements.csv` to match reference org; delete reference file |

---

## Content fields (no change)

Story intro = existing `description`. Condensed guided = existing `guidedDescription` (per image where applicable). Do **not** rename, split, or rewrite these fields for this feature — only change how the popup shows/transitions between them.

---

## Punchlist (open)

| Item | Why it is open |
|------|----------------|
| **H. Master content CSV** | Still the long-term goal. Adventure Story/Guided Description was applied from `APH_3HK7_Descriptions_260826.odt`; Change, Together, and Work still have ~16 pending paragraph edits in that same file. |
| **Scroll-to-end announcement** | Previously ruled out of scope: leaving the text panel is silent apart from the button label the focus lands on. Revisit only if testing shows visitors get lost. |
| **Dead `artifact-popup--video-active` class** | Applied in JSX with no matching CSS rule (pre-existing). Harmless; delete on the next cleanup pass. |
| **Adventure image cuts** | .odt comments ask whether to cut `3A2Lunch2` and the Italian veteran reverse (`3A5ItalyVet2`). Kept both images and swapped copy only. |
| **Full NVDA pass** | Behavior verified by build + code review only. Focus order, gold outline, and the return-to-button flow still need a hardware/NVDA run. |
