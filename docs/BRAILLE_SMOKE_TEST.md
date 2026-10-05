# Braille Controller Client — smoke / regression matrix

Run on Windows with NVDA + Braille Viewer (and physical display when available).
Speech Viewer recordings before/after should match for wording, timing, and interruption.

## Preconditions

- [ ] NVDA running before app launch
- [ ] `nvda.ini` has `showMessages = 2` and `reportLiveRegions = disabled`
- [ ] `await window.kioskApi.brailleTest()` reports NVDA running
- [ ] Visitors use kiosk keys; braille panning only (routing may dismiss pages)

## Matrix

| Scenario | Speech (unchanged) | Braille expectation |
|----------|--------------------|---------------------|
| Home heading | Existing label | Focus page from heading |
| Home theme first focus | Delayed Image:/CTA after list+button | Immediate composite: list + name + button + description |
| Home theme L/R | Delayed description only | Immediate composite without repeating list preamble |
| Theme tip | Tip announce | Modal tip page; dismiss restores prior |
| Theme artifact focus | Button + describedby | Composite list + name + button + description |
| Quote intro | Intro announce then VO | Intro page then full quote page; speech cut for VO |
| Artifact open (speech on) | Title → alt → story chunks → toolbar hint | One page with title+alt+all story+hint at open |
| Artifact open (speech off) | Title + delayed alt | Same composite without story chunks |
| Auto-read pause/resume | Speech pause via Shift | Page unchanged until new interaction |
| Image/toolbar nav | Existing announces | Focus/status pages update on action |
| Transcript open/close | Window opened / closed | Modal full transcript; pop with closed status |
| Zoom open/close | Zoom opened / exited | Modal zoom; pop with exit status |
| Settings cycle/reset | Value announces | Status folded into settings modal page |
| Settings close | “Settings closed.” then control | Closed status + restored control page |
| Idle show | Still there? + buffer + digits | One stable idle page (no per-digit resends) |
| Idle dismiss | Idle warning dismissed | Prior page + dismiss status |
| Idle timeout → attract | Attract focus | Attract/welcome page |
| Media start (quote/video) | Ctrl speech stop | Page should remain; if cleared, set `window.__HKA_BRAILLE_RESEND_AFTER_STOP__ = true` and retest |
| Speech mode Off | No TTS | Braille pages still update |
| Rapid L/K | Speech follows focus | Latest composite page wins after coalesce |
| Long transcript pan | N/A | Pan across single page; truncation marker if over limit |
| Routing key dismiss | N/A | Next focus/action restores a page |
| DLL / NVDA missing | Unchanged | `brailleStatus` unavailable; DOM fallback only |

## Diagnostics

```js
window.__HKA_BRAILLE_TOOLS__.exportText()
window.__HKA_BRAILLE_SNAPSHOT__()
window.__HKA_EXPORT_DEBUG_LOGS__?.() // input + announce logs
```
