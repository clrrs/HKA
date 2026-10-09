/**
 * One-shot: apply APH content matrix CSV → artifacts.js themes object.
 * Preserves non-content fields (ids, media paths, snapPanDisabled, image alts, etc.).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const artifactsPath = path.join(root, "src/renderer/data/artifacts.js");
const csvPath = path.join(
  process.env.HOME,
  ".cursor/projects/Users-hka-Desktop-HKA/attachments/95b41a45-e5eb-49d3-91f1-7e8878913ff5/APH_3HK7_HelenKeller_ContentMatrix_Ready_2_Upload_.csv"
);

const TITLE_TO_ID = {
  "Video of Korean War Visit, 1953": "1A1",
  "IWW Conspiracy Speech, 1918": "1A2",
  "Women's Suffrage Speech, 1920": "1A3",
  "Letter from the ACLU, 1919": "1A4",
  "Letter to the NAACP, 1916": "1A5",
  "Letter from Eugene Debs, 1919": "2A1",
  "Letter to General MacArthur, 1949": "2A2",
  "Letter from Mark Twain, 1905": "2A3",
  "Student Christmas Letters, 1934": "2A4",
  "Arcan Ridge Door Knocker, 1947": "2A5",
  "Letter Requesting FDR Autograph, 1929": "2A6",
  "Helen Keller Takes a Ride in an Airplane": "3A1",
  "Japanese Luncheon Set": "3A2",
  "Photograph with Bantu Chief": "3A3",
  "Global Travel Schedule": "3A4",
  "Photograph of Helen Dancing with Italian Veteran, 1946": "3A5",
  "Photograph with Golda Meir, 1952": "3A6",
  "Syria Travel Itinerary, 1952": "3A7",
  "Corona Portable Typewriter, 1938": "4A1",
  "Evaluating a Braille Typewriter, 1954": "4A2",
  "Helen's Vaudeville Script, 1920s": "4A3",
  "Photograph with Charlie Chaplin, 1918": "4A4",
  "Letter of Admission to Radcliffe College, 1899": "4A5",
  "Perkins School Letter, 1886": "4A6",
};

function cleanCell(v) {
  if (v == null) return "";
  const t = String(v).trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  if (lower === "n/a" || lower === "n/a (in video)" || lower === "na") return "";
  return t;
}

function jsString(s) {
  return JSON.stringify(s);
}

function serializeValue(value, key, indent) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (key === "descriptionMode" && value === "sections") {
    return "DESCRIPTION_MODE_SECTIONS";
  }
  if (key === "descriptionMode" && value === "combined") {
    return "DESCRIPTION_MODE_COMBINED";
  }
  if (key === "guidedDescriptionMode" && value === "per-image") {
    return "GUIDED_DESCRIPTION_MODE_PER_IMAGE";
  }
  if (key === "guidedDescriptionMode" && value === "letters") {
    return "GUIDED_DESCRIPTION_MODE_LETTERS";
  }

  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return jsString(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((item) => `${padIn}${serializeValue(item, null, indent + 1)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const lines = keys.map((k) => {
      const v = value[k];
      // omit undefined
      if (v === undefined) return null;
      return `${padIn}${JSON.stringify(k)}: ${serializeValue(v, k, indent + 1)}`;
    }).filter(Boolean);
    return `{\n${lines.join(",\n")}\n${pad}}`;
  }

  throw new Error(`Cannot serialize ${typeof value}`);
}

function findArtifact(themes, id) {
  for (const theme of Object.values(themes)) {
    const art = (theme.artifacts || []).find((a) => a.id === id);
    if (art) return art;
  }
  return null;
}

function collectGuided(row) {
  const cols = [
    "Description (First Image)",
    "Description (Image 2)",
    "Description (Image 3)",
    "Description (Image 4)",
    "Description (Image 5)",
    "Description (Image 6)",
    "Description (Image 7)",
    "Decription (Image 8)",
  ];
  return cols.map((c) => cleanCell(row[c]));
}

function applyRow(art, row, report) {
  const alt = cleanCell(row["Alt Text"]);
  const story = cleanCell(row["Story"]);
  const transcript = cleanCell(row["Transcript"]);
  const guided = collectGuided(row);
  const nonemptyGuided = guided.filter(Boolean);

  if (alt && alt !== art.alt) {
    report.push(`${art.id} alt`);
    art.alt = alt;
  }
  if (story && story !== art.description) {
    report.push(`${art.id} story`);
    art.description = story;
  }
  if (transcript && transcript !== art.transcriptText) {
    report.push(`${art.id} transcript`);
    art.transcriptText = transcript;
    if (!art.transcriptTitle) art.transcriptTitle = "Transcript";
  }

  // Letters mode: map CSV image descriptions onto letterSections
  if (art.guidedDescriptionMode === "letters" && Array.isArray(art.letterSections)) {
    for (let i = 0; i < art.letterSections.length; i++) {
      const g = guided[i] || "";
      if (g && g !== art.letterSections[i].guidedDescription) {
        report.push(`${art.id} letter[${i}] guided`);
        art.letterSections[i].guidedDescription = g;
      }
    }
    return;
  }

  const images = art.images || [];
  const multiGuided = nonemptyGuided.length > 1;
  const isDoc = art.type === "document";

  // Multi-page documents with multiple guided texts → per-image
  if (isDoc && multiGuided && images.length > 1) {
    if (art.guidedDescriptionMode !== "per-image") {
      report.push(`${art.id} mode→per-image`);
      art.guidedDescriptionMode = "per-image";
    }
    for (let i = 0; i < images.length; i++) {
      const g = guided[i] || "";
      if (!g) continue;
      if (images[i].guidedDescription !== g) {
        report.push(`${art.id} guided[${i}]`);
        images[i].guidedDescription = g;
      }
    }
    if (art.guidedDescription) {
      delete art.guidedDescription;
      report.push(`${art.id} clear artifact guided`);
    }
    return;
  }

  // Single guided on artifact (or video with none)
  if (images.length <= 1) {
    const g0 = guided[0] || "";
    if (g0 && g0 !== art.guidedDescription) {
      report.push(`${art.id} guided[0]`);
      art.guidedDescription = g0;
    }
    return;
  }

  // Multi-image photo/object (or already per-image doc): image-level guided
  // Page 1 may live on artifact.guidedDescription or images[0]
  for (let i = 0; i < images.length; i++) {
    const g = guided[i] || "";
    if (!g) continue;
    if (i === 0) {
      // Prefer keeping existing pattern: if images[0] already has guided, update there;
      // else update artifact.guidedDescription (common for photos/objects).
      if (images[0].guidedDescription || art.guidedDescriptionMode === "per-image") {
        if (images[0].guidedDescription !== g) {
          report.push(`${art.id} guided[0]`);
          images[0].guidedDescription = g;
        }
        if (art.guidedDescriptionMode === "per-image" && art.guidedDescription) {
          delete art.guidedDescription;
        }
      } else if (art.guidedDescription !== g) {
        report.push(`${art.id} guided[0]`);
        art.guidedDescription = g;
      }
    } else if (images[i].guidedDescription !== g) {
      report.push(`${art.id} guided[${i}]`);
      images[i].guidedDescription = g;
    }
  }
}

/** Decode Windows-1252 bytes (Node TextDecoder often mishandles 0x80–0x9F). */
function decodeCp1252(buf) {
  const map = {
    0x80: 0x20ac,
    0x82: 0x201a,
    0x83: 0x0192,
    0x84: 0x201e,
    0x85: 0x2026,
    0x86: 0x2020,
    0x87: 0x2021,
    0x88: 0x02c6,
    0x89: 0x2030,
    0x8a: 0x0160,
    0x8b: 0x2039,
    0x8c: 0x0152,
    0x8e: 0x017d,
    0x91: 0x2018,
    0x92: 0x2019,
    0x93: 0x201c,
    0x94: 0x201d,
    0x95: 0x2022,
    0x96: 0x2013,
    0x97: 0x2014,
    0x98: 0x02dc,
    0x99: 0x2122,
    0x9a: 0x0161,
    0x9b: 0x203a,
    0x9c: 0x0153,
    0x9e: 0x017e,
    0x9f: 0x0178,
  };
  let out = "";
  for (const b of buf) {
    if (b >= 0x80 && b <= 0x9f && map[b]) out += String.fromCodePoint(map[b]);
    else out += String.fromCharCode(b);
  }
  return out;
}

function loadCsv(filePath) {
  const buf = fs.readFileSync(filePath);
  return parseCsvFallback(decodeCp1252(buf));
}

/** Structural flags from the a11y pass (not in the content matrix). Run before copy sync so FDR page index matches CSV. */
function applyStructuralFlags(themes, report) {
  const fdr = findArtifact(themes, "2A6");
  if (fdr?.images?.length >= 2) {
    const srcs = fdr.images.map((i) => i.src);
    if (srcs[0] === "2A6FDR1.png" && srcs[1] === "2A6FDR2.png") {
      // Helen note was first; swap so FDR letter is page 1 (matches CSV desc order).
      const [a, b] = fdr.images;
      fdr.images = [b, a];
      report.push("2A6 swap image order (FDR letter first)");
    }
  }

  const christmas = findArtifact(themes, "2A4");
  if (christmas?.images?.[0] && !christmas.images[0].snapPanDisabled) {
    christmas.images[0].snapPanDisabled = true;
    report.push("2A4 envelope snapPanDisabled");
  }

  const corona = findArtifact(themes, "4A1");
  if (corona?.images) {
    for (const img of corona.images) {
      if (!img.snapPanDisabled) {
        img.snapPanDisabled = true;
        report.push(`4A1 ${img.src} snapPanDisabled`);
      }
    }
  }
}

function parseCsvFallback(text) {
  const rows = [];
  let i = 0;
  const field = () => {
    if (text[i] === '"') {
      i++;
      let s = "";
      while (i < text.length) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') {
            s += '"';
            i += 2;
            continue;
          }
          i++;
          break;
        }
        s += text[i++];
      }
      return s;
    }
    let s = "";
    while (i < text.length && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
      s += text[i++];
    }
    return s;
  };
  const readRow = () => {
    const cols = [];
    if (i >= text.length) return null;
    while (i < text.length) {
      cols.push(field());
      if (text[i] === ",") {
        i++;
        continue;
      }
      if (text[i] === "\r") i++;
      if (text[i] === "\n") i++;
      break;
    }
    return cols;
  };
  const header = readRow();
  while (i < text.length) {
    const cols = readRow();
    if (!cols || (cols.length === 1 && cols[0] === "" && i >= text.length)) break;
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

const mod = await import(pathToFileURL(artifactsPath).href);
const themes = structuredClone(mod.themes);

const rows = loadCsv(csvPath);
const report = [];
const seen = new Set();

applyStructuralFlags(themes, report);

for (const row of rows) {
  const title = cleanCell(row["CATEGORY/Artifact Title"]).replace(/\s+/g, " ");
  if (!title || ["CHANGE", "TOGETHER", "ADVENTURE", "WORK"].includes(title.toUpperCase())) {
    continue;
  }
  const id = TITLE_TO_ID[title];
  if (!id) {
    console.warn("Unmatched CSV title:", title);
    continue;
  }
  const art = findArtifact(themes, id);
  if (!art) {
    console.warn("Missing artifact id:", id);
    continue;
  }
  seen.add(id);
  applyRow(art, row, report);
}

console.log("Updated artifacts:", [...seen].sort().join(", "));
console.log("Change events:", report.length);
for (const line of report) console.log(" -", line);

// Rebuild artifacts.js: keep preamble + helpers, replace themes
const original = fs.readFileSync(artifactsPath, "utf8");
const preambleEnd = original.indexOf("export const themes = ");
if (preambleEnd < 0) throw new Error("themes export not found");
const preamble = original.slice(0, preambleEnd);

const afterThemesMarker = "\nexport const themeOrder";
const afterIdx = original.indexOf(afterThemesMarker);
if (afterIdx < 0) throw new Error("themeOrder export not found");
const footer = original.slice(afterIdx);

const themesSrc = `export const themes = ${serializeValue(themes, null, 0)};\n`;
const out = preamble + themesSrc + footer;
fs.writeFileSync(artifactsPath, out);
console.log("Wrote", artifactsPath);
