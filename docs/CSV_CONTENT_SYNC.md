# Content matrix → `artifacts.js`

All copy is in [`src/renderer/data/artifacts.js`](../src/renderer/data/artifacts.js).

| CSV column | Code field |
|------------|------------|
| Content/Copy | `description` |
| Transcript | `transcriptText` |
| Guided Visual Description | `guidedDescription` |

Display-only fields (`displayTitle`, `year`, `type`, media paths) are not in the CSV.

## Guided description presentation

All themes use `descriptionMode: "sections"`. The artifact popup shows the artifact
title, the `description` paragraph as context, then one guided section per image —
all visible at once in a single scrollable panel.

In `sections` mode each guided section is headed by a label derived from the
artifact's `type`:

| `type` | Heading |
|--------|---------|
| `photograph` | Photograph Description |
| `document` | Document Description |
| `object` | Object Description |
| `video` | Video Description |

Multi-image layout depends on artifact type and `guidedDescriptionMode`:

| Case | Tagline | Guided sections |
|------|---------|-----------------|
| Multi-page `document` (default) | none | One section using artifact `guidedDescription` |
| `document` with `guidedDescriptionMode: "letters"` | `Letter N of X` (section heading) | One section per `letterSections[]` entry |
| Multi-image photograph / object | `Image N of X` | One section per image |

`letterSections` entries support `guidedDescription` (visual copy) and optional
`imageIndices` (which scanned pages belong to that letter). Student Christmas
Letters (`2A4`) is the letters case.

`type` also still drives media rendering: `video` plays `videoSrc`, everything else
renders `images`.

## Auto-read chunking

Auto-read speaks one chunk per rendered block — the context paragraph plus each
guided section. The panel scrolls the block being spoken to the top and auto-scrolls
only through that block. Short lines on the right edge of the panel mark where each
block starts, and the line for the block being spoken turns gold.

Video artifacts are the exception: auto-read speaks the body copy and then hands off
to playback, and the guided copy is spoken once more just before the video starts so
it lands on the braille display.

## Screen # → artifact `id`

| Theme | CSV screen #s | IDs |
|-------|---------------|-----|
| 1 - Change | 1.3–1.8 | 1A1–1A6 |
| 2 - Together | 2.3–2.8 | 2A1–2A6 |
| 3 - Adventure | 3.3–3.9 | 3A1–3A7 |
| 4 - Work | 4.3–4.8 | 4A1–4A6 |

When a new content matrix CSV arrives, diff `description` / `guidedDescription` / `transcriptText` per artifact and update only what changed.

Empty or missing `transcriptText` still shows the Transcript action. The UI placeholder is **MISSING COPY** (see `textOrMissing` in [`contentPlaceholder.js`](../src/renderer/data/contentPlaceholder.js)).

`guidedDescription` on the artifact supplies the first image's guided section. Images
after the first read their own `guidedDescription` from the `images[]` entry, and
render **MISSING COPY** until that copy exists. To hide those sections instead of
showing the placeholder, set `HIDE_MISSING_GUIDED_SECTIONS = true` in
[`ArtifactPopup.jsx`](../src/renderer/components/ArtifactPopup.jsx).
