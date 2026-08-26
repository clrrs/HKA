import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppState } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { scheduleFocus } from "../state/useSceneManager";
import { useHeadphoneSinkEffect } from "../audio/AudioRoutingProvider";
import {
  BRAILLE_OUTPUT_SETTLE_MS,
  guardNvdaSpeechSilenceWhilePlaying,
  stopNvdaSpeechAggressively,
} from "../audio/nvdaSpeechControl";
import {
  DESCRIPTION_MODE_COMBINED,
  GUIDED_DESCRIPTION_MODE_LETTERS,
  getArtifact,
  getNextArtifact,
  getPrevArtifact,
} from "../data/artifacts";
import { MISSING_COPY, textOrMissing } from "../data/contentPlaceholder";

const SCROLL_STEP_RATIO = 0.75;
const WORDS_PER_SEC = 2.4;
/** Buffer between auto-read sections (Story intro → guided, guided → guided). */
const SECTION_TRANSITION_MS = 1000;
/** Auto-read handoff dwell after focus lands on Transcript / next controls. */
const POST_READ_DWELL_MS = 4000;
const TRANSCRIPT_AUTOPLAY_PROMPT =
  "Transcript. Press Select for the full transcript of this artifact.";
const AUTO_READ_THEME_END_PROMPT =
  "End of artifacts in this theme. Press Select to return to the start of the theme.";
const VIDEO_END_DWELL_MS = 1000;
const VIDEO_AUTOPLAY_PROMPT = "The video will now play.";
/** Covers NVDA's "dialog" role preamble before it reaches the popup title. */
const DIALOG_TITLE_PREAMBLE_MS = 500;
const TEXT_PANEL_SUMMARY =
  "Artifact Description. Press Select to navigate description sections.";
const EMPTY_IMAGES = [];

const GUIDED_HEADINGS = {
  photograph: "Photograph Description",
  document: "Document Description",
  object: "Object Description",
  video: "Video Description",
};
const GUIDED_HEADING_FALLBACK = "Guided Description";

/**
 * When true, images with no guided copy of their own are left out of the stacked
 * text panel instead of each rendering a "MISSING COPY" section.
 */
const HIDE_MISSING_GUIDED_SECTIONS = false;

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateSpeechDurationMs(text) {
  return Math.round((countWords(text) / WORDS_PER_SEC) * 1000);
}

function estimateChunkDurationMs(text, bufferMs = SECTION_TRANSITION_MS) {
  return estimateSpeechDurationMs(text) + bufferMs;
}

function autoReadDelayMs(ms, fast) {
  return fast ? Math.max(50, Math.round(ms / 6)) : ms;
}

/** Treat sub-pixel / padding noise as "no overflow" so short panels don't trap or show a scrollbar. */
const SCROLL_OVERFLOW_THRESHOLD_PX = 2;

function getScrollOverflowPx(el) {
  if (!el) return 0;
  return Math.max(0, el.scrollHeight - el.clientHeight);
}

function hasScrollOverflow(el) {
  return getScrollOverflowPx(el) > SCROLL_OVERFLOW_THRESHOLD_PX;
}

function artifactHasTranscriptCopy(artifact) {
  return typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
}

function showsTranscriptButton(artifact, isVideo) {
  return Boolean(isVideo || artifactHasTranscriptCopy(artifact));
}

function getNodeOffsetTop(panel, node) {
  let top = 0;
  let current = node;
  while (current && current !== panel) {
    top += current.offsetTop;
    current = current.parentElement;
  }
  return Math.max(0, top);
}

/**
 * Same stop positions auto-read uses: section top, then every 75% of the
 * viewport until the rest of that section is visible.
 */
function getBlockScrollStops(panel, blockKey, offset, height) {
  const stepPx = Math.floor(panel.clientHeight * SCROLL_STEP_RATIO) || panel.clientHeight;
  const scrollLimit = Math.max(0, panel.scrollHeight - panel.clientHeight);
  const startTop = Math.min(offset, scrollLimit);
  const maxTop = Math.min(
    scrollLimit,
    Math.max(0, offset + height - panel.clientHeight)
  );
  const snaps = [{ blockKey, scrollTop: startTop }];
  const overflow = maxTop - startTop;
  if (overflow <= SCROLL_OVERFLOW_THRESHOLD_PX) return snaps;

  const steps = Math.max(1, Math.ceil(overflow / stepPx));
  for (let i = 1; i <= steps; i++) {
    snaps.push({
      blockKey,
      scrollTop: Math.min(maxTop, startTop + i * stepPx),
    });
  }
  return snaps;
}

/**
 * Snap stops + indicator positions for the description panel. Measured live off
 * the DOM: cached offsets go stale once the web fonts swap in and the copy reflows.
 */
function buildTextSnapsAndMarkers(panel, textBlocks) {
  if (!panel || textBlocks.length === 0) {
    return { snaps: [], markers: [] };
  }

  const total = panel.scrollHeight || 1;
  const snaps = [];
  const markers = [];

  for (const block of textBlocks) {
    const node = panel.querySelector(`[data-block-key="${block.key}"]`);
    if (!node) continue;
    const offset = getNodeOffsetTop(panel, node);
    const height = node.offsetHeight;
    markers.push({
      key: block.key,
      topPct: Math.min(100, Math.max(0, (offset / total) * 100)),
    });
    snaps.push(...getBlockScrollStops(panel, block.key, offset, height));
  }

  return { snaps, markers };
}

function getGuidedTextForImage(artifact, images, imageIndex) {
  const fromImage = images[imageIndex]?.guidedDescription?.trim();
  if (fromImage) return fromImage;
  if (imageIndex === 0) {
    const fromArtifact = artifact?.guidedDescription?.trim();
    if (fromArtifact) return fromArtifact;
  }
  return MISSING_COPY;
}

function isLetterGuidedArtifact(artifact) {
  return artifact?.guidedDescriptionMode === GUIDED_DESCRIPTION_MODE_LETTERS;
}

function isUnifiedDocumentGuided(artifact, images) {
  return (
    artifact?.type === "document" &&
    images.length > 1 &&
    !isLetterGuidedArtifact(artifact)
  );
}

function getLetterIndexForImage(artifact, imageIndex) {
  const sections = artifact?.letterSections;
  if (!Array.isArray(sections) || sections.length === 0) {
    return 0;
  }

  for (let i = 0; i < sections.length; i++) {
    const indices = sections[i]?.imageIndices;
    if (Array.isArray(indices) && indices.includes(imageIndex)) return i;
  }

  return Math.min(imageIndex, sections.length - 1);
}

function getLetterSectionImageIndex(section, sectionIndex, images) {
  const indices = section?.imageIndices;
  if (Array.isArray(indices) && indices.length > 0) {
    return indices[0];
  }
  if (images.length > 0) {
    return Math.min(sectionIndex, images.length - 1);
  }
  return 0;
}

function getBodyParagraphs(artifact) {
  const paragraphs = Array.isArray(artifact?.paragraphs)
    ? artifact.paragraphs.map((p) => String(p).trim()).filter(Boolean)
    : [];
  if (paragraphs.length > 0) return paragraphs;
  return [textOrMissing(artifact?.description)];
}

/**
 * Blocks are the shared unit behind the text panel, the auto-read chunks, and the
 * scroll markers, so all three stay aligned.
 *
 * Combined mode yields body paragraphs only — the guided copy is already folded
 * into them. Sections mode yields the context paragraph followed by one guided
 * section per image.
 */
function buildTextBlocks(artifact, images, isCombined) {
  if (!artifact) return [];

  const bodyText = isCombined
    ? getBodyParagraphs(artifact)
    : [textOrMissing(artifact.description)];
  const blocks = bodyText.map((text, i) => ({
    key: `body-${i}`,
    kind: "body",
    imageIndex: 0,
    text,
  }));

  if (isCombined) return blocks;

  const heading = GUIDED_HEADINGS[artifact.type] ?? GUIDED_HEADING_FALLBACK;

  if (isLetterGuidedArtifact(artifact)) {
    const sections = artifact.letterSections ?? [];
    const total = sections.length > 0 ? sections.length : 1;
    for (let i = 0; i < total; i++) {
      const section = sections[i] ?? {};
      const text = textOrMissing(section.guidedDescription);
      if (HIDE_MISSING_GUIDED_SECTIONS && text === MISSING_COPY) continue;
      blocks.push({
        key: `guided-letter-${i}`,
        kind: "guided",
        imageIndex: getLetterSectionImageIndex(section, i, images),
        heading: total > 1 ? `Letter ${i + 1} of ${total}` : "Letter",
        tagline: null,
        text,
      });
    }
    return blocks;
  }

  if (isUnifiedDocumentGuided(artifact, images)) {
    const text = getGuidedTextForImage(artifact, images, 0);
    if (!HIDE_MISSING_GUIDED_SECTIONS || text !== MISSING_COPY) {
      blocks.push({
        key: "guided-0",
        kind: "guided",
        imageIndex: 0,
        heading,
        tagline: null,
        text,
      });
    }
    return blocks;
  }

  const total = images.length > 0 ? images.length : 1;
  for (let i = 0; i < total; i++) {
    const text = getGuidedTextForImage(artifact, images, i);
    if (HIDE_MISSING_GUIDED_SECTIONS && text === MISSING_COPY) continue;
    blocks.push({
      key: `guided-${i}`,
      kind: "guided",
      imageIndex: i,
      heading,
      // A single image needs no position cue.
      tagline: total > 1 ? `Image ${i + 1} of ${total}` : null,
      text,
    });
  }

  return blocks;
}

function getDocumentPageAnnounce(artifact, pageIndex, pageCount) {
  const name = artifact?.displayTitle || artifact?.title || "this document";
  return `Page ${pageIndex + 1} of ${pageCount} of ${name}. For full text, go to Transcript.`;
}

function getBlockSpeech(block, isFirst) {
  if (block.kind === "guided") {
    return [block.heading, block.tagline, block.text].filter(Boolean).join(". ");
  }
  // Dialog aria-label already announces the title on open.
  return isFirst ? `Artifact description. ${block.text}` : block.text;
}

function buildAutoplayChunks(artifact, blocks, isVideo) {
  if (!artifact) return [];

  let chunks = blocks.map((block, i) => ({
    text: getBlockSpeech(block, i === 0),
    imageIndex: block.imageIndex,
    section: block.kind === "guided" ? "guided" : "description",
    mode: block.kind === "guided" ? "guided" : "intro",
    blockKey: block.key,
  }));

  // Documents: auto-read only the first guided section (not every page).
  if (artifact.type === "document") {
    let sawGuided = false;
    chunks = chunks.filter((chunk) => {
      if (chunk.section !== "guided") return true;
      if (sawGuided) return false;
      sawGuided = true;
      return true;
    });
  }

  if (!isVideo) return chunks;

  // Video artifacts hand off to playback rather than stepping through images;
  // beginInlineVideo speaks the guided copy just before the video starts.
  const spoken = chunks.filter((chunk) => chunk.section === "description");
  spoken.push({
    text: VIDEO_AUTOPLAY_PROMPT,
    imageIndex: 0,
    section: "videoPrompt",
    mode: null,
    blockKey: null,
  });
  return spoken;
}

function useFocusTrap(containerRef, isActive, options = {}) {
  const { autofocusOnActivate = true, skipAutofocusRef, initialFocusDoneRef } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key !== "Tab") return;

      const focusables = container.querySelectorAll(focusableSelector);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    const skipAutofocus = skipAutofocusRef?.current;
    if (skipAutofocusRef) skipAutofocusRef.current = false;

    const initialDone = initialFocusDoneRef?.current;
    const shouldAutofocus =
      autofocusOnActivate && !skipAutofocus && !(initialFocusDoneRef && initialDone);

    if (shouldAutofocus) {
    const autofocusTarget = container.matches("[data-autofocus]")
      ? container
      : container.querySelector("[data-autofocus]");
      if (autofocusTarget) {
        autofocusTarget.focus();
      } else {
        const focusables = container.querySelectorAll(focusableSelector);
        if (focusables.length > 0) {
          focusables[0].focus();
        }
      }
      if (initialFocusDoneRef) initialFocusDoneRef.current = true;
    }

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef, autofocusOnActivate, skipAutofocusRef, initialFocusDoneRef]);
}

function stepScrollKeyDown(e, bodyRef, { loop = false, onLoop = null } = {}) {
  if (e.repeat) return false;
  const key = e.key.toLowerCase();
  if (key !== "l" && key !== "k") return false;

  const body = bodyRef.current;
  if (!body) return false;

  const maxScroll = body.scrollHeight - body.clientHeight;
  if (maxScroll <= 0) return false;

  const step = Math.floor(body.clientHeight * SCROLL_STEP_RATIO) || body.clientHeight;

  if (key === "l") {
    if (body.scrollTop < maxScroll - 1) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: Math.min(maxScroll, body.scrollTop + step), behavior: "smooth" });
      return true;
    }
    if (loop) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: 0, behavior: "smooth" });
      onLoop?.();
      return true;
    }
    return false;
  }
  if (key === "k" && body.scrollTop > 0) {
    e.preventDefault();
    e.stopPropagation();
    body.scrollTo({ top: Math.max(0, body.scrollTop - step), behavior: "smooth" });
    return true;
  }
  return false;
}

export default function ArtifactPopup({ theme, artifactId, onNavigate, onClose }) {
  const { speechMode, isPaused, setVideoOverlayOpen, setAutoReadActive, showSettings, autoReadFast } =
    useAppState();
  const globalAnnounce = useAnnounce();
  const announce = useCallback(
    (message, options = {}) => globalAnnounce(message, { source: "ArtifactPopup", ...options }),
    [globalAnnounce]
  );

  const artifact = getArtifact(theme.id, artifactId);
  const prevArtifact = getPrevArtifact(theme.id, artifactId);
  const nextArtifact = getNextArtifact(theme.id, artifactId);

  const isVideo = artifact?.type === "video";
  const images = !isVideo ? artifact?.images || EMPTY_IMAGES : EMPTY_IMAGES;
  const hasMultipleImages = images.length > 1;
  const hasPrevImageButton = images.length >= 5;
  const isCombined = theme?.descriptionMode === DESCRIPTION_MODE_COMBINED;

  const textBlocks = useMemo(
    () => buildTextBlocks(artifact, images, isCombined),
    [artifact, images, isCombined]
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [textMode, setTextMode] = useState("intro");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [visualActiveSection, setVisualActiveSection] = useState(null);
  const [activeBlockKey, setActiveBlockKey] = useState(null);
  const [scrollMarkers, setScrollMarkers] = useState([]);
  const [textNavActive, setTextNavActive] = useState(false);
  const [textScrollable, setTextScrollable] = useState(false);
  const [storyBtnFocused, setStoryBtnFocused] = useState(false);
  const [guidedDescBtnFocused, setGuidedDescBtnFocused] = useState(false);
  const [heldVideoBtn, setHeldVideoBtn] = useState(null);
  // Which transport button the focus order and the gold auto-read outline sit
  // on. A held button wins over playback state, so auto-read starting the video
  // leaves you on Play with Pause as the next stop.
  const activeVideoBtn = heldVideoBtn ?? (isVideoPlaying ? "pause" : "play");
  // Speech off: the popup opens on a silent anchor so nothing is highlighted
  // yet. It leaves the focus order as soon as you move off it.
  const [focusAnchorActive, setFocusAnchorActive] = useState(!speechMode);
  const focusAnchorActiveRef = useRef(!speechMode);
  const focusAnchorRef = useRef(null);
  const popupRef = useRef(null);
  const autoReadFastRef = useRef(autoReadFast);
  autoReadFastRef.current = autoReadFast;
  const autoplayingRef = useRef(false);
  const autoplayTimeoutRef = useRef(null);
  const autoplayDeadlineRef = useRef(null);
  const autoplayRemainingRef = useRef(null);
  const autoplayPlayNextRef = useRef(null);
  const textAutoScrollTimeoutRef = useRef(null);
  const textAutoScrollStateRef = useRef(null);
  const textAutoScrollRemainingRef = useRef(null);
  const autoAdvanceTimeoutRef = useRef(null);
  const transcriptDwellTimeoutRef = useRef(null);
  const transcriptDwellDeadlineRef = useRef(null);
  const transcriptDwellRemainingRef = useRef(null);
  const transcriptDwellActiveRef = useRef(false);
  const storyTransitionTimeoutRef = useRef(null);
  const storyTransitionDeadlineRef = useRef(null);
  const storyTransitionRemainingRef = useRef(null);
  const storyTransitionActiveRef = useRef(false);
  const storyTransitionPlayRef = useRef(null);
  const videoStartTimeoutRef = useRef(null);
  const videoAutoplayRef = useRef(false);
  const videoWasPlayingBeforePauseRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const autoplayDoneRef = useRef(false);
  const visualActiveSectionRef = useRef(null);
  const lastMainFocusRef = useRef(null);
  const skipNextTrapAutofocusRef = useRef(false);
  const popupInitialFocusDoneRef = useRef(false);
  const settingsFocusRef = useRef(null);
  const prevShowSettingsRef = useRef(showSettings);
  const prevSpeechModeRef = useRef(speechMode);
  isPausedRef.current = isPaused;
  const prevArrowRef = useRef(null);
  const videoRef = useRef(null);
  const textRef = useRef(null);
  const textBodyRef = useRef(null);
  const textSnapsRef = useRef([]);
  const textSnapIndexRef = useRef(0);
  const activeBlockKeyRef = useRef(null);
  const textNavActiveRef = useRef(false);
  const enterTextNavRef = useRef(null);
  const stepTextNavRef = useRef(null);
  const scheduleOverflowTextNavRef = useRef(null);
  const textNavSourceRef = useRef(null);
  const nextImageRef = useRef(null);
  const prevImageRef = useRef(null);
  const storyBtnRef = useRef(null);
  const guidedDescBtnRef = useRef(null);
  const transcriptBtnRef = useRef(null);
  const zoomOrPlayRef = useRef(null);
  const playBtnRef = useRef(null);
  const pauseBtnRef = useRef(null);
  const nextArrowRef = useRef(null);
  const zoomRef = useRef(null);
  const transcriptPanelRef = useRef(null);
  const transcriptExitRef = useRef(null);
  const transcriptBodyRef = useRef(null);

  const [snapIndex, setSnapIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(2);
  const [snapPaneHeight, setSnapPaneHeight] = useState(0);
  const snapWindowRef = useRef(null);
  const snapImageRef = useRef(null);
  const snapUpRef = useRef(null);
  const snapDownRef = useRef(null);

  const currentImage = images.length > 0 ? images[currentImageIndex] : null;
  const showStoryButton = !isCombined;
  const showGuidedDescriptionButton = isVideo && !isCombined;

  const getGuidedBlockForImage = useCallback(
    (imageIndex) => {
      if (isLetterGuidedArtifact(artifact)) {
        const letterIndex = getLetterIndexForImage(artifact, imageIndex);
        return (
          textBlocks.find((b) => b.key === `guided-letter-${letterIndex}`) ||
          textBlocks.find((b) => b.kind === "guided") ||
          null
        );
      }
      if (isUnifiedDocumentGuided(artifact, images)) {
        return (
          textBlocks.find((b) => b.key === "guided-0") ||
          textBlocks.find((b) => b.kind === "guided") ||
          null
        );
      }
      return (
        textBlocks.find((b) => b.kind === "guided" && b.imageIndex === imageIndex) ||
        textBlocks.find((b) => b.kind === "guided") ||
        null
      );
    },
    [artifact, images, textBlocks]
  );

  const visibleBlocks = useMemo(() => {
    if (isCombined) return textBlocks;
    if (textMode === "intro") {
      return textBlocks.filter((b) => b.kind === "body");
    }
    const guided = getGuidedBlockForImage(currentImageIndex);
    return guided ? [guided] : [];
  }, [
    isCombined,
    textMode,
    textBlocks,
    currentImageIndex,
    getGuidedBlockForImage,
  ]);

  useHeadphoneSinkEffect(videoRef, artifact?.videoSrc);

  const mainPopupActive = !zoomOpen && !transcriptOpen;
  useFocusTrap(popupRef, mainPopupActive && !showSettings, {
    skipAutofocusRef: skipNextTrapAutofocusRef,
    initialFocusDoneRef: popupInitialFocusDoneRef,
    autofocusOnActivate: true,
  });
  useFocusTrap(zoomRef, zoomOpen && !showSettings);
  useFocusTrap(transcriptPanelRef, transcriptOpen && !showSettings);

  useLayoutEffect(() => {
    const wasOpen = prevShowSettingsRef.current;
    prevShowSettingsRef.current = showSettings;

    if (showSettings) {
      // Keep skip latched so reactivating the trap on close does not autofocus the first control.
      skipNextTrapAutofocusRef.current = true;
      const active = document.activeElement;
      if (popupRef.current?.contains(active)) {
        settingsFocusRef.current = active;
      }
      return;
    }

    if (!wasOpen) return;

    skipNextTrapAutofocusRef.current = true;
    const target = settingsFocusRef.current;
    settingsFocusRef.current = null;
    const restore = () => {
      if (target && popupRef.current?.contains(target)) {
        target.focus({ preventScroll: true });
      }
    };
    restore();
    const t = window.setTimeout(restore, 50);
    return () => window.clearTimeout(t);
  }, [showSettings]);

  const setVisualSection = useCallback((section, blockKey = null) => {
    visualActiveSectionRef.current = section;
    setVisualActiveSection(section);
    const nextKey =
      section === "description" || section === "guided" ? blockKey : null;
    activeBlockKeyRef.current = nextKey;
    setActiveBlockKey(nextKey);
  }, []);

  const clearTextAutoScroll = useCallback(() => {
    if (textAutoScrollTimeoutRef.current !== null) {
      clearTimeout(textAutoScrollTimeoutRef.current);
      textAutoScrollTimeoutRef.current = null;
    }
    textAutoScrollStateRef.current = null;
    textAutoScrollRemainingRef.current = null;
  }, []);

  /** Scroll offset of a block from the top of the text body (stable while scrolling). */
  const getBlockOffsetTop = useCallback((blockKey) => {
    const panel = textBodyRef.current;
    if (!panel || !blockKey) return 0;
    const block = panel.querySelector(`[data-block-key="${blockKey}"]`);
    if (!block) return 0;
    return getNodeOffsetTop(panel, block);
  }, []);

  const getBlockHeight = useCallback((blockKey) => {
    const panel = textBodyRef.current;
    if (!panel || !blockKey) return 0;
    const block = panel.querySelector(`[data-block-key="${blockKey}"]`);
    return block ? block.offsetHeight : 0;
  }, []);

  const scrollBlockToTop = useCallback(
    (blockKey, { behavior = "auto" } = {}) => {
      const el = textBodyRef.current;
      if (!el || !blockKey) return;

      clearTextAutoScroll();
      const scrollLimit = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTo({
        top: Math.min(getBlockOffsetTop(blockKey), scrollLimit),
        behavior,
      });
    },
    [clearTextAutoScroll, getBlockOffsetTop]
  );

  /** Leaving the text panel drops the gold block bar and rewinds to the top. */
  const resetTextScroll = useCallback(() => {
    textNavActiveRef.current = false;
    setTextNavActive(false);
    textNavSourceRef.current = null;
    textSnapIndexRef.current = 0;
    activeBlockKeyRef.current = null;
    setActiveBlockKey(null);
    textBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refreshTextSnaps = useCallback(() => {
    const { snaps } = buildTextSnapsAndMarkers(textBodyRef.current, visibleBlocks);
    textSnapsRef.current = snaps;
    return snaps;
  }, [visibleBlocks]);

  const clearFocusAnchor = useCallback(() => {
    focusAnchorActiveRef.current = false;
    setFocusAnchorActive(false);
  }, []);

  const clearStoryTransition = useCallback(() => {
    storyTransitionActiveRef.current = false;
    storyTransitionPlayRef.current = null;
    if (storyTransitionTimeoutRef.current !== null) {
      clearTimeout(storyTransitionTimeoutRef.current);
      storyTransitionTimeoutRef.current = null;
    }
    storyTransitionDeadlineRef.current = null;
    storyTransitionRemainingRef.current = null;
  }, []);

  const tickTextAutoScroll = useCallback(() => {
    textAutoScrollTimeoutRef.current = null;
    const state = textAutoScrollStateRef.current;
    if (!state || !autoplayingRef.current || isPausedRef.current) return;

    const el = textBodyRef.current;
    if (!el) {
      textAutoScrollStateRef.current = null;
      return;
    }

    const maxScroll = Math.min(state.maxTop, el.scrollHeight - el.clientHeight);
    if (maxScroll <= SCROLL_OVERFLOW_THRESHOLD_PX) {
      textAutoScrollStateRef.current = null;
      return;
    }

    el.scrollTo({
      top: Math.min(maxScroll, el.scrollTop + state.stepPx),
      behavior: "smooth",
    });
    state.stepsLeft -= 1;
    if (state.stepsLeft <= 0) {
      textAutoScrollStateRef.current = null;
      return;
    }

    state.nextDeadline = Date.now() + state.intervalMs;
    textAutoScrollTimeoutRef.current = setTimeout(tickTextAutoScroll, state.intervalMs);
  }, []);

  const startTextAutoScroll = useCallback(
    (durationMs, blockKey) => {
      clearTextAutoScroll();
      if (!(durationMs > 0)) return;

      const schedule = () => {
        if (!autoplayingRef.current || isPausedRef.current) return;
        const el = textBodyRef.current;
        if (!el) return;

        const scrollLimit = Math.max(0, el.scrollHeight - el.clientHeight);
        const blockTop = blockKey ? getBlockOffsetTop(blockKey) : 0;
        const blockHeight = blockKey ? getBlockHeight(blockKey) : el.scrollHeight;

        // Bring the block being read to the top of the panel, then scroll only
        // far enough to reveal the rest of that block.
        const startTop = Math.min(blockTop, scrollLimit);
        el.scrollTop = startTop;

        const maxTop = Math.min(
          scrollLimit,
          Math.max(0, blockTop + blockHeight - el.clientHeight)
        );
        const overflow = maxTop - startTop;
        if (overflow <= SCROLL_OVERFLOW_THRESHOLD_PX) return;

        const stepPx = Math.floor(el.clientHeight * SCROLL_STEP_RATIO) || el.clientHeight;
        const steps = Math.max(1, Math.ceil(overflow / stepPx));
        // Leave a beat at the top and at the bottom so the last step is not
        // scheduled at the same instant as auto-advance to the next chunk.
        const intervalMs = durationMs / (steps + 1);
        if (!(intervalMs > 0)) return;

        textAutoScrollStateRef.current = {
          stepPx,
          maxTop,
          stepsLeft: steps,
          intervalMs,
          nextDeadline: Date.now() + intervalMs,
        };
        textAutoScrollTimeoutRef.current = setTimeout(tickTextAutoScroll, intervalMs);
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(schedule);
      });
    },
    [clearTextAutoScroll, tickTextAutoScroll, getBlockOffsetTop, getBlockHeight]
  );

  const clearTranscriptDwell = useCallback(() => {
    transcriptDwellActiveRef.current = false;
    if (transcriptDwellTimeoutRef.current !== null) {
      clearTimeout(transcriptDwellTimeoutRef.current);
      transcriptDwellTimeoutRef.current = null;
    }
    transcriptDwellDeadlineRef.current = null;
    transcriptDwellRemainingRef.current = null;
  }, []);

  const cancelAutoplay = useCallback(() => {
    autoplayingRef.current = false;
    autoplayRemainingRef.current = null;
    autoplayPlayNextRef.current = null;
    autoplayDeadlineRef.current = null;
    clearTextAutoScroll();
    if (autoplayTimeoutRef.current !== null) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current !== null) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (videoStartTimeoutRef.current !== null) {
      clearTimeout(videoStartTimeoutRef.current);
      videoStartTimeoutRef.current = null;
    }
    if (videoAutoplayRef.current) {
      videoAutoplayRef.current = false;
      videoRef.current?.pause();
      setIsVideoPlaying(false);
      setVideoOverlayOpen(false);
    }
  }, [clearTextAutoScroll, setVideoOverlayOpen]);

  const markAutoplayEnded = useCallback(() => {
    cancelAutoplay();
    clearTranscriptDwell();
    clearStoryTransition();
    autoplayDoneRef.current = true;
    setIsAutoplaying(false);
    setVisualSection(null);
  }, [cancelAutoplay, clearTranscriptDwell, clearStoryTransition, setVisualSection]);

  // Landing focus on the arrow is the whole announcement: its aria-label already
  // carries the "press select" prompt for both the next-artifact and end-of-theme
  // cases, so anything announced here would be spoken on top of it.
  const landOnNextArrowEnd = useCallback(() => {
    clearTranscriptDwell();
    setVisualSection(null);
    // Retry the landing: a single focus() in this turn can be dropped, and the
    // arrow is unreachable for a beat if an overlay still holds the popup inert.
    scheduleFocus(nextArrowRef.current);
  }, [clearTranscriptDwell, setVisualSection]);

  const startTranscriptDwell = useCallback(() => {
    setVisualSection("transcript");
    transcriptBtnRef.current?.focus({ preventScroll: true });
    announce(TRANSCRIPT_AUTOPLAY_PROMPT, { politeness: "assertive" });

    clearTranscriptDwell();
    transcriptDwellActiveRef.current = true;
    const dwellMs = autoReadDelayMs(POST_READ_DWELL_MS, autoReadFastRef.current);
    transcriptDwellDeadlineRef.current = Date.now() + dwellMs;
    transcriptDwellTimeoutRef.current = setTimeout(() => {
      transcriptDwellTimeoutRef.current = null;
      transcriptDwellDeadlineRef.current = null;
      transcriptDwellRemainingRef.current = null;
      transcriptDwellActiveRef.current = false;
      landOnNextArrowEnd();
    }, dwellMs);
  }, [announce, clearTranscriptDwell, setVisualSection, landOnNextArrowEnd]);

  const flashSelected = useCallback((ref) => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("is-selected");
    window.setTimeout(() => {
      el.classList.remove("is-selected");
    }, 250);
  }, []);

  const beginInlineVideo = useCallback(
    (fromAutoplay) => {
      const video = videoRef.current;
      if (!video || !artifact || !isVideo) return;

      videoAutoplayRef.current = fromAutoplay;
      // Autoplay: gold outline via visualActiveSection "play". Manual: brief gold flash only.
      if (fromAutoplay) {
        setVisualSection("play");
        // Auto-read starts playback for you; taking over should still find you
        // on Play rather than jumping to Pause.
        setHeldVideoBtn("play");
      } else {
        setVisualSection(null);
        flashSelected(playBtnRef);
      }

      // A live-region update reaches NVDA braille first. Speech is then cut
      // aggressively before media starts, matching quote playback behavior.
      const describing = isCombined
        ? textBlocks
        : textBlocks.filter((block) => block.kind === "guided");
      const spoken = describing.map((block) => getBlockSpeech(block, false)).join(" ");
      if (spoken) {
        setTextMode("guided");
        scrollBlockToTop(describing[0]?.key);
        announce(spoken, { politeness: "assertive", dedupeMs: 0 });
      }

      if (videoStartTimeoutRef.current !== null) {
        clearTimeout(videoStartTimeoutRef.current);
      }
      videoStartTimeoutRef.current = window.setTimeout(() => {
        videoStartTimeoutRef.current = null;
        if (fromAutoplay && !autoplayingRef.current) return;

        stopNvdaSpeechAggressively();
        if (video.ended) video.currentTime = 0;
        const playPromise = video.play();
        setIsVideoPlaying(true);
        setVideoOverlayOpen(true);
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            setIsVideoPlaying(false);
            setVideoOverlayOpen(false);
          });
        }
      }, BRAILLE_OUTPUT_SETTLE_MS);
    },
    [
      announce,
      artifact,
      flashSelected,
      isCombined,
      isVideo,
      scrollBlockToTop,
      setVideoOverlayOpen,
      setVisualSection,
      textBlocks,
    ]
  );

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false);
    setVideoOverlayOpen(false);
    // Finished playback holds the last frame; reload so the poster shows again.
    // Pause mid-video is untouched and keeps the current frame.
    videoRef.current?.load();

    if (!videoAutoplayRef.current || !autoplayingRef.current) {
      videoAutoplayRef.current = false;
      setVisualSection(null);
      return;
    }

    if (autoAdvanceTimeoutRef.current !== null) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      autoAdvanceTimeoutRef.current = null;
      if (!videoAutoplayRef.current || !autoplayingRef.current) return;

      videoAutoplayRef.current = false;
      autoplayDoneRef.current = true;
      autoplayingRef.current = false;
      setIsAutoplaying(false);
      landOnNextArrowEnd();
    }, autoReadDelayMs(VIDEO_END_DWELL_MS, autoReadFastRef.current));
  }, [landOnNextArrowEnd, setVideoOverlayOpen, setVisualSection]);

  const rememberMainFocus = useCallback(() => {
    const el = document.activeElement;
    if (el && popupRef.current?.contains(el)) {
      lastMainFocusRef.current = el;
    }
  }, []);

  const restoreMainFocus = useCallback((fallbackRef) => {
    skipNextTrapAutofocusRef.current = true;
    requestAnimationFrame(() => {
      const target = lastMainFocusRef.current;
      if (target && popupRef.current?.contains(target)) {
        target.focus({ preventScroll: true });
      } else {
        fallbackRef?.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  const getTextPanelFocusEl = useCallback(
    () => (speechMode ? textBodyRef.current : textRef.current),
    [speechMode]
  );

  const getTextBlockEl = useCallback((blockKey) => {
    if (!blockKey || !textBodyRef.current) return null;
    return textBodyRef.current.querySelector(`[data-block-key="${blockKey}"]`);
  }, []);

  const isOnTextPanel = useCallback((el) => {
    if (!el) return false;
    if (el === textRef.current || el === textBodyRef.current) return true;
    return Boolean(textBodyRef.current?.contains(el));
  }, []);

  const getPopupFocusables = useCallback(() => {
    const hasTranscriptLocal = showsTranscriptButton(artifact, isVideo);
    if (isVideo) {
      const playEl = playBtnRef.current;
      const pauseEl = pauseBtnRef.current;
      const includePlay = playEl && (!isVideoPlaying || heldVideoBtn === "play");
      const includePause = pauseEl && (isVideoPlaying || heldVideoBtn === "pause");
      return [
        prevArrowRef.current,
        showStoryButton ? storyBtnRef.current : null,
        includePlay ? playEl : null,
        includePause ? pauseEl : null,
        showGuidedDescriptionButton ? guidedDescBtnRef.current : null,
        hasTranscriptLocal ? transcriptBtnRef.current : null,
        nextArrowRef.current,
      ].filter(Boolean);
    }
    return [
      prevArrowRef.current,
      showStoryButton ? storyBtnRef.current : null,
      hasPrevImageButton ? prevImageRef.current : null,
      hasMultipleImages ? nextImageRef.current : null,
      zoomOrPlayRef.current,
      hasTranscriptLocal ? transcriptBtnRef.current : null,
      nextArrowRef.current,
    ].filter(Boolean);
  }, [
    hasMultipleImages,
    hasPrevImageButton,
    artifact,
    isVideo,
    showStoryButton,
    showGuidedDescriptionButton,
    isVideoPlaying,
    heldVideoBtn,
  ]);

  const getActiveVideoControl = useCallback(
    () => (activeVideoBtn === "pause" ? pauseBtnRef.current : playBtnRef.current),
    [activeVideoBtn]
  );

  const getFirstControlRef = useCallback(
    () =>
      (textScrollable ? getTextPanelFocusEl() : null) ||
      (showStoryButton ? storyBtnRef.current : null) ||
      getActiveVideoControl() ||
      zoomOrPlayRef.current,
    [getTextPanelFocusEl, showStoryButton, textScrollable, getActiveVideoControl]
  );

  const getToolbarButtonAfterStory = useCallback(() => {
    const focusables = isVideo
      ? [
          getActiveVideoControl(),
          showGuidedDescriptionButton ? guidedDescBtnRef.current : null,
          transcriptBtnRef.current,
        ]
      : [
          hasPrevImageButton ? prevImageRef.current : null,
          hasMultipleImages ? nextImageRef.current : null,
          zoomOrPlayRef.current,
          transcriptBtnRef.current,
        ];
    return focusables.filter(Boolean)[0] || null;
  }, [
    isVideo,
    showGuidedDescriptionButton,
    hasPrevImageButton,
    hasMultipleImages,
    getActiveVideoControl,
  ]);

  const getFirstToolbarButton = useCallback(
    () =>
      (showStoryButton ? storyBtnRef.current : null) ||
      getToolbarButtonAfterStory(),
    [showStoryButton, getToolbarButtonAfterStory]
  );

  const focusVisualActiveOrFallback = useCallback(
    (isNext, sectionOverride) => {
      const section = sectionOverride ?? visualActiveSectionRef.current;
      if (section === "nextImage" && nextImageRef.current) {
        nextImageRef.current.focus({ preventScroll: true });
        return;
      }
      if (section === "play") {
        // Auto-read is already "on" Play; L/K should leave it the same way
        // manual nav does: forward → Pause, back → Story. Video keeps playing.
        if (isNext) {
          (
            pauseBtnRef.current ||
            guidedDescBtnRef.current ||
            transcriptBtnRef.current ||
            nextArrowRef.current
          )?.focus({ preventScroll: true });
        } else {
          (storyBtnRef.current || prevArrowRef.current)?.focus({
            preventScroll: true,
          });
        }
        return;
      }
      if (section === "transcript" && transcriptBtnRef.current) {
        transcriptBtnRef.current.focus({ preventScroll: true });
        return;
      }
      if (
        section === "guided" ||
        section === "description" ||
        section === "title"
      ) {
        if (isNext) {
          if (hasScrollOverflow(textBodyRef.current)) {
            const entered = enterTextNavRef.current?.({
              announceBlock: false,
              focus: true,
            });
            if (entered) {
              stepTextNavRef.current?.("next");
            } else {
              getFirstToolbarButton()?.focus({ preventScroll: true });
            }
          } else {
            resetTextScroll();
            // Auto-read of Story is already "on" that button; Next should leave it.
            const nextBtn =
              section === "description"
                ? getToolbarButtonAfterStory() || getFirstToolbarButton()
                : getFirstToolbarButton();
            nextBtn?.focus({ preventScroll: true });
          }
        } else {
          resetTextScroll();
          prevArrowRef.current?.focus({ preventScroll: true });
        }
        return;
      }
      if (isNext) {
        getFirstControlRef()?.focus({ preventScroll: true });
      } else {
        prevArrowRef.current?.focus({ preventScroll: true });
      }
    },
    [getFirstControlRef, getFirstToolbarButton, getToolbarButtonAfterStory, resetTextScroll]
  );

  useEffect(() => {
    autoplayDoneRef.current = false;
    popupInitialFocusDoneRef.current = false;
    clearTranscriptDwell();
    clearStoryTransition();
  }, [artifactId, clearTranscriptDwell, clearStoryTransition]);

  // Hold the inactivity timer while auto-read is reading. Pausing counts as idle
  // again, so a paused read cannot keep the timer suppressed indefinitely.
  useEffect(() => {
    setAutoReadActive(isAutoplaying && !isPaused);
  }, [isAutoplaying, isPaused, setAutoReadActive]);

  useEffect(() => () => setAutoReadActive(false), [setAutoReadActive]);

  // NVDA prepends the document title ("Helen Keller Archive") when a dialog
  // opens. Blank it for the popup lifetime so speech is just the artifact title.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "\u00a0";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!mainPopupActive) return;
    if (!speechMode && !focusAnchorActive) return;
    focusAnchorRef.current?.focus({ preventScroll: true });
  }, [artifactId, speechMode, mainPopupActive, focusAnchorActive]);

  useEffect(() => {
    if (artifact && !speechMode) {
      announce(`${artifact.title} opened.`, { politeness: "assertive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearTranscriptDwell();
      clearStoryTransition();
    };
  }, [clearTranscriptDwell, clearStoryTransition]);

  useEffect(() => {
    if (!speechMode || !artifact) return;
    if (isPausedRef.current) return;
    if (zoomOpen || transcriptOpen) {
      cancelAutoplay();
      clearTranscriptDwell();
      clearStoryTransition();
      setIsAutoplaying(false);
      setVisualSection(null);
      autoplayDoneRef.current = true;
      return;
    }
    if (autoplayDoneRef.current) return;

    const chunks = buildAutoplayChunks(artifact, textBlocks, isVideo);
    if (chunks.length === 0) return;

    const hasTranscriptLocal = showsTranscriptButton(artifact, isVideo);

    let chunkIndex = 0;
    autoplayingRef.current = true;
    setIsAutoplaying(true);
    textNavActiveRef.current = false;
    setTextNavActive(false);
    setVisualSection(null);

    const playNext = () => {
      if (!autoplayingRef.current || isPausedRef.current) return;
      if (chunkIndex >= chunks.length) {
        clearTextAutoScroll();
        autoplayDoneRef.current = true;
        autoplayingRef.current = false;
        autoplayTimeoutRef.current = null;
        autoplayDeadlineRef.current = null;
        autoplayPlayNextRef.current = null;
        autoplayRemainingRef.current = null;
        setIsAutoplaying(false);

        if (hasTranscriptLocal && transcriptBtnRef.current) {
          startTranscriptDwell();
        } else {
          landOnNextArrowEnd();
        }
        return;
      }

      const chunk = chunks[chunkIndex];
      if (chunk.mode) {
        setTextMode(chunk.mode);
      }
      setCurrentImageIndex(chunk.imageIndex);
      setVisualSection(
        chunk.section === "videoPrompt" ? "play" : chunk.section,
        chunk.blockKey
      );

      announce(chunk.text, { politeness: "assertive" });
      chunkIndex += 1;

      if (chunk.section === "videoPrompt") {
        clearTextAutoScroll();
        const delay = autoReadDelayMs(
          estimateChunkDurationMs(chunk.text),
          autoReadFastRef.current
        );
        const startVideo = () => {
          autoplayTimeoutRef.current = null;
          autoplayDeadlineRef.current = null;
          autoplayRemainingRef.current = null;
          beginInlineVideo(true);
        };
        autoplayPlayNextRef.current = startVideo;
        autoplayDeadlineRef.current = Date.now() + delay;
        autoplayTimeoutRef.current = setTimeout(startVideo, delay);
        return;
      }

      const delay = autoReadDelayMs(
        estimateChunkDurationMs(chunk.text, SECTION_TRANSITION_MS),
        autoReadFastRef.current
      );
      if (chunk.section === "description" || chunk.section === "guided") {
        // Wait for textMode swap to render the visible block before scrolling.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!autoplayingRef.current || isPausedRef.current) return;
            scrollBlockToTop(chunk.blockKey);
            startTextAutoScroll(delay, chunk.blockKey);
          });
        });
      } else {
        clearTextAutoScroll();
      }
      autoplayPlayNextRef.current = playNext;
      autoplayDeadlineRef.current = Date.now() + delay;
      autoplayTimeoutRef.current = setTimeout(playNext, delay);
    };

    // Stay on the dialog so NVDA does not start reading the text panel from the
    // top. Each chunk is spoken only via the live region.
    const firstChunkDelay = autoReadDelayMs(
      estimateSpeechDurationMs(artifact.title) + DIALOG_TITLE_PREAMBLE_MS,
      autoReadFastRef.current
    );
    autoplayPlayNextRef.current = playNext;
    autoplayDeadlineRef.current = Date.now() + firstChunkDelay;
    autoplayTimeoutRef.current = setTimeout(playNext, firstChunkDelay);

    return () => {
      if (autoplayingRef.current) {
        cancelAutoplay();
      }
    };
  }, [
    speechMode,
    artifact,
    artifactId,
    isVideo,
    textBlocks,
    zoomOpen,
    transcriptOpen,
    announce,
    cancelAutoplay,
    clearTranscriptDwell,
    clearStoryTransition,
    setVisualSection,
    startTranscriptDwell,
    landOnNextArrowEnd,
    startTextAutoScroll,
    clearTextAutoScroll,
    scrollBlockToTop,
    beginInlineVideo,
  ]);

  useEffect(() => {
    if (
      !autoplayingRef.current &&
      !transcriptDwellActiveRef.current &&
      !storyTransitionActiveRef.current
    ) {
      return;
    }

    if (isPaused) {
      if (autoplayingRef.current) {
        if (autoplayTimeoutRef.current !== null && autoplayDeadlineRef.current !== null) {
          autoplayRemainingRef.current = Math.max(
            0,
            autoplayDeadlineRef.current - Date.now()
          );
          clearTimeout(autoplayTimeoutRef.current);
          autoplayTimeoutRef.current = null;
        }
        if (textAutoScrollTimeoutRef.current !== null && textAutoScrollStateRef.current) {
          textAutoScrollRemainingRef.current = Math.max(
            0,
            textAutoScrollStateRef.current.nextDeadline - Date.now()
          );
          clearTimeout(textAutoScrollTimeoutRef.current);
          textAutoScrollTimeoutRef.current = null;
        }
      }

      if (
        transcriptDwellActiveRef.current &&
        transcriptDwellTimeoutRef.current !== null &&
        transcriptDwellDeadlineRef.current !== null
      ) {
        transcriptDwellRemainingRef.current = Math.max(
          0,
          transcriptDwellDeadlineRef.current - Date.now()
        );
        clearTimeout(transcriptDwellTimeoutRef.current);
        transcriptDwellTimeoutRef.current = null;
      }

      if (
        storyTransitionActiveRef.current &&
        storyTransitionTimeoutRef.current !== null &&
        storyTransitionDeadlineRef.current !== null
      ) {
        storyTransitionRemainingRef.current = Math.max(
          0,
          storyTransitionDeadlineRef.current - Date.now()
        );
        clearTimeout(storyTransitionTimeoutRef.current);
        storyTransitionTimeoutRef.current = null;
      }
      return;
    }

    if (
      autoplayingRef.current &&
      autoplayTimeoutRef.current === null &&
      autoplayRemainingRef.current !== null &&
      autoplayPlayNextRef.current
    ) {
      const delay = autoplayRemainingRef.current;
      const fn = autoplayPlayNextRef.current;
      autoplayRemainingRef.current = null;
      autoplayDeadlineRef.current = Date.now() + delay;
      autoplayTimeoutRef.current = setTimeout(fn, delay);
    }

    if (
      autoplayingRef.current &&
      textAutoScrollTimeoutRef.current === null &&
      textAutoScrollRemainingRef.current !== null &&
      textAutoScrollStateRef.current
    ) {
      const delay = textAutoScrollRemainingRef.current;
      textAutoScrollRemainingRef.current = null;
      textAutoScrollStateRef.current.nextDeadline = Date.now() + delay;
      textAutoScrollTimeoutRef.current = setTimeout(tickTextAutoScroll, delay);
    }

    if (
      transcriptDwellActiveRef.current &&
      transcriptDwellTimeoutRef.current === null &&
      transcriptDwellRemainingRef.current !== null
    ) {
      const delay = transcriptDwellRemainingRef.current;
      transcriptDwellRemainingRef.current = null;
      transcriptDwellDeadlineRef.current = Date.now() + delay;
      transcriptDwellTimeoutRef.current = setTimeout(() => {
        transcriptDwellTimeoutRef.current = null;
        transcriptDwellDeadlineRef.current = null;
        transcriptDwellActiveRef.current = false;
        landOnNextArrowEnd();
      }, delay);
    }

    if (
      storyTransitionActiveRef.current &&
      storyTransitionTimeoutRef.current === null &&
      storyTransitionRemainingRef.current !== null
    ) {
      const delay = storyTransitionRemainingRef.current;
      storyTransitionRemainingRef.current = null;
      storyTransitionDeadlineRef.current = Date.now() + delay;
      storyTransitionTimeoutRef.current = setTimeout(() => {
        storyTransitionTimeoutRef.current = null;
        storyTransitionDeadlineRef.current = null;
        storyTransitionActiveRef.current = false;
        storyTransitionPlayRef.current?.();
      }, delay);
    }
  }, [isPaused, tickTextAutoScroll, landOnNextArrowEnd]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video) return;

    if (isPaused) {
      if (!video.paused) {
        videoWasPlayingBeforePauseRef.current = true;
        video.pause();
        setIsVideoPlaying(false);
        setVideoOverlayOpen(false);
      }
      return;
    }

    if (videoWasPlayingBeforePauseRef.current) {
      videoWasPlayingBeforePauseRef.current = false;
      stopNvdaSpeechAggressively();
      video.play().catch(() => {});
      setIsVideoPlaying(true);
      setVideoOverlayOpen(true);
    }
  }, [isPaused, isVideo, setVideoOverlayOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video) return undefined;
    return guardNvdaSpeechSilenceWhilePlaying(video);
  }, [isVideo, artifactId]);

  useEffect(() => {
    return () => {
      if (videoStartTimeoutRef.current !== null) {
        clearTimeout(videoStartTimeoutRef.current);
      }
      videoRef.current?.pause();
      setVideoOverlayOpen(false);
    };
  }, [setVideoOverlayOpen]);

  useLayoutEffect(() => {
    if (textBodyRef.current) {
      textBodyRef.current.scrollTop = 0;
    }
    textNavActiveRef.current = false;
    setTextNavActive(false);
    textNavSourceRef.current = null;
    textSnapIndexRef.current = 0;
    activeBlockKeyRef.current = null;
    setActiveBlockKey(null);
    setCurrentImageIndex(0);
    setTextMode("intro");
    setTextScrollable(false);
    setHeldVideoBtn(null);
    clearStoryTransition();
  }, [artifactId, clearStoryTransition]);

  // Enable scrolling when the text panel overflows, and place ticks / snaps
  // for each block the pill can land on.
  useEffect(() => {
    const el = textBodyRef.current;
    if (!el) return;

    const measure = () => {
      const needsScroll = hasScrollOverflow(el);
      // Only touch layout when something actually changed; toggling the class
      // changes overflow, which would otherwise retrigger the ResizeObserver.
      if (el.classList.contains("artifact-popup-text--scrollable") !== needsScroll) {
        el.classList.toggle("artifact-popup-text--scrollable", needsScroll);
      }
      if (!needsScroll && el.scrollTop !== 0) el.scrollTop = 0;
      setTextScrollable((prev) => (prev === needsScroll ? prev : needsScroll));
      if (!needsScroll && textNavActiveRef.current) {
        const sourceEl = textNavSourceRef.current?.current;
        resetTextScroll();
        sourceEl?.focus({ preventScroll: true });
      }

      const { snaps, markers } = buildTextSnapsAndMarkers(el, visibleBlocks);
      textSnapsRef.current = snaps;
      setScrollMarkers((prev) => {
        const same =
          prev.length === markers.length &&
          prev.every(
            (m, i) => m.key === markers[i].key && Math.abs(m.topPct - markers[i].topPct) < 0.1
          );
        return same ? prev : markers;
      });
    };

    measure();
    const rafId = requestAnimationFrame(measure);

    // Custom fonts reflow the copy after first paint, which moves every block.
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      el.classList.remove("artifact-popup-text--scrollable");
    };
  }, [visibleBlocks, artifactId, resetTextScroll]);

  // Yellow scrollbar while snap-scrolling text / transcript panels
  useEffect(() => {
    const attachScrollHighlight = (el) => {
      if (!el) return () => {};
      let timer = null;
      const onScroll = () => {
        el.classList.add("is-scrolling");
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          el.classList.remove("is-scrolling");
          timer = null;
        }, 400);
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        el.removeEventListener("scroll", onScroll);
        if (timer) clearTimeout(timer);
        el.classList.remove("is-scrolling");
      };
    };

    const cleanupText = attachScrollHighlight(textBodyRef.current);
    const cleanupTranscript = attachScrollHighlight(transcriptBodyRef.current);
    return () => {
      cleanupText();
      cleanupTranscript();
    };
  }, [transcriptOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSettings) return;
      if (!autoplayingRef.current || e.repeat) return;
      const key = e.key.toLowerCase();
      const isNext = key === "l" || key === "arrowright";
      const isBack = key === "k" || key === "arrowleft";
      if (!isNext && !isBack) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      const section = visualActiveSectionRef.current;
      // Taking over during auto-read video keeps playback going — same as
      // sitting on Play during manual nav. Claim it as manual before cancel.
      if (section === "play" && videoAutoplayRef.current) {
        videoAutoplayRef.current = false;
      }
      markAutoplayEnded();
      focusVisualActiveOrFallback(isNext, section);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [markAutoplayEnded, focusVisualActiveOrFallback, showSettings]);

  useEffect(() => {
    const prev = prevSpeechModeRef.current;
    if (prev === speechMode) return;
    prevSpeechModeRef.current = speechMode;

    if (speechMode) clearFocusAnchor();

    if (showSettings) return;
    if (!popupRef.current) return;

    requestAnimationFrame(() => {
      if (showSettings) return;
      const popup = popupRef.current;
      if (!popup || !mainPopupActive) return;

      const active = document.activeElement;
      const focusInPopup = active && popup.contains(active);
      const onText = isOnTextPanel(active);

      if (!speechMode && (onText || textNavActiveRef.current)) {
        resetTextScroll();
        textRef.current?.focus({ preventScroll: true });
        return;
      }

      if (speechMode && textNavActiveRef.current) {
        const blockEl = getTextBlockEl(activeBlockKeyRef.current);
        (blockEl || textBodyRef.current)?.focus({ preventScroll: true });
        return;
      }

      if (!focusInPopup) {
        if (speechMode) {
          if (autoplayingRef.current) {
            focusAnchorRef.current?.focus({ preventScroll: true });
          } else {
            prevArrowRef.current?.focus({ preventScroll: true });
          }
        } else {
          getFirstControlRef()?.focus({ preventScroll: true });
        }
      }
    });
  }, [
    speechMode,
    mainPopupActive,
    getFirstControlRef,
    showSettings,
    getTextPanelFocusEl,
    getTextBlockEl,
    isOnTextPanel,
    resetTextScroll,
    clearFocusAnchor,
  ]);

  const goToArtifact = useCallback(
    (nextId, closeOptions) => {
      if (nextId) {
        onNavigate(nextId);
      } else {
        onClose(closeOptions);
      }
    },
    [onNavigate, onClose]
  );

  const handlePrevArrow = useCallback(() => {
    flashSelected(prevArrowRef);
    if (prevArtifact) {
      goToArtifact(prevArtifact.id);
    } else {
      goToArtifact(null, { focusThemeStart: true });
    }
  }, [goToArtifact, prevArtifact, flashSelected]);

  const handleNextArrow = useCallback(() => {
    flashSelected(nextArrowRef);
    if (nextArtifact) {
      goToArtifact(nextArtifact.id);
    } else {
      goToArtifact(null, { focusThemeStart: true });
    }
  }, [goToArtifact, nextArtifact, flashSelected]);

  const goToImage = useCallback(
    (next, triggerRef) => {
      if (images.length <= 1) return;
      flashSelected(triggerRef);
      clearStoryTransition();

      setCurrentImageIndex(next);
      setTextMode("guided");

      const revealGuided = (block) => {
        if (block) {
          activeBlockKeyRef.current = block.key;
          setActiveBlockKey(block.key);
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (block) scrollBlockToTop(block.key);
            const overflow = hasScrollOverflow(textBodyRef.current);
            setTextScrollable(overflow);
            const manual = !autoplayingRef.current && !transcriptDwellActiveRef.current;
            if (overflow && manual) {
              enterTextNavRef.current?.({
                announceBlock: false,
                focus: true,
                sourceRef: triggerRef,
              });
            } else {
              if (textNavActiveRef.current) resetTextScroll();
              if (isOnTextPanel(document.activeElement)) {
                triggerRef.current?.focus({ preventScroll: true });
              }
            }
          });
        });
      };

      if (isCombined) {
        announce(`Image ${next + 1} of ${images.length}.`, { dedupeMs: 200 });
        revealGuided(null);
        return;
      }

      if (isUnifiedDocumentGuided(artifact, images)) {
        const block = textBlocks.find((b) => b.key === "guided-0") || null;
        const page = getDocumentPageAnnounce(artifact, next, images.length);
        announce(block ? `${page} ${getBlockSpeech(block, false)}` : page, {
          dedupeMs: 200,
        });
        revealGuided(block);
        return;
      }

      if (isLetterGuidedArtifact(artifact)) {
        const prevLetter = getLetterIndexForImage(artifact, currentImageIndex);
        const nextLetter = getLetterIndexForImage(artifact, next);
        const block =
          textBlocks.find((b) => b.key === `guided-letter-${nextLetter}`) || null;

        if (nextLetter !== prevLetter && block) {
          const total = artifact.letterSections?.length ?? 1;
          const position = `Letter ${nextLetter + 1} of ${total}.`;
          announce(`${position} ${getBlockSpeech(block, false)}`, { dedupeMs: 200 });
          revealGuided(block);
          return;
        }

        const page = getDocumentPageAnnounce(artifact, next, images.length);
        announce(block ? `${page} ${getBlockSpeech(block, false)}` : page, {
          dedupeMs: 200,
        });
        revealGuided(block);
        return;
      }

      const block = textBlocks.find((b) => b.kind === "guided" && b.imageIndex === next);
      const position = `Image ${next + 1} of ${images.length}.`;
      announce(block ? `${position} ${getBlockSpeech(block, false)}` : position, {
        dedupeMs: 200,
      });
      revealGuided(block || null);
    },
    [
      artifact,
      images,
      currentImageIndex,
      announce,
      flashSelected,
      isCombined,
      textBlocks,
      scrollBlockToTop,
      clearStoryTransition,
      resetTextScroll,
      isOnTextPanel,
    ]
  );

  const handleNextImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentImageIndex + 1) % images.length, nextImageRef);
  }, [images.length, currentImageIndex, goToImage]);

  const handlePrevImage = useCallback(() => {
    if (images.length < 5) return;
    goToImage(
      (currentImageIndex - 1 + images.length) % images.length,
      prevImageRef
    );
  }, [images.length, currentImageIndex, goToImage]);

  const handleStory = useCallback(() => {
    markAutoplayEnded();
    clearStoryTransition();

    setTextMode("intro");
    textBodyRef.current?.scrollTo({ top: 0, behavior: "auto" });

    const introBlocks = textBlocks.filter((b) => b.kind === "body");
    const introSpeech = introBlocks
      .map((block, i) => getBlockSpeech(block, i === 0))
      .join(" ");
    const introKey = introBlocks[0]?.key ?? null;

    if (introKey) {
      activeBlockKeyRef.current = introKey;
      setActiveBlockKey(introKey);
      setVisualSection("description", introKey);
    }

    if (speechMode && introSpeech) {
      announce(introSpeech, { politeness: "assertive", dedupeMs: 0 });
    }

    scheduleOverflowTextNavRef.current?.(storyBtnRef);

    const imageIndexAtStart = currentImageIndex;
    const speechWaitMs = speechMode ? estimateSpeechDurationMs(introSpeech || "") : 0;
    const delay = autoReadDelayMs(
      speechWaitMs + SECTION_TRANSITION_MS,
      autoReadFastRef.current
    );

    const showGuided = () => {
      storyTransitionTimeoutRef.current = null;
      storyTransitionDeadlineRef.current = null;
      storyTransitionRemainingRef.current = null;
      storyTransitionActiveRef.current = false;
      storyTransitionPlayRef.current = null;

      setTextMode("guided");
      const guided = getGuidedBlockForImage(imageIndexAtStart);
      if (!guided) return;

      activeBlockKeyRef.current = guided.key;
      setActiveBlockKey(guided.key);
      setVisualSection("guided", guided.key);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollBlockToTop(guided.key);
          scheduleOverflowTextNavRef.current?.(storyBtnRef, { onlyIfStillOnPath: true });
        });
      });

      if (speechMode) {
        announce(getBlockSpeech(guided, false), { politeness: "assertive", dedupeMs: 0 });
      }
    };

    storyTransitionPlayRef.current = showGuided;
    storyTransitionActiveRef.current = true;
    storyTransitionDeadlineRef.current = Date.now() + delay;
    storyTransitionTimeoutRef.current = setTimeout(showGuided, delay);
  }, [
    announce,
    clearStoryTransition,
    currentImageIndex,
    getGuidedBlockForImage,
    markAutoplayEnded,
    scrollBlockToTop,
    setVisualSection,
    speechMode,
    textBlocks,
  ]);

  const handleGuidedDescription = useCallback(() => {
    markAutoplayEnded();
    clearStoryTransition();
    setTextMode("guided");

    const guided = getGuidedBlockForImage(currentImageIndex);
    if (!guided) return;

    activeBlockKeyRef.current = guided.key;
    setActiveBlockKey(guided.key);
    setVisualSection("guided", guided.key);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollBlockToTop(guided.key);
        scheduleOverflowTextNavRef.current?.(guidedDescBtnRef);
      });
    });

    if (speechMode) {
      announce(getBlockSpeech(guided, false), { politeness: "assertive", dedupeMs: 0 });
    }
  }, [
    announce,
    clearStoryTransition,
    currentImageIndex,
    getGuidedBlockForImage,
    markAutoplayEnded,
    scrollBlockToTop,
    setVisualSection,
    speechMode,
  ]);

  const closeTranscript = useCallback(() => {
    setTranscriptOpen(false);
    announce("Transcript closed.");
    restoreMainFocus(transcriptBtnRef);
  }, [announce, restoreMainFocus]);

  const openTranscript = useCallback(() => {
    rememberMainFocus();
    markAutoplayEnded();
    setTranscriptOpen(true);
    announce("Transcript window opened.", { politeness: "assertive" });
  }, [announce, markAutoplayEnded, rememberMainFocus]);

  const openZoom = useCallback(() => {
    rememberMainFocus();
    markAutoplayEnded();
    setSnapIndex(0);
    setZoomOpen(true);
    announce("Zoom mode. Snap up or down to see the image.", { politeness: "assertive" });
  }, [announce, markAutoplayEnded, rememberMainFocus]);

  const exitZoom = useCallback(() => {
    setZoomOpen(false);
    setSnapIndex(0);
    announce("Exited zoom mode.");
    restoreMainFocus(zoomOrPlayRef);
  }, [announce, restoreMainFocus]);

  const handleVideoToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      videoAutoplayRef.current = false;
      video.pause();
      setIsVideoPlaying(false);
      setVideoOverlayOpen(false);
      setVisualSection(null);
      return;
    }

    markAutoplayEnded();
    beginInlineVideo(false);
  }, [beginInlineVideo, markAutoplayEnded, setVideoOverlayOpen, setVisualSection]);

  const handlePrimaryAction = openZoom;

  const applyTextSnap = useCallback(
    (index, { announceBlock = false, forceAnnounce = false } = {}) => {
      const snaps = textSnapsRef.current;
      const snap = snaps[index];
      if (!snap) return;

      const prevKey = activeBlockKeyRef.current;
      textSnapIndexRef.current = index;
      activeBlockKeyRef.current = snap.blockKey;
      setActiveBlockKey(snap.blockKey);

      const el = textBodyRef.current;
      if (el) {
        clearTextAutoScroll();
        el.scrollTo({ top: snap.scrollTop, behavior: "smooth" });
      }

      if (
        speechMode &&
        announceBlock &&
        (forceAnnounce || snap.blockKey !== prevKey)
      ) {
        const blockIndex = visibleBlocks.findIndex((b) => b.key === snap.blockKey);
        const block = visibleBlocks[blockIndex];
        if (block) {
          announce(getBlockSpeech(block, blockIndex === 0), { dedupeMs: 200 });
        }
      }
    },
    [speechMode, visibleBlocks, announce, clearTextAutoScroll]
  );

  const exitTextNav = useCallback(
    (direction) => {
      const sourceEl = textNavSourceRef.current?.current;
      resetTextScroll();
      if (sourceEl) {
        sourceEl.focus({ preventScroll: true });
        return;
      }
      // Panel is no longer in the L/K ring; exit goes to the toolbar or back arrow.
      if (direction === "next") {
        getFirstToolbarButton()?.focus({ preventScroll: true });
      } else {
        prevArrowRef.current?.focus({ preventScroll: true });
      }
    },
    [resetTextScroll, getFirstToolbarButton]
  );

  const enterTextNav = useCallback(
    ({ announceBlock = true, focus = false, sourceRef = null } = {}) => {
      const panel = textBodyRef.current;
      if (!hasScrollOverflow(panel)) return false;

      const snaps = refreshTextSnaps();
      if (snaps.length === 0) return false;

      textNavActiveRef.current = true;
      setTextNavActive(true);
      textNavSourceRef.current = sourceRef || null;

      let index = 0;
      const currentKey = activeBlockKeyRef.current;
      if (currentKey) {
        const found = snaps.findIndex((s) => s.blockKey === currentKey);
        if (found >= 0) index = found;
      }
      applyTextSnap(index, { announceBlock, forceAnnounce: announceBlock });
      if (focus) {
        getTextPanelFocusEl()?.focus({ preventScroll: true });
      }
      return true;
    },
    [applyTextSnap, refreshTextSnaps, getTextPanelFocusEl]
  );
  enterTextNavRef.current = enterTextNav;

  /**
   * Story / Previous Image / Next Image hand the focus to the text panel, but
   * only when the copy they just revealed actually overflows and only while the
   * visitor is driving. Auto-read scrolls the panel itself and must keep focus.
   */
  scheduleOverflowTextNavRef.current = (sourceRef, { onlyIfStillOnPath = false } = {}) => {
    if (autoplayingRef.current || transcriptDwellActiveRef.current) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (autoplayingRef.current || transcriptDwellActiveRef.current) return;
        const overflow = hasScrollOverflow(textBodyRef.current);
        setTextScrollable(overflow);
        if (!overflow) return;
        const active = document.activeElement;
        const stillOnPath =
          textNavActiveRef.current ||
          active === sourceRef?.current ||
          isOnTextPanel(active);
        if (onlyIfStillOnPath && !stillOnPath) return;
        enterTextNav({ announceBlock: false, focus: true, sourceRef });
      });
    });
  };

  const stepTextNav = useCallback(
    (direction) => {
      const snaps = refreshTextSnaps();
      if (snaps.length === 0) {
        exitTextNav(direction);
        return;
      }
      const index = Math.min(textSnapIndexRef.current, snaps.length - 1);
      if (direction === "next") {
        if (index + 1 < snaps.length) {
          applyTextSnap(index + 1, { announceBlock: true });
        } else {
          exitTextNav("next");
        }
      } else if (index > 0) {
        applyTextSnap(index - 1, { announceBlock: true });
      } else {
        exitTextNav("back");
      }
    },
    [applyTextSnap, exitTextNav, refreshTextSnaps]
  );
  stepTextNavRef.current = stepTextNav;

  const handlePopupKeyDown = useCallback(
    (e) => {
      if (e.repeat) return;
      if (showSettings) return;
      if (transcriptOpen) return;

      const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
      const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
      const isSelect = e.key === "Enter" || e.key === "j";
      if (!isNext && !isBack && !isSelect) return;

      // Any intentional nav/select during transcript dwell cancels auto-advance
      if (transcriptDwellActiveRef.current) {
        clearTranscriptDwell();
        setVisualSection(null);
      }

      // First move off the silent anchor: next enters the text section, back
      // goes to the previous-artifact arrow, and the anchor drops out of the order.
      if (document.activeElement === focusAnchorRef.current) {
        e.preventDefault();
        e.stopPropagation();
        if (isNext) {
          const focusables = getPopupFocusables();
          const textEl = getTextPanelFocusEl();
          const next =
            (textScrollable && textEl) ||
            focusables.find((el) => el !== prevArrowRef.current) ||
            getFirstControlRef();
          next?.focus({ preventScroll: true });
          clearFocusAnchor();
        } else if (isBack) {
          prevArrowRef.current?.focus({ preventScroll: true });
          clearFocusAnchor();
        }
        return;
      }

      if (textNavActiveRef.current) {
        e.preventDefault();
        e.stopPropagation();
        if (isSelect) return;
        stepTextNav(isNext ? "next" : "back");
        return;
      }

      const focusables = getPopupFocusables();

      if (isSelect) {
        e.preventDefault();
        e.stopPropagation();
        const active = document.activeElement;
        if (active === prevArrowRef.current) handlePrevArrow();
        else if (active === nextArrowRef.current) handleNextArrow();
        else if (active === storyBtnRef.current) handleStory();
        else if (active === guidedDescBtnRef.current) handleGuidedDescription();
        else if (active === prevImageRef.current) handlePrevImage();
        else if (active === nextImageRef.current) handleNextImage();
        else if (active === playBtnRef.current || active === pauseBtnRef.current) {
          handleVideoToggle();
        }
        else if (active === transcriptBtnRef.current) openTranscript();
        else if (active === zoomOrPlayRef.current) handlePrimaryAction();
        else if (isOnTextPanel(active)) {
          enterTextNav();
        }
        return;
      }

      const active = document.activeElement;

      e.preventDefault();
      e.stopPropagation();

      // Panel is focusable for overflow hand-off / Select, but not in the ring.
      if (isOnTextPanel(active)) {
        if (isNext) getFirstToolbarButton()?.focus({ preventScroll: true });
        else if (isBack) prevArrowRef.current?.focus({ preventScroll: true });
        return;
      }

      const idx = focusables.indexOf(active);
      if (idx === -1) {
        if (isNext) focusables[0]?.focus();
        else if (isBack) prevArrowRef.current?.focus();
        return;
      }
      if (isNext) {
        if (idx >= 0 && idx < focusables.length - 1) {
          focusables[idx + 1].focus();
        } else if (idx === focusables.length - 1) {
          handleNextArrow();
        }
      } else if (isBack) {
        if (idx > 0) {
          focusables[idx - 1].focus();
        } else if (idx === 0) {
          handlePrevArrow();
        }
      }
    },
    [
      showSettings,
      transcriptOpen,
      getPopupFocusables,
      handlePrevArrow,
      handleNextArrow,
      handleStory,
      handleGuidedDescription,
      handlePrevImage,
      handleNextImage,
      handleVideoToggle,
      openTranscript,
      handlePrimaryAction,
      setVisualSection,
      clearTranscriptDwell,
      enterTextNav,
      stepTextNav,
      clearFocusAnchor,
      getTextPanelFocusEl,
      isOnTextPanel,
      textScrollable,
      getFirstControlRef,
      getFirstToolbarButton,
    ]
  );

  const handleTranscriptKeyDown = useCallback((e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (key !== "l" && key !== "k") return;

    const body = transcriptBodyRef.current;
    const exitBtn = transcriptExitRef.current;
    if (!body || !exitBtn) return;

    const maxScroll = body.scrollHeight - body.clientHeight;
    if (maxScroll <= 0 && document.activeElement === body) {
      e.preventDefault();
      e.stopPropagation();
      exitBtn.focus();
      return;
    }

    if (key === "l" && document.activeElement === body && body.scrollTop >= maxScroll - 1) {
      e.preventDefault();
      e.stopPropagation();
      body.scrollTo({ top: 0, behavior: "smooth" });
      exitBtn.focus();
      return;
    }

    stepScrollKeyDown(e, transcriptBodyRef);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.repeat || e.key !== "Escape") return;
      if (showSettings) return;
      if (zoomOpen) {
        e.preventDefault();
        exitZoom();
      } else if (transcriptOpen) {
        e.preventDefault();
        closeTranscript();
      } else {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSettings, zoomOpen, transcriptOpen, exitZoom, closeTranscript, onClose]);

  const atSnapTop = snapIndex === 0;
  const atSnapBottom = snapIndex >= totalSteps - 1;

  const measureSnapPane = useCallback((clampIndex = true) => {
    const win = snapWindowRef.current;
    const img = snapImageRef.current;
    if (!win || !img || !img.naturalWidth) return;
    const windowH = win.clientHeight;
    const renderedW = win.clientWidth * 0.95;
    const renderedH = (img.naturalHeight / img.naturalWidth) * renderedW;
    const steps = Math.max(2, Math.ceil(renderedH / windowH));
    setSnapPaneHeight(windowH);
    setTotalSteps(steps);
    if (clampIndex) {
      setSnapIndex((prev) => Math.min(prev, steps - 1));
    }
  }, []);

  useEffect(() => {
    if (!zoomOpen || !currentImage) return;

    const run = () => {
      measureSnapPane(false);
      setSnapIndex(0);
    };

    requestAnimationFrame(run);

    const img = snapImageRef.current;
    const onLoad = () => {
      measureSnapPane(false);
      setSnapIndex(0);
    };
    if (img && !img.complete) {
      img.addEventListener("load", onLoad);
      return () => img.removeEventListener("load", onLoad);
    }
  }, [zoomOpen, currentImage, measureSnapPane]);

  useEffect(() => {
    if (!zoomOpen) return;
    const el = snapWindowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureSnapPane(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoomOpen, measureSnapPane]);

  const focusOppositeAfterSnap = useCallback((which) => {
    setTimeout(() => {
      if (which === "up") {
        if (snapDownRef.current && !snapDownRef.current.disabled) {
          snapDownRef.current.focus();
        }
      } else if (snapUpRef.current && !snapUpRef.current.disabled) {
        snapUpRef.current.focus();
      }
    }, 0);
  }, []);

  const snapStepUp = () => {
    if (atSnapTop) return;
    const nextIndex = Math.max(0, snapIndex - 1);
    setSnapIndex(nextIndex);
    if (nextIndex === 0) {
      announce("Top of image.", { politeness: "assertive" });
      focusOppositeAfterSnap("up");
    } else {
      announce(`Step ${nextIndex + 1} of ${totalSteps}.`, { politeness: "assertive" });
    }
  };

  const snapStepDown = () => {
    if (atSnapBottom) return;
    const nextIndex = Math.min(totalSteps - 1, snapIndex + 1);
    setSnapIndex(nextIndex);
    if (nextIndex === totalSteps - 1) {
      announce("Bottom of image.", { politeness: "assertive" });
      focusOppositeAfterSnap("down");
    } else {
      announce(`Step ${nextIndex + 1} of ${totalSteps}.`, { politeness: "assertive" });
    }
  };

  const snapImageStyle = (() => {
    if (snapIndex === 0) {
      return { top: 0, bottom: "auto", left: "50%", transform: "translateX(-50%)" };
    }
    if (snapIndex === totalSteps - 1) {
      return { bottom: 0, top: "auto", left: "50%", transform: "translateX(-50%)" };
    }
    return {
      top: `${-snapIndex * snapPaneHeight}px`,
      bottom: "auto",
      left: "50%",
      transform: "translateX(-50%)",
    };
  })();

  if (!artifact) return null;

  const hasTranscript = showsTranscriptButton(artifact, isVideo);
  const transcriptText = hasTranscript ? textOrMissing(artifact.transcriptText) : null;
  // Title only — auto-read then announces description (avoids "details" + repeated title).
  const dialogAriaLabel = artifact.title;

  const autoplayBtnClass = (section) =>
    visualActiveSection === section ? " carousel-btn--autoplay-active" : "";

  return (
    <div className="artifact-popup-scrim">
      <div
        className={`artifact-popup${isVideoPlaying ? " artifact-popup--video-active" : ""}${
          isAutoplaying ? " artifact-popup--autoplaying" : ""
        }`}
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label={dialogAriaLabel}
        onKeyDown={handlePopupKeyDown}
      >
        {(speechMode || focusAnchorActive) && (
          <div
            ref={focusAnchorRef}
            className="artifact-popup-focus-anchor"
            tabIndex={0}
            data-autofocus
            aria-hidden={speechMode ? undefined : true}
          />
        )}
        <button
          type="button"
          ref={prevArrowRef}
          className="artifact-popup-nav-arrow artifact-popup-nav-arrow--prev"
          onClick={handlePrevArrow}
          aria-label={
            prevArtifact
              ? `Previous artifact: ${prevArtifact.displayTitle}. Press select key to enter this artifact.`
              : "Back to theme"
          }
        />

        <div className="artifact-popup-card">
          <div className="artifact-popup-media">
            {isVideo ? (
              <video
                ref={videoRef}
                src={artifact.videoSrc}
                poster={artifact.posterSrc}
                preload="metadata"
                tabIndex={-1}
                aria-hidden="true"
                onPlay={() => {
                  stopNvdaSpeechAggressively();
                  setIsVideoPlaying(true);
                  setVideoOverlayOpen(true);
                }}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={handleVideoEnded}
              />
            ) : currentImage ? (
              <img src={currentImage.src} alt="" aria-hidden="true" />
            ) : (
              <div className="artifact-popup-media-empty">No image available</div>
            )}
          </div>

          {hasMultipleImages && (
            <div className="artifact-popup-image-dots" aria-hidden="true">
              {images.map((_, i) => (
                <span key={i} className={`indicator ${i === currentImageIndex ? "active" : ""}`} />
              ))}
            </div>
          )}

          <div className="artifact-popup-controls" role="toolbar" aria-label="Artifact controls">
            {showStoryButton && (
              <button
                type="button"
                ref={storyBtnRef}
                className={`carousel-btn${
                  storyBtnFocused ||
                  (isAutoplaying && visualActiveSection === "description")
                    ? " is-selected"
                    : ""
                }`}
                onClick={handleStory}
                onFocus={() => setStoryBtnFocused(true)}
                onBlur={() => setStoryBtnFocused(false)}
                aria-label="Story"
              >
                Story
              </button>
            )}
            {isVideo && (
              <>
                <button
                  type="button"
                  ref={playBtnRef}
                  className={`carousel-btn${
                    activeVideoBtn === "play" ? autoplayBtnClass("play") : ""
                  }`}
                  onClick={handleVideoToggle}
                  onFocus={() => setHeldVideoBtn("play")}
                  tabIndex={!isVideoPlaying || heldVideoBtn === "play" ? 0 : -1}
                  aria-disabled={isVideoPlaying ? true : undefined}
                  aria-label="Play video"
                >
                  Play
                </button>
                <button
                  type="button"
                  ref={pauseBtnRef}
                  className={`carousel-btn${
                    activeVideoBtn === "pause" ? autoplayBtnClass("play") : ""
                  }`}
                  onClick={handleVideoToggle}
                  onFocus={() => setHeldVideoBtn("pause")}
                  tabIndex={isVideoPlaying || heldVideoBtn === "pause" ? 0 : -1}
                  aria-disabled={!isVideoPlaying ? true : undefined}
                  aria-label="Pause video"
                >
                  Pause
                </button>
              </>
            )}
            {showGuidedDescriptionButton && (
              <button
                type="button"
                ref={guidedDescBtnRef}
                className={`carousel-btn${
                  guidedDescBtnFocused ||
                  (isAutoplaying && visualActiveSection === "guided")
                    ? " is-selected"
                    : ""
                }`}
                onClick={handleGuidedDescription}
                onFocus={() => setGuidedDescBtnFocused(true)}
                onBlur={() => setGuidedDescBtnFocused(false)}
                aria-label="Guided Description"
              >
                Guided Description
              </button>
            )}
            {!isVideo && hasPrevImageButton && (
              <button
                type="button"
                ref={prevImageRef}
                className="carousel-btn"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                Previous Image
              </button>
            )}
            {!isVideo && hasMultipleImages && (
              <button
                type="button"
                ref={nextImageRef}
                className={`carousel-btn${autoplayBtnClass("nextImage")}`}
                onClick={handleNextImage}
                aria-label="Next image"
              >
                Next Image
              </button>
            )}
            {!isVideo && (
              <button
                type="button"
                ref={zoomOrPlayRef}
                className={`carousel-btn${zoomOpen ? " is-selected" : ""}`}
                onClick={handlePrimaryAction}
                aria-label="Zoom"
              >
                Zoom
              </button>
            )}
            {hasTranscript && (
              <button
                type="button"
                ref={transcriptBtnRef}
                className={`carousel-btn${autoplayBtnClass("transcript")}${
                  transcriptOpen ? " is-selected" : ""
                }`}
                onClick={openTranscript}
                aria-label="Transcript"
              >
                Transcript
              </button>
            )}
          </div>

          <div className="artifact-popup-text-wrap">
            <div
              className={`artifact-popup-text${isAutoplaying ? " is-reading" : ""}${
                textNavActive ? " is-entered" : ""
              }`}
              ref={textRef}
              tabIndex={speechMode || !textScrollable ? -1 : 0}
              data-autofocus={!speechMode && !focusAnchorActive && textScrollable ? true : undefined}
              onClick={() => enterTextNav()}
            >
              <div className="artifact-popup-text-header" aria-hidden={speechMode ? true : undefined}>
                <h2 className="artifact-popup-title" aria-hidden={speechMode ? true : undefined}>
                  {artifact.title}
                </h2>
              </div>
              <div className="artifact-popup-text-body-wrap">
                <div
                  className="artifact-popup-text-body"
                  ref={textBodyRef}
                  tabIndex={speechMode && !isAutoplaying && textScrollable ? 0 : -1}
                  role={speechMode ? "group" : undefined}
                  aria-hidden={speechMode && isAutoplaying ? true : undefined}
                  aria-label={speechMode ? TEXT_PANEL_SUMMARY : undefined}
                >
                  {visibleBlocks.map((block) =>
                    block.kind === "guided" ? (
                      <section
                        key={block.key}
                        data-block-key={block.key}
                        tabIndex={-1}
                        className={`artifact-popup-guided-section${
                          activeBlockKey === block.key ? " is-active" : ""
                        }`}
                      >
                        <h3 className="artifact-popup-guided-heading">
                          {block.heading}
                          {block.tagline && (
                            <span className="artifact-popup-guided-subtitle-inline">
                              {block.tagline}
                            </span>
                          )}
                        </h3>
                        <p className="artifact-popup-description">{block.text}</p>
                      </section>
                    ) : (
                      <p
                        key={block.key}
                        data-block-key={block.key}
                        tabIndex={-1}
                        className={`artifact-popup-description${
                          activeBlockKey === block.key ? " is-active" : ""
                        }`}
                      >
                        {block.text}
                      </p>
                    )
                  )}
                </div>
                {scrollMarkers.length > 1 && (
                  <div className="artifact-popup-scroll-markers" aria-hidden="true">
                    {scrollMarkers.map((marker) => (
                      <span
                        key={marker.key}
                        className={`artifact-popup-scroll-marker${
                          activeBlockKey === marker.key ? " is-active" : ""
                        }`}
                        style={{ top: `${marker.topPct}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {transcriptOpen && transcriptText && (
            <div
              className="artifact-popup-transcript"
              ref={transcriptPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Transcript"
            >
              <button
                type="button"
                ref={transcriptExitRef}
                className="exit-pill-btn artifact-popup-transcript-exit"
                onClick={closeTranscript}
                aria-label="Close transcript"
              >
                Exit
              </button>
              <h2 className="artifact-popup-transcript-heading">Transcript</h2>
              <div
                className="artifact-popup-transcript-body"
                ref={transcriptBodyRef}
                tabIndex={0}
                onKeyDown={handleTranscriptKeyDown}
                data-autofocus=""
              >
                {transcriptText.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          ref={nextArrowRef}
          className="artifact-popup-nav-arrow artifact-popup-nav-arrow--next"
          onClick={handleNextArrow}
          aria-label={
            nextArtifact
              ? `Next artifact: ${nextArtifact.displayTitle}. Press select key to enter this artifact.`
              : AUTO_READ_THEME_END_PROMPT
          }
        />
      </div>

      {zoomOpen && !isVideo && currentImage && (
        <div
          className="carousel-zoom"
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom view"
        >
          <div className="snap-zoom-panel">
            <div className="snap-zoom-window" ref={snapWindowRef}>
              <img
                ref={snapImageRef}
                src={currentImage.src}
                alt={currentImage.alt}
                className="snap-zoom-image"
                style={snapImageStyle}
                tabIndex={-1}
              />
            </div>
            <div className="snap-zoom-controls" role="toolbar" aria-label="Zoom scroll controls">
              <div className="document-toolbar-arrows" role="toolbar" aria-label="Snap image view">
                <button
                  type="button"
                  ref={snapUpRef}
                  onClick={snapStepUp}
                  className="carousel-btn carousel-btn-icon document-arrow-up"
                  aria-disabled={atSnapTop ? true : undefined}
                  aria-label="Snap view up one step"
                >
                  <img src="Back.svg" alt="" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  ref={snapDownRef}
                  onClick={snapStepDown}
                  className="carousel-btn carousel-btn-icon document-arrow-down"
                  aria-disabled={atSnapBottom ? true : undefined}
                  aria-label="Snap view down one step"
                  data-autofocus=""
                >
                  <img src="Back.svg" alt="" aria-hidden="true" />
                </button>
              </div>
              <button type="button" onClick={exitZoom} className="carousel-btn" aria-label="Exit zoom mode">
                Exit Zoom
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
