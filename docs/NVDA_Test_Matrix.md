# NVDA Settings Test Matrix

Use this document to track which NVDA configurations affect deterministic output.
Test each profile against the announcement contract for artifact 3A2.

---

## Target NVDA Version

Record the exact version under test here:
- NVDA version: ___________
- Windows version: ___________
- Electron version: ___________
- Braille display model: ___________

---

## Profiles

### Profile A — Baseline (Default NVDA)

| Setting Category | Setting | Value |
|---|---|---|
| Speech | Speech mode | Talk |
| Speech | Speak typed characters | Off |
| Speech | Speak typed words | Off |
| Browse Mode | Report live regions | Yes |
| Braille | Output | Follow cursors |
| Braille | Tether | Automatically |
| Braille | Show messages | Use timeout |
| Braille | Message timeout | 4 sec |
| Braille | Interrupt speech while scrolling | Yes |
| Braille | Focus context presentation | Fill display for context changes |
| Advanced | Report live regions | Yes (default) |

### Profile B — Low Verbosity

| Setting Category | Setting | Value |
|---|---|---|
| Speech | Speech mode | Talk |
| Speech | Speak typed characters | Off |
| Speech | Speak typed words | Off |
| Object Presentation | Report object role | Off |
| Object Presentation | Report object state | Off |
| Object Presentation | Report object position | Off |
| Browse Mode | Report live regions | Yes |
| Braille | Output | Follow cursors |
| Braille | Tether | Automatically |
| Braille | Show messages | Use timeout |
| Braille | Message timeout | 4 sec |

### Profile C — Braille-Focused (speech off)

| Setting Category | Setting | Value |
|---|---|---|
| Speech | Speech mode | Off |
| Braille | Output | Display speech output |
| Braille | Tether | Automatically |
| Braille | Show messages | Use timeout |
| Braille | Message timeout | 6 sec |
| Braille | Interrupt speech while scrolling | No |
| Braille | Focus context presentation | Only when scrolling back |
| Browse Mode | Report live regions | Yes |

---

## Test Log Template

Copy this table for each test session. One row per event from the announcement contract.

Policy reminder for this matrix:
- Focus/navigation events should be emitted as `assertive`.
- Expected behavior is interruption of prior speech for those events.

| # | Event | Expected Speech | Observed Speech | Match? | Expected Braille | Observed Braille | Match? | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Focus on title | `Japanese Luncheon Set, 1948` | | | `Japanese Luncheon Set, 1948` | | | |
| 2 | Focus on description | (full description text) | | | (truncated) | | | |
| 3 | Focus carousel surface | `Image carousel, 2 images, press Enter to open` | | | `Image carousel, 2 images` | | | |
| 4 | Enter expanded | `Expanded view. Image 1 of 2. {alt}` | | | `Expanded view. Image 1 of 2` | | | |
| 5 | Next image | `Image 2 of 2` | | | `Image 2 of 2` | | | |
| 6 | Prev image | `Image 1 of 2` | | | `Image 1 of 2` | | | |
| 7 | Enter zoom | `Zoom mode. Use controls to zoom and pan.` | | | `Zoom mode` | | | |
| 8 | Zoom in | `Zoomed in. {N} percent.` | | | `Zoomed in. {N}%` | | | |
| 9 | Zoom out | `Zoomed out. {N} percent.` | | | `Zoomed out. {N}%` | | | |
| 10 | Pan direction | `Panned {dir}.` | | | `Panned {dir}` | | | |
| 11 | Reset zoom | `Reset. Fit to screen.` | | | `Reset. Fit to screen` | | | |
| 12 | Exit zoom | `Exited zoom mode.` | | | `Exited zoom mode` | | | |
| 13 | Open guided desc | `Guided description opened for image {N} of {total}.` | | | `Guided desc image {N}/{total}` | | | |
| 14 | Close guided desc | `Closed guided description.` | | | `Closed guided desc` | | | |
| 15 | Open transcript | `Transcript opened for current image.` | | | `Transcript opened` | | | |
| 16 | Close transcript | `Closed transcript.` | | | `Closed transcript` | | | |
| 17 | Exit expanded | `Exited navigation mode.` | | | `Exited navigation mode` | | | |
| 18 | Focus Next Artifact | `Next Artifact` | | | `Next Artifact` | | | |
| 19 | Focus Prev Artifact | `Previous Artifact` | | | `Previous Artifact` | | | |
| 20 | Focus Back to Theme | `Back to theme, return to artifact list` | | | `Back to Theme` | | | |

---

## Known Settings That Cause Drift

Track any setting toggle that changes observed output unexpectedly.

| Setting | Change | Effect on Output |
|---|---|---|
| | | |

---

## Session Log

| Date | Profile | Tester | Pass/Fail | Notes |
|---|---|---|---|---|
| | | | | |
