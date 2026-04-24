# Content matrix → `artifacts.js`

All copy is in [`src/renderer/data/artifacts.js`](../src/renderer/data/artifacts.js).

| CSV column | Code field |
|------------|------------|
| Content/Copy | `description` |
| Transcript | `transcriptText` |
| Guided Visual Description | `guidedDescription` |

Display-only fields (`displayTitle`, `year`, `type`, media paths) are not in the CSV.

## Screen # → artifact `id`

| Theme | CSV screen #s | IDs |
|-------|---------------|-----|
| 1 - Change | 1.3–1.8 | 1A1–1A6 |
| 2 - Together | 2.3–2.8 | 2A1–2A6 |
| 3 - Adventure | 3.3–3.9 | 3A1–3A7 |
| 4 - Work | 4.3–4.8 | 4A1–4A6 |

When a new content matrix CSV arrives, diff `description` / `guidedDescription` / `transcriptText` per artifact and update only what changed.

Empty or missing `transcriptText` / `guidedDescription` still show the Transcript and Guided Description actions; the UI placeholder is **MISSING COPY** (see `textOrMissing` in [`contentPlaceholder.js`](../src/renderer/data/contentPlaceholder.js)).
