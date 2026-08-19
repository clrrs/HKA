# Content matrix → `artifacts.js`

All copy is in [`src/renderer/data/artifacts.js`](../src/renderer/data/artifacts.js).

| CSV column | Code field |
|------------|------------|
| Content/Copy | `description` |
| Transcript | `transcriptText` |
| Guided Visual Description | `guidedDescription` |
| Combined description (Adventure only) | `paragraphs` |

Display-only fields (`displayTitle`, `year`, `type`, media paths) are not in the CSV.

## Guided description presentation modes

Each theme carries a `descriptionMode` that decides how the artifact popup lays out
guided descriptions. This is the A/B switch — changing the one string on a theme
swaps its whole presentation.

| Mode | Themes | Text panel |
|------|--------|------------|
| `combined` | Adventure | Artifact title, then the `paragraphs` array as body copy. No guided heading and no image tagline; the visual description is already folded into the paragraphs. |
| `sections` | Change, Together, Work | Artifact title, the `description` paragraph, then one guided section per image — all visible at once in a single scrollable panel. |

In `sections` mode each guided section is headed by a label derived from the
artifact's `type`, followed by an `Image N of X` tagline when the artifact has more
than one image:

| `type` | Heading |
|--------|---------|
| `photograph` | Photograph Description |
| `document` | Document Description |
| `object` | Object Description |
| `video` | Video Description |

`type` also still drives media rendering: `video` plays `videoSrc`, everything else
renders `images`.

`paragraphs` only applies in `combined` mode. When it is absent the panel falls back
to the single `description` string, so an artifact without it still renders.

## Auto-read chunking

Auto-read speaks one chunk per rendered block — each body paragraph in `combined`
mode, and the context paragraph plus each guided section in `sections` mode. The
panel scrolls the block being spoken to the top and auto-scrolls only through that
block. Short lines on the right edge of the panel mark where each block starts, and
the line for the block being spoken turns gold.

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

When a new content matrix CSV arrives, diff `description` / `guidedDescription` / `transcriptText` / `paragraphs` per artifact and update only what changed.

Empty or missing `transcriptText` still shows the Transcript action. The UI placeholder is **MISSING COPY** (see `textOrMissing` in [`contentPlaceholder.js`](../src/renderer/data/contentPlaceholder.js)).

`guidedDescription` on the artifact supplies the first image's guided section. Images
after the first read their own `guidedDescription` from the `images[]` entry, and
render **MISSING COPY** until that copy exists. To hide those sections instead of
showing the placeholder, set `HIDE_MISSING_GUIDED_SECTIONS = true` in
[`ArtifactPopup.jsx`](../src/renderer/components/ArtifactPopup.jsx).
