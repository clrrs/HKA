#!/usr/bin/env node
/**
 * Scan renderer source and export curated screen-reader copy to CSV.
 * Run from repo root: npm run export:sr
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RENDERER_ROOT = path.join(ROOT, "src", "renderer");
const OUT_PATH = path.join(ROOT, "docs", "screen-reader-announcements.csv");

const COLUMNS = [
  "type",
  "location",
  "trigger",
  "scenario",
  "message",
  "source_file",
  "line",
  "politeness",
  "notes",
];

/** @type {Array<Record<string, string>>} */
const rows = [];

function relPath(absPath) {
  return path.relative(ROOT, absPath).replaceAll("\\", "/");
}

function normalizeText(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function addRow(entry) {
  const row = {
    type: entry.type ?? "",
    location: entry.location ?? "",
    trigger: entry.trigger ?? "",
    scenario: entry.scenario ?? "",
    message: entry.message ?? "",
    source_file: entry.source_file ?? "",
    line: entry.line != null ? String(entry.line) : "",
    politeness: entry.politeness ?? "n/a",
    notes: entry.notes ?? "",
  };
  if (!row.scenario) {
    row.scenario = inferProducerScenario(row);
  }
  rows.push(row);
}

/** Plain-English description of when a visitor hears this copy. */
function inferProducerScenario(row) {
  const { type, location, message, line, notes } = row;
  const msg = message.toLowerCase();

  // --- App ---
  if (location === "App" && line === "164") {
    return "Visitor dismisses the idle-timeout warning by pressing a key; the screen reader re-announces whatever control they were on.";
  }
  if (location === "App" && msg.includes("still there? press any key")) {
    return "Visitor has been inactive for several minutes; the idle warning overlay appears and interrupts with this spoken alert.";
  }
  if (location === "App" && message === "Accessibility Settings") {
    return "Visitor opens Accessibility Settings (Settings key); NVDA reads the dialog title.";
  }
  if (location === "App" && notes.includes("test-easter-egg-message")) {
    return "Developer test easter egg only — not part of the public visitor experience.";
  }
  if (location === "App" && message === "Still there?" && type === "dialog-title") {
    return "Part of the idle-warning dialog — NVDA reads this as the dialog heading.";
  }
  if (location === "App" && message === "Press any key to stay") {
    return "Part of the idle-warning dialog — NVDA reads this as the dialog instructions.";
  }

  // --- AccessibilityMenu ---
  if (location === "AccessibilityMenu" && notes.includes("accessibility-onboarding-blurb")) {
    return "First launch: visitor sees the accessibility settings onboarding dialog; NVDA reads this intro paragraph before focus moves to a button.";
  }
  if (
    location === "AccessibilityMenu" &&
    message.includes("Press the Select key to stick with these settings")
  ) {
    return "Right after the onboarding intro, focus lands on the Skip button and the visitor hears this follow-up instruction.";
  }

  // --- AttractScene ---
  if (location === "AttractScene" && notes.includes("ATTRACT_BRAILLE_LABEL_TEST")) {
    return "Internal braille-label test string — not used in the live visitor flow.";
  }
  if (location === "AttractScene" && message.includes("Helen Keller Archives")) {
    return "Attract loop is showing; visitor focuses the attract screen and hears the welcome plus headphones reminder.";
  }

  // --- InstructionScene ---
  if (location === "InstructionScene" && message === "Skip instructions") {
    return "Instruction video is playing; visitor tabs to Skip and hears this label.";
  }

  // --- HomeScene ---
  if (location === "HomeScene" && notes.includes("HOME_HEADING_LABEL")) {
    return "Home page heading text used when speech mode is on (read on focus).";
  }
  if (location === "HomeScene" && line === "74") {
    return "On Home, visitor pauses on a theme circle for 3 seconds with speech on; a live announcement plays the theme summary.";
  }
  if (location === "HomeScene" && message.includes("instructional video for help")) {
    return "Visitor tabs to the help (?) button on Home and hears this label.";
  }
  if (location === "HomeScene" && notes.includes("announceHomeArrival")) {
    return "Visitor returns to Home with speech on; the heading is focused and NVDA reads 'Home.' plus the main instructions.";
  }
  if (location === "HomeScene" && message === "Theme selection") {
    return "Structural label for the theme carousel (mostly hidden from sighted view).";
  }
  if (location === "HomeScene" && msg.includes("{theme.label}")) {
    return "Visitor moves between theme circles with the arrow keys; each circle announces its name and position.";
  }
  if (location === "HomeScene" && message === "Instructional video") {
    return "Visitor opens the help video overlay; NVDA reads the video dialog label.";
  }
  if (location === "HomeScene" && message === "Close instructional video") {
    return "Visitor tabs to Close inside the help video overlay.";
  }

  // --- QuoteScene ---
  if (location === "QuoteScene") {
    return "Visitor selects a theme and sees the full-screen quote; NVDA reads the theme name plus 'theme quote'.";
  }

  // --- ThemeScene ---
  if (location === "ThemeScene" && row.trigger.includes("getThemeTipMessage")) {
    return "Template for the tip heard the first time a visitor enters any theme page.";
  }
  if (location === "ThemeScene" && row.trigger.includes("getThemePageAnnouncement")) {
    return "Template for the theme intro heard after the first-visit tip is dismissed.";
  }
  if (location === "ThemeScene" && line === "120") {
    return "First time visiting a theme page: visitor hears a navigation tip as soon as the page loads.";
  }
  if (location === "ThemeScene" && line === "129") {
    return "First time visiting a theme page: visitor dismisses the tip (any key or tap); the theme name and description are announced.";
  }
  if (location === "ThemeScene" && notes.includes("speechMode")) {
    return "On a theme page with speech on, visitor focuses the heading and hears the theme name, description, and navigation hint.";
  }
  if (location === "ThemeScene" && message === "Artifact selection") {
    return "Structural label for the artifact bubble carousel.";
  }

  // --- Theme blurbs (data-field) ---
  if (type === "data-field" && location === "artifacts") {
    return `On Home with speech on, visitor pauses on the ${row.trigger.match(/— (.+?) \(/)?.[1] ?? "theme"} circle for 3 seconds and hears this summary.`;
  }
  if (location === "artifacts" && notes.includes("getThemeFocusAnnouncement")) {
    return "Code template that builds the 3-second theme-circle announcements on Home.";
  }

  // --- ArtifactPopup live-announce ---
  if (location === "ArtifactPopup" && type === "live-announce") {
    if (message.includes("{artifact.title}") && msg.includes("opened")) {
      return "Visitor opens an artifact; NVDA interrupts to announce the artifact title plus 'opened.'";
    }
    if (
      line === "334" ||
      notes.includes("AUTO_READ_COMPLETE_INSTRUCTION") ||
      message.includes("artifact control menu")
    ) {
      return "After auto-read finishes reading the artifact description aloud, visitor hears what to do next.";
    }
    if (message === "[chunk.text]") {
      return "While auto-read is running, each chunk of the artifact description is spoken in sequence.";
    }
    if (msg.includes("image") && msg.includes("of")) {
      return "Visitor moves to the next image in a multi-image artifact; NVDA announces the image number and alt text.";
    }
    if (message === "Transcript closed.") {
      return "Visitor closes the transcript panel inside the artifact popup.";
    }
    if (message === "Transcript opened.") {
      return "Visitor opens the transcript panel inside the artifact popup.";
    }
    if (message === "Guided description opened.") {
      return "Visitor opens the guided description panel inside the artifact popup.";
    }
    if (message === "Guided description closed.") {
      return "Visitor closes the guided description panel inside the artifact popup.";
    }
    if (message.includes("Zoom mode")) {
      return "Visitor enters zoom mode on an artifact image; NVDA explains how to scroll the image.";
    }
    if (message === "Exited zoom mode.") {
      return "Visitor exits zoom mode and returns to the normal artifact popup.";
    }
    if (message === "[label]" && line === "577") {
      return "Visitor tabs past the last control in the artifact popup onto the next-artifact arrow at the end of the list; NVDA reads the arrow label (next artifact name or close).";
    }
    if (message === "[label]" && line === "585") {
      return "Visitor tabs backward past the first control onto the previous-artifact arrow; NVDA reads the arrow label (previous artifact name or close).";
    }
    if (message === "Top of image.") {
      return "Visitor tries to scroll up in zoom mode but is already at the top of the image.";
    }
    if (message === "Bottom of image.") {
      return "Visitor tries to scroll down in zoom mode but is already at the bottom of the image.";
    }
    if (msg.includes("step") && msg.includes("of")) {
      return "Visitor steps through the zoomed image one section at a time; NVDA announces the current step number.";
    }
  }

  // --- ArtifactPopup aria-label ---
  if (location === "ArtifactPopup" && type === "aria-label") {
    if (msg.includes("artifact details")) {
      return "Artifact popup opens; NVDA reads the dialog label with the artifact title.";
    }
    if (notes.includes("Previous artifact")) {
      return "Visitor tabs to the left nav arrow in the artifact popup.";
    }
    if (notes.includes("Next artifact")) {
      return "Visitor tabs to the right nav arrow in the artifact popup.";
    }
    if (message === "Artifact controls") {
      return "Visitor tabs into the artifact control toolbar.";
    }
    if (message === "Next image") {
      return "Visitor tabs to the next-image button (multi-image artifacts only).";
    }
    if (message === "Transcript" && line === "868") {
      return "Visitor tabs to the Transcript button in the artifact toolbar.";
    }
    if (message === "Guided description" && line === "880") {
      return "Visitor tabs to the Guided Description button in the artifact toolbar.";
    }
    if (notes.includes("Play video")) {
      return "Visitor tabs to the Play/Zoom button; label switches between Play video and Zoom.";
    }
    if (notes.includes("speechLabel")) {
      return "With speech on, visitor tabs to the artifact title/description area and hears the full spoken label.";
    }
    if (message === "Transcript" && line === "927") {
      return "Transcript panel is open; visitor focuses the panel.";
    }
    if (message === "Close transcript") {
      return "Visitor tabs to Close inside the transcript or guided-description panel.";
    }
    if (message === "Guided description" && line === "959") {
      return "Guided description panel is open; visitor focuses the panel.";
    }
    if (message === "Image zoom view") {
      return "Visitor enters zoom mode; NVDA reads the zoom dialog label.";
    }
    if (message === "Zoom scroll controls") {
      return "Visitor tabs into the zoom scroll toolbar.";
    }
    if (message === "Snap image view") {
      return "Structural label for the snap-scroll arrow group in zoom mode.";
    }
    if (message === "Snap view up one step") {
      return "Visitor tabs to the up-arrow in zoom mode.";
    }
    if (message === "Snap view down one step") {
      return "Visitor tabs to the down-arrow in zoom mode.";
    }
    if (message === "Exit zoom mode") {
      return "Visitor tabs to Exit zoom mode in the zoom toolbar.";
    }
  }

  // --- ArtifactVideoOverlay ---
  if (location === "ArtifactVideoOverlay") {
    const labels = {
      "Artifact video player": "Visitor plays a video artifact; the video overlay opens.",
      "Artifact video controls": "Visitor tabs into the video control toolbar.",
      "Open guided description": "Visitor tabs to Open guided description in the video overlay.",
      "Open transcript": "Visitor tabs to Open transcript in the video overlay.",
      "Close video player": "Visitor tabs to Close and leaves the video overlay.",
      Transcript: "Transcript or guided-description panel is open in the video overlay.",
      "Close guided description": "Visitor tabs to Close inside the guided-description panel.",
    };
    if (labels[message]) return labels[message];
    if (notes.includes("videoAlt")) {
      return "Video overlay shows a poster/thumbnail; NVDA reads the video alt text or 'Video preview'.";
    }
    if (notes.includes("Pause video")) {
      return "Visitor tabs to the play/pause button; label switches between Play video and Pause video.";
    }
    if (message === "Close transcript") {
      return "Visitor tabs to Close inside the transcript panel in the video overlay.";
    }
  }

  // --- VideoPlayer ---
  if (location === "VideoPlayer") {
    const labels = {
      "Video player": "Help/instruction video overlay is open.",
      "Play video": "Visitor tabs to Play in the instruction video player.",
      "Pause video": "Visitor tabs to Pause in the instruction video player.",
      "Open transcript": "Visitor tabs to Open transcript in the instruction video player.",
      "Open guided description": "Visitor tabs to Open guided description in the instruction video player.",
      Transcript: "Transcript panel is open in the instruction video player.",
      "Close transcript": "Visitor tabs to Close in the transcript panel.",
      "Guided description": "Guided description panel is open in the instruction video player.",
      "Close guided description": "Visitor tabs to Close in the guided description panel.",
    };
    if (labels[message]) return labels[message];
  }

  // --- ZoomControls ---
  if (location === "ZoomControls" && type === "live-announce") {
    const zoomMsgs = {
      "maximum zoom.": "Visitor zooms in but is already at maximum zoom.",
      "minimum zoom.": "Visitor zooms out but is already at minimum zoom.",
      "panned up.": "Visitor pans the zoomed image upward.",
      "panned down.": "Visitor pans the zoomed image downward.",
      "panned left.": "Visitor pans the zoomed image left.",
      "panned right.": "Visitor pans the zoomed image right.",
      "top limit reached.": "Visitor tries to pan up but has hit the top edge.",
      "bottom limit reached.": "Visitor tries to pan down but has hit the bottom edge.",
      "left limit reached.": "Visitor tries to pan left but has hit the left edge.",
      "right limit reached.": "Visitor tries to pan right but has hit the right edge.",
      "reset. fit to screen.": "Visitor resets zoom so the image fits the screen again.",
    };
    if (zoomMsgs[msg]) return zoomMsgs[msg];
    if (msg.includes("zoomed in")) {
      return "Visitor zooms in on an artifact image; NVDA announces the new zoom percentage.";
    }
    if (msg.includes("zoomed out")) {
      return "Visitor zooms out on an artifact image; NVDA announces the new zoom percentage.";
    }
  }
  if (location === "ZoomControls" && type === "aria-label") {
    const labels = {
      "Zoom and pan controls": "Visitor tabs into the zoom/pan toolbar.",
      "Zoom in": "Visitor tabs to Zoom in.",
      "Zoom out": "Visitor tabs to Zoom out.",
      "Pan left": "Visitor tabs to Pan left.",
      "Pan up": "Visitor tabs to Pan up.",
      "Pan down": "Visitor tabs to Pan down.",
      "Pan right": "Visitor tabs to Pan right.",
      "Reset zoom": "Visitor tabs to Reset zoom.",
      "Exit Zoom Mode": "Visitor tabs to Exit zoom mode.",
    };
    if (labels[message]) return labels[message];
  }

  // --- AnnouncerProvider internals ---
  if (location === "AnnouncerProvider") {
    return "Internal developer debug tooling — not heard by visitors.";
  }

  // --- Fallbacks ---
  if (type === "aria-label") {
    return `Visitor tabs to a control on the ${location} screen and NVDA reads this label.`;
  }
  if (type === "live-announce") {
    return `A live-region announcement fires during ${location} interaction.`;
  }
  if (type === "helper-fn") {
    if (location === "ArtifactPopup" && notes.includes("AUTO_READ_COMPLETE_INSTRUCTION")) {
      return "Spoken after auto-read finishes on an artifact — tells the visitor how to keep exploring.";
    }
    return `Reusable copy used by ${location}; see trigger column for where it is called.`;
  }
  if (type === "dialog-title") {
    return `NVDA reads this as a dialog or region title on the ${location} screen.`;
  }
  if (type === "aria-describedby") {
    return `NVDA reads this descriptive text when a dialog references it on the ${location} screen.`;
  }
  return `Screen reader copy on the ${location} screen.`;
}

function getLocation(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function escapeCsv(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, files);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractPoliteness(optionsText) {
  const match = optionsText.match(/politeness:\s*["'](\w+)["']/);
  return match ? match[1] : "assertive";
}

function extractSource(optionsText) {
  const match = optionsText.match(/source:\s*["']([^"']+)["']/);
  return match ? match[1] : "";
}

function findMatchingBrace(content, openIndex) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escape = false;

  for (let i = openIndex; i < content.length; i++) {
    const ch = content[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (!inDouble && !inTemplate && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && !inTemplate && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === "`") {
      inTemplate = !inTemplate;
      continue;
    }
    if (inSingle || inDouble || inTemplate) continue;

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractAriaLabels(content, filePath) {
  const location = getLocation(filePath);
  const rel = relPath(filePath);

  const staticDouble = /aria-label="([^"]*)"/g;
  let match;
  while ((match = staticDouble.exec(content)) !== null) {
    addRow({
      type: "aria-label",
      location,
      trigger: "Element receives focus",
      message: match[1],
      source_file: rel,
      line: lineNumberAt(content, match.index),
    });
  }

  const staticSingle = /aria-label='([^']*)'/g;
  while ((match = staticSingle.exec(content)) !== null) {
    addRow({
      type: "aria-label",
      location,
      trigger: "Element receives focus",
      message: match[1],
      source_file: rel,
      line: lineNumberAt(content, match.index),
    });
  }

  const staticJsx = /aria-label=\{["']([^"']*)["']\}/g;
  while ((match = staticJsx.exec(content)) !== null) {
    addRow({
      type: "aria-label",
      location,
      trigger: "Element receives focus",
      message: match[1],
      source_file: rel,
      line: lineNumberAt(content, match.index),
    });
  }

  const templateSameLine = /aria-label=\{`([^`]*)`\}/g;
  while ((match = templateSameLine.exec(content)) !== null) {
    addRow({
      type: "aria-label",
      location,
      trigger: "Element receives focus",
      message: match[1].replace(/\$\{([^}]+)\}/g, "{$1}"),
      source_file: rel,
      line: lineNumberAt(content, match.index),
      notes: "dynamic template",
    });
  }

  const dynamicStart = /aria-label=\{/g;
  while ((match = dynamicStart.exec(content)) !== null) {
    const openBrace = content.indexOf("{", match.index);
    const closeBrace = findMatchingBrace(content, openBrace);
    if (closeBrace === -1) continue;

    const expr = content.slice(openBrace + 1, closeBrace).trim();
    if (
      expr.startsWith('"') ||
      expr.startsWith("'") ||
      expr.startsWith("`")
    ) {
      continue;
    }

    addRow({
      type: "aria-label",
      location,
      trigger: "Element receives focus",
      message: "[dynamic]",
      source_file: rel,
      line: lineNumberAt(content, match.index),
      notes: expr.replace(/\s+/g, " "),
    });
  }
}

function extractAnnounceCalls(content, filePath) {
  const location = getLocation(filePath);
  const rel = relPath(filePath);

  const announceRegex = /announce\s*\(/g;
  let match;
  while ((match = announceRegex.exec(content)) !== null) {
    const start = match.index;
    const line = lineNumberAt(content, start);
    let i = start + match[0].length;

    while (i < content.length && /\s/.test(content[i])) i++;

    let message = "";
    let messageKind = "literal";
    const first = content[i];

    if (first === '"' || first === "'") {
      const quote = first;
      i++;
      let buf = "";
      let escaped = false;
      while (i < content.length) {
        const ch = content[i];
        if (escaped) {
          buf += ch;
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === quote) {
          break;
        } else {
          buf += ch;
        }
        i++;
      }
      message = buf;
    } else if (first === "`") {
      i++;
      let buf = "";
      let escaped = false;
      while (i < content.length) {
        const ch = content[i];
        if (escaped) {
          buf += ch;
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === "`") {
          break;
        } else if (ch === "$" && content[i + 1] === "{") {
          const close = content.indexOf("}", i);
          const expr = content.slice(i + 2, close);
          buf += `{${expr}}`;
          i = close + 1;
          continue;
        } else {
          buf += ch;
        }
        i++;
      }
      message = buf;
      messageKind = "template";
    } else {
      const closeParen = content.indexOf(")", i);
      const firstArg = content.slice(i, closeParen).split(",")[0].trim();
      message = `[${firstArg}]`;
      messageKind = "expression";
    }

    while (i < content.length && content[i] !== ")") i++;
    const optionsStart = content.indexOf("{", i);
    let politeness = "assertive";
    let sourceNote = "";
    if (optionsStart !== -1 && optionsStart < content.indexOf(";", optionsStart) + 200) {
      const optionsEnd = findMatchingBrace(content, optionsStart);
      if (optionsEnd !== -1) {
        const optionsText = content.slice(optionsStart, optionsEnd + 1);
        politeness = extractPoliteness(optionsText);
        const source = extractSource(optionsText);
        if (source) sourceNote = `source: ${source}`;
      }
    }

    let trigger = "Live-region announcement";
    if (location === "App" && message.includes("Still there")) {
      trigger = "Idle warning overlay appears";
    } else if (location === "ThemeScene" && messageKind === "expression") {
      trigger = "First visit to theme — tip or page intro";
    } else if (location === "HomeScene" && messageKind === "expression") {
      trigger = "Theme circle focused for 3s (speech mode)";
    } else if (location === "ArtifactPopup") {
      trigger = "Artifact popup interaction";
    } else if (location === "ZoomControls") {
      trigger = "Zoom / pan action";
    }

  const notes = [
      messageKind === "template" ? "dynamic template" : "",
      messageKind === "expression" ? "see message expression" : "",
      sourceNote,
    ]
      .filter(Boolean)
      .join("; ");

    addRow({
      type: "live-announce",
      location,
      trigger,
      message,
      source_file: rel,
      line,
      politeness,
      notes,
    });
  }
}

function extractStringConstants(content, filePath) {
  const location = getLocation(filePath);
  const rel = relPath(filePath);

  const constRegex =
    /const\s+([A-Z][A-Z0-9_]*)\s*=\s*(["'`])((?:\\.|(?!\2).)*)\2\s*;/gs;
  let match;
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1];
  if (!/(LABEL|INSTRUCTION|BLURB|MESSAGE)/i.test(name)) continue;
  if (/^ANNOUNCE_(LOG|TOOLS)_KEY$/.test(name)) continue;

    let value = match[3];
    if (match[2] === "`") {
      value = value.replace(/\$\{([^}]+)\}/g, "{$1}");
    }
    addRow({
      type: "helper-fn",
      location,
      trigger: `Referenced by announce() or aria-label (${name})`,
      message: value,
      source_file: rel,
      line: lineNumberAt(content, match.index),
      notes: `constant ${name}`,
    });
  }
}

function extractLabeledElements(content, filePath) {
  const location = getLocation(filePath);
  const rel = relPath(filePath);

  const tagRegex =
    /<(h[1-6]|p)\b([^>]*\sid="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const id = match[3];
    const inner = normalizeText(match[4].replace(/<[^>]+>/g, " "));
    if (!inner) continue;

    const isTitle = /^h[1-6]$/i.test(match[1]);
    addRow({
      type: isTitle ? "dialog-title" : "aria-describedby",
      location,
      trigger: isTitle
        ? "Dialog / region labelled by this element"
        : `Element references id="${id}" via aria-describedby`,
      message: inner,
      source_file: rel,
      line: lineNumberAt(content, match.index),
      notes: `id="${id}"`,
    });
  }
}

function extractHelperFunctions(content, filePath) {
  const location = getLocation(filePath);
  const rel = relPath(filePath);

  const fnRegex =
    /function\s+(getTheme\w+)\([^)]*\)\s*\{([\s\S]*?)\n\}/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const fnName = match[1];
    const body = match[2];
    const returnMatch = body.match(/return\s+(`[^`]+`|"[^"]+"|'[^']+')/s);
    if (!returnMatch) {
      const condReturns = [...body.matchAll(/return\s+(`[^`]+`|"[^"]+"|'[^']+')/gs)];
      if (condReturns.length) {
        const messages = condReturns.map((m) =>
          m[1]
            .slice(1, -1)
            .replace(/\$\{([^}]+)\}/g, "{$1}")
        );
        addRow({
          type: "helper-fn",
          location,
          trigger: `Called by announce() (${fnName})`,
          message: messages.join(" | "),
          source_file: rel,
          line: lineNumberAt(content, match.index),
          notes: "conditional returns",
        });
      }
      continue;
    }

    const raw = returnMatch[1];
    const message = raw
      .slice(1, -1)
      .replace(/\$\{([^}]+)\}/g, "{$1}");

    addRow({
      type: "helper-fn",
      location,
      trigger: `Called by announce() (${fnName})`,
      message,
      source_file: rel,
      line: lineNumberAt(content, match.index),
      notes: "template",
    });
  }
}

async function extractThemeBlurbs() {
  const artifactsPath = path.join(RENDERER_ROOT, "data", "artifacts.js");
  const mod = await import(pathToFileUrl(artifactsPath));
  const { themes, themeOrder } = mod;

  for (const themeId of themeOrder) {
    const theme = themes[themeId];
    if (!theme?.screenReaderBlurb) continue;

    const fullMessage = `${theme.screenReaderBlurb} Press select key to view the artifacts in this theme.`;
    addRow({
      type: "data-field",
      location: "artifacts",
      trigger: `Theme circle focused for 3s — ${theme.label} (speech mode)`,
      message: fullMessage,
      source_file: relPath(artifactsPath),
      line: "",
      notes: `screenReaderBlurb for theme "${themeId}"; expanded via getThemeFocusAnnouncement()`,
    });
  }
}

function pathToFileUrl(absPath) {
  return new URL(`file://${absPath.replace(/\\/g, "/")}`).href;
}

function sortRows() {
  rows.sort((a, b) => {
    const fileCmp = a.source_file.localeCompare(b.source_file);
    if (fileCmp !== 0) return fileCmp;
    const lineA = Number(a.line) || 0;
    const lineB = Number(b.line) || 0;
    return lineA - lineB;
  });
}

function writeCsv() {
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const header = COLUMNS.join(",");
  const body = rows
    .map((row) => COLUMNS.map((col) => escapeCsv(row[col])).join(","))
    .join("\n");
  fs.writeFileSync(OUT_PATH, `${header}\n${body}\n`, "utf8");
}

async function main() {
  const files = walkDir(RENDERER_ROOT);
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    extractAriaLabels(content, filePath);
    extractAnnounceCalls(content, filePath);
    extractStringConstants(content, filePath);
    extractLabeledElements(content, filePath);
    extractHelperFunctions(content, filePath);
  }

  await extractThemeBlurbs();
  sortRows();
  writeCsv();

  console.log(`Wrote ${rows.length} rows to ${relPath(OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
