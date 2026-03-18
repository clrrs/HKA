# Announcement Contract: Japanese Luncheon Set (3A2)

Reference artifact for deterministic NVDA speech + braille output.
All other artifact pages will follow this same contract pattern once validated.

---

## Notation

| Column | Meaning |
|---|---|
| **Event** | User action or system trigger |
| **Speech Phrase** | Exact text NVDA should speak |
| **Politeness** | `assertive` (interrupts) or `polite` (queued) |
| **Braille Text** | Expected braille display content (same as speech unless noted) |
| **Interrupt** | Whether this announcement should cut off the previous one |
| **Dedupe** | If repeated rapidly, suppress duplicates within window |

---

## 1. Scene Entry (arriving at artifact page)

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Focus lands on title | `Japanese Luncheon Set, 1948` | assertive | `Japanese Luncheon Set, 1948` | yes | — |
| Focus lands on description | `Kazuo Honma, the founder of the Japanese Braille Library, gifted Helen a New Year's luncheon set in 1948. The black lacquer set has gold symbols and carved abalone inlays, all set in a carrying stand with a brass handle. It contains six drawers, six trays, and a pair of cylindrical flasks.` | assertive | (first ~40 chars on display) | yes | — |

## 2. Carousel — Surface View

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Focus lands on carousel surface | `Image carousel, 2 images, press Enter to open` | assertive | `Image carousel, 2 images` | yes | — |

## 3. Carousel — Expanded View

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Enter expanded view | `Expanded view. Image 1 of 2. Black lacquer Japanese luncheon set with gold decorative symbols, shown from the front view displaying the carrying stand with brass handle` | assertive | `Expanded view. Image 1 of 2` | yes | — |
| Next image (to image 2) | `Image 2 of 2` | assertive | `Image 2 of 2` | yes | 200ms |
| Previous image (to image 1) | `Image 1 of 2` | assertive | `Image 1 of 2` | yes | 200ms |
| Exit expanded view | `Exited navigation mode.` | assertive | `Exited navigation mode` | yes | — |

## 4. Carousel — Zoom Mode

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Enter zoom | `Zoom mode. Use controls to zoom and pan.` | assertive | `Zoom mode` | yes | — |
| Zoom in | `Zoomed in. {N} percent.` | assertive | `Zoomed in. {N}%` | yes | 150ms |
| Zoom in at max | `Maximum zoom.` | assertive | `Maximum zoom` | yes | 300ms |
| Zoom out | `Zoomed out. {N} percent.` | assertive | `Zoomed out. {N}%` | yes | 150ms |
| Zoom out at min | `Minimum zoom.` | assertive | `Minimum zoom` | yes | 300ms |
| Pan up | `Panned up.` | assertive | `Panned up` | yes | 150ms |
| Pan up at limit | `Top limit reached.` | assertive | `Top limit` | yes | 300ms |
| Pan down | `Panned down.` | assertive | `Panned down` | yes | 150ms |
| Pan down at limit | `Bottom limit reached.` | assertive | `Bottom limit` | yes | 300ms |
| Pan left | `Panned left.` | assertive | `Panned left` | yes | 150ms |
| Pan left at limit | `Left limit reached.` | assertive | `Left limit` | yes | 300ms |
| Pan right | `Panned right.` | assertive | `Panned right` | yes | 150ms |
| Pan right at limit | `Right limit reached.` | assertive | `Right limit` | yes | 300ms |
| Reset zoom | `Reset. Fit to screen.` | assertive | `Reset. Fit to screen` | yes | — |
| Exit zoom | `Exited zoom mode.` | assertive | `Exited zoom mode` | yes | — |

## 5. Guided Description

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Open guided description | `Guided description opened for image {N} of {total}.` | assertive | `Guided desc image {N}/{total}` | yes | — |
| Close guided description (button) | `Closed guided description.` | assertive | `Closed guided desc` | yes | — |
| Close guided description (Escape) | `Closed guided description.` | assertive | `Closed guided desc` | yes | — |

## 6. Transcript

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Open transcript | `Transcript opened for current image.` | assertive | `Transcript opened` | yes | — |
| Close transcript (button) | `Closed transcript.` | assertive | `Closed transcript` | yes | — |
| Close transcript (Escape) | `Closed transcript.` | assertive | `Closed transcript` | yes | — |

## 7. Navigation Buttons

| Event | Speech Phrase | Politeness | Braille Text | Interrupt | Dedupe |
|---|---|---|---|---|---|
| Focus "Next Artifact" | `Next Artifact` | assertive | `Next Artifact` | yes | — |
| Focus "Previous Artifact" | `Previous Artifact` | assertive | `Previous Artifact` | yes | — |
| Focus "Back to Theme" | `Back to theme, return to artifact list` | assertive | `Back to Theme` | yes | — |

---

## Sequence Invariants

1. On scene entry, title is always announced before description.
2. Entering expanded view always announces the full alt text of the current image.
3. Navigating images (next/prev) never re-announces alt text — only position.
4. Zoom/pan actions always interrupt the previous zoom/pan announcement.
5. Opening guided description or transcript always interrupts any carousel announcement.
6. Closing a modal (guided/transcript) always returns focus announcement to the parent layer.
7. No two live-region announcements may fire within 50ms of each other (minimum separation).
8. Focus/navigation events are always routed as assertive announcements and interrupt previous speech.

---

## Open Questions (to validate during testing)

- [ ] Does NVDA read the `aria-label` on the carousel surface button verbatim, or does it append role information ("button")?
- [ ] When entering expanded view, does the focus-trap auto-focus announcement collide with the live-region announcement?
- [ ] What is the braille display truncation behavior for long alt text on expanded entry?
- [ ] Does the `aria-atomic="true"` on the announcer div cause full re-reads on rapid updates?
