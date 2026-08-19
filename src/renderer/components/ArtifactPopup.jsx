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
import { useHeadphoneSinkEffect } from "../audio/AudioRoutingProvider";
import {
  BRAILLE_OUTPUT_SETTLE_MS,
  stopNvdaSpeechAfterBrailleSettle,
  stopNvdaSpeechAggressively,
} from "../audio/nvdaSpeechControl";
import {
  DESCRIPTION_MODE_COMBINED,
  getArtifact,
  getNextArtifact,
  getPrevArtifact,
} from "../data/artifacts";
import { MISSING_COPY, textOrMissing } from "../data/contentPlaceholder";

const SCROLL_STEP_RATIO = 0.75;
const WORDS_PER_SEC = 2.4;
const CHUNK_BUFFER_MS = 6000;
const AUTO_READ_END_PROMPT = "Press Select for next Artifact description";
const TRANSCRIPT_AUTOPLAY_PROMPT =
  "Transcript. Press Select for the full transcript of this artifact.";
const AUTO_READ_THEME_END_PROMPT =
  "End of artifacts in this theme. Press Select to return to the start of the theme.";
const TRANSCRIPT_DWELL_MS = 6000;
const VIDEO_END_DWELL_MS = 1000;
const VIDEO_AUTOPLAY_PROMPT = "The video will now play.";
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

function estimateChunkDurationMs(text) {
  const words = countWords(text);
  return Math.round((words / WORDS_PER_SEC) * 1000) + CHUNK_BUFFER_MS;
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

function getGuidedTextForImage(artifact, images, imageIndex) {
  const fromImage = images[imageIndex]?.guidedDescription?.trim();
  if (fromImage) return fromImage;
  if (imageIndex === 0) {
    const fromArtifact = artifact?.guidedDescription?.trim();
    if (fromArtifact) return fromArtifact;
  }
  return MISSING_COPY;
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

function getBlockSpeech(block, isFirst) {
  if (block.kind === "guided") {
    return [block.heading, block.tagline, block.text].filter(Boolean).join(". ");
  }
  // Dialog aria-label already announces the title on open.
  return isFirst ? `Artifact description. ${block.text}` : block.text;
}

function buildAutoplayChunks(artifact, blocks, isVideo) {
  if (!artifact) return [];

  const chunks = blocks.map((block, i) => ({
    text: getBlockSpeech(block, i === 0),
    imageIndex: block.imageIndex,
    section: block.kind === "guided" ? "guided" : "description",
    blockKey: block.key,
  }));

  if (!isVideo) return chunks;

  // Video artifacts hand off to playback rather than stepping through images;
  // beginInlineVideo speaks the guided copy just before the video starts.
  const spoken = chunks.filter((chunk) => chunk.section === "description");
  spoken.push({
    text: VIDEO_AUTOPLAY_PROMPT,
    imageIndex: 0,
    section: "videoPrompt",
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
      const autofocusTarget = container.querySelector("[data-autofocus]");
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

function getVideoAlt(artifact) {
  if (!artifact) return "";
  if (artifact.id === "3A1") return "Helen Keller rides a biplane, 1919";
  const base = artifact.displayTitle || artifact.title || "Video preview";
  return artifact.year ? `${base} (${artifact.year})` : base;
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
  const { speechMode, isPaused, setVideoOverlayOpen, showSettings } = useAppState();
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
  const isCombined = theme?.descriptionMode === DESCRIPTION_MODE_COMBINED;

  const textBlocks = useMemo(
    () => buildTextBlocks(artifact, images, isCombined),
    [artifact, images, isCombined]
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [visualActiveSection, setVisualActiveSection] = useState(null);
  const [activeBlockKey, setActiveBlockKey] = useState(null);
  const [isTextScrollable, setIsTextScrollable] = useState(false);
  const [scrollMarkers, setScrollMarkers] = useState([]);

  const popupRef = useRef(null);
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
  const transcriptDwellHasNextRef = useRef(false);
  const transcriptDwellActiveRef = useRef(false);
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
  const nextImageRef = useRef(null);
  const transcriptBtnRef = useRef(null);
  const zoomOrPlayRef = useRef(null);
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

  useHeadphoneSinkEffect(videoRef, artifact?.videoSrc);

  const mainPopupActive = !zoomOpen && !transcriptOpen;
  useFocusTrap(popupRef, mainPopupActive && !showSettings, {
    skipAutofocusRef: skipNextTrapAutofocusRef,
    initialFocusDoneRef: popupInitialFocusDoneRef,
    autofocusOnActivate: !speechMode,
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
    setActiveBlockKey(
      section === "description" || section === "guided" ? blockKey : null
    );
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

    let top = 0;
    let node = block;
    while (node && node !== panel) {
      top += node.offsetTop;
      node = node.parentElement;
    }
    return Math.max(0, top);
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
    autoplayDoneRef.current = true;
    setIsAutoplaying(false);
    setVisualSection(null);
  }, [cancelAutoplay, clearTranscriptDwell, setVisualSection]);

  const landOnNextArrowEnd = useCallback(
    (hasNext) => {
      clearTranscriptDwell();
      setVisualSection(null);
      requestAnimationFrame(() => {
        nextArrowRef.current?.focus({ preventScroll: true });
      });
      announce(hasNext ? AUTO_READ_END_PROMPT : AUTO_READ_THEME_END_PROMPT, {
        politeness: "assertive",
      });
    },
    [announce, clearTranscriptDwell, setVisualSection]
  );

  const startTranscriptDwell = useCallback(
    (hasNext) => {
      setVisualSection("transcript");
      transcriptBtnRef.current?.focus({ preventScroll: true });
      announce(TRANSCRIPT_AUTOPLAY_PROMPT, { politeness: "assertive" });

      clearTranscriptDwell();
      transcriptDwellActiveRef.current = true;
      transcriptDwellHasNextRef.current = hasNext;
      transcriptDwellDeadlineRef.current = Date.now() + TRANSCRIPT_DWELL_MS;
      transcriptDwellTimeoutRef.current = setTimeout(() => {
        transcriptDwellTimeoutRef.current = null;
        transcriptDwellDeadlineRef.current = null;
        transcriptDwellRemainingRef.current = null;
        transcriptDwellActiveRef.current = false;
        landOnNextArrowEnd(hasNext);
      }, TRANSCRIPT_DWELL_MS);
    },
    [announce, clearTranscriptDwell, setVisualSection, landOnNextArrowEnd]
  );

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
      } else {
        setVisualSection(null);
        flashSelected(zoomOrPlayRef);
      }

      // A live-region update reaches NVDA braille first. Speech is then cut
      // aggressively before media starts, matching quote playback behavior.
      const describing = isCombined
        ? textBlocks
        : textBlocks.filter((block) => block.kind === "guided");
      const spoken = describing.map((block) => getBlockSpeech(block, false)).join(" ");
      if (spoken) {
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
      landOnNextArrowEnd(Boolean(nextArtifact));
    }, VIDEO_END_DWELL_MS);
  }, [landOnNextArrowEnd, nextArtifact, setVideoOverlayOpen, setVisualSection]);

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

  const getPopupFocusables = useCallback(() => {
    const hasTranscriptLocal =
      typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
    const textFocusable =
      speechMode || isTextScrollable ? getTextPanelFocusEl() : null;
    if (isVideo) {
      return [
        prevArrowRef.current,
        textFocusable,
        zoomOrPlayRef.current,
        hasTranscriptLocal ? transcriptBtnRef.current : null,
        nextArrowRef.current,
      ].filter(Boolean);
    }
    return [
      prevArrowRef.current,
      textFocusable,
      hasTranscriptLocal ? transcriptBtnRef.current : null,
      hasMultipleImages ? nextImageRef.current : null,
      zoomOrPlayRef.current,
      nextArrowRef.current,
    ].filter(Boolean);
  }, [speechMode, hasMultipleImages, artifact, isVideo, isTextScrollable, getTextPanelFocusEl]);

  const getFirstControlRef = useCallback(() => {
    if (isVideo) return zoomOrPlayRef.current;
    const hasTranscriptLocal =
      typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
    if (hasTranscriptLocal) return transcriptBtnRef.current;
    if (hasMultipleImages) return nextImageRef.current;
    return zoomOrPlayRef.current;
  }, [isVideo, artifact, hasMultipleImages]);

  const focusVisualActiveOrFallback = useCallback(
    (isNext) => {
      const section = visualActiveSectionRef.current;
      if (section === "nextImage" && nextImageRef.current) {
        nextImageRef.current.focus({ preventScroll: true });
        return;
      }
      if (section === "guided" && getTextPanelFocusEl()) {
        getTextPanelFocusEl()?.focus({ preventScroll: true });
        return;
      }
      if (section === "transcript" && transcriptBtnRef.current) {
        transcriptBtnRef.current.focus({ preventScroll: true });
        return;
      }
      if (section === "description" && speechMode && getTextPanelFocusEl()) {
        getTextPanelFocusEl()?.focus({ preventScroll: true });
        return;
      }
      if (isNext) {
        getFirstControlRef()?.focus({ preventScroll: true });
      } else {
        prevArrowRef.current?.focus({ preventScroll: true });
      }
    },
    [getFirstControlRef, speechMode, getTextPanelFocusEl]
  );

  useEffect(() => {
    autoplayDoneRef.current = false;
    clearTranscriptDwell();
  }, [artifactId, clearTranscriptDwell]);

  useEffect(() => {
    if (artifact && !speechMode) {
      announce(`${artifact.title} opened.`, { politeness: "assertive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearTranscriptDwell();
    };
  }, [clearTranscriptDwell]);

  useEffect(() => {
    if (!speechMode || !artifact) return;
    if (isPausedRef.current) return;
    if (zoomOpen || transcriptOpen) {
      cancelAutoplay();
      clearTranscriptDwell();
      setIsAutoplaying(false);
      setVisualSection(null);
      autoplayDoneRef.current = true;
      return;
    }
    if (autoplayDoneRef.current) return;

    const chunks = buildAutoplayChunks(artifact, textBlocks, isVideo);
    if (chunks.length === 0) return;

    const hasTranscriptLocal =
      typeof artifact.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
    const hasNext = Boolean(nextArtifact);

    let chunkIndex = 0;
    autoplayingRef.current = true;
    setIsAutoplaying(true);
    setVisualSection(null);
    // Quote-style: braille reads from focused text panel; live region drives speech only.
    getTextPanelFocusEl()?.focus({ preventScroll: true });
    const cancelSpeechStop = stopNvdaSpeechAfterBrailleSettle({
      settleMs: BRAILLE_OUTPUT_SETTLE_MS,
      followUpMs: 180,
    });

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
          startTranscriptDwell(hasNext);
        } else {
          landOnNextArrowEnd(hasNext);
        }
        return;
      }

      const chunk = chunks[chunkIndex];
      setCurrentImageIndex(chunk.imageIndex);
      setVisualSection(
        chunk.section === "videoPrompt" ? "play" : chunk.section,
        chunk.blockKey
      );

      const isFirstGuided = chunk.section === "guided" && chunk.imageIndex === 0;
      announce(chunk.text, {
        politeness: "assertive",
        append: isFirstGuided,
      });
      chunkIndex += 1;

      if (chunk.section === "videoPrompt") {
        clearTextAutoScroll();
        const delay = estimateChunkDurationMs(chunk.text);
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

      const delay = estimateChunkDurationMs(chunk.text);
      if (chunk.section === "description" || chunk.section === "guided") {
        scrollBlockToTop(chunk.blockKey);
        startTextAutoScroll(delay, chunk.blockKey);
      } else {
        clearTextAutoScroll();
      }
      autoplayPlayNextRef.current = playNext;
      autoplayDeadlineRef.current = Date.now() + delay;
      autoplayTimeoutRef.current = setTimeout(playNext, delay);
    };

    autoplayPlayNextRef.current = playNext;
    autoplayDeadlineRef.current = Date.now() + 100;
    autoplayTimeoutRef.current = setTimeout(playNext, 100);

    return () => {
      cancelSpeechStop();
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
    nextArtifact,
    zoomOpen,
    transcriptOpen,
    announce,
    cancelAutoplay,
    clearTranscriptDwell,
    setVisualSection,
    startTranscriptDwell,
    landOnNextArrowEnd,
    startTextAutoScroll,
    clearTextAutoScroll,
    scrollBlockToTop,
    beginInlineVideo,
  ]);

  useEffect(() => {
    if (!autoplayingRef.current && !transcriptDwellActiveRef.current) return;

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
      const hasNext = transcriptDwellHasNextRef.current;
      transcriptDwellRemainingRef.current = null;
      transcriptDwellDeadlineRef.current = Date.now() + delay;
      transcriptDwellTimeoutRef.current = setTimeout(() => {
        transcriptDwellTimeoutRef.current = null;
        transcriptDwellDeadlineRef.current = null;
        transcriptDwellActiveRef.current = false;
        landOnNextArrowEnd(hasNext);
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
    return () => {
      if (videoStartTimeoutRef.current !== null) {
        clearTimeout(videoStartTimeoutRef.current);
      }
      videoRef.current?.pause();
      setVideoOverlayOpen(false);
    };
  }, [setVideoOverlayOpen]);

  useEffect(() => {
    if (textBodyRef.current) {
      textBodyRef.current.scrollTop = 0;
    }
  }, [artifactId]);

  // Only enable scrolling / scrollbar when the text panel actually overflows,
  // and place a marker on the track for each block the panel can scroll to.
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
      setIsTextScrollable(needsScroll);

      if (!needsScroll || textBlocks.length < 2) {
        setScrollMarkers([]);
        return;
      }

      const panelTop = el.getBoundingClientRect().top;
      const total = el.scrollHeight;
      const next = [];
      for (const block of textBlocks) {
        const node = el.querySelector(`[data-block-key="${block.key}"]`);
        if (!node) continue;
        const offset = node.getBoundingClientRect().top - panelTop + el.scrollTop;
        next.push({
          key: block.key,
          topPct: Math.min(100, Math.max(0, (offset / total) * 100)),
        });
      }
      setScrollMarkers((prev) => {
        const same =
          prev.length === next.length &&
          prev.every(
            (m, i) => m.key === next[i].key && Math.abs(m.topPct - next[i].topPct) < 0.1
          );
        return same ? prev : next;
      });
    };

    measure();
    const rafId = requestAnimationFrame(measure);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      el.classList.remove("artifact-popup-text--scrollable");
    };
  }, [textBlocks, artifactId]);

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
      markAutoplayEnded();
      focusVisualActiveOrFallback(isNext);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [markAutoplayEnded, focusVisualActiveOrFallback, showSettings]);

  useEffect(() => {
    if (showSettings) return;
    if (!isAutoplaying || !speechMode || !mainPopupActive) return;

    requestAnimationFrame(() => {
      if (showSettings) return;
      if (!autoplayingRef.current) return;
      const active = document.activeElement;
      const textFocus = getTextPanelFocusEl();
      if (active === textFocus) return;
      textFocus?.focus({ preventScroll: true });
    });
  }, [isAutoplaying, speechMode, mainPopupActive, showSettings, getTextPanelFocusEl]);

  useEffect(() => {
    const prev = prevSpeechModeRef.current;
    if (prev === speechMode) return;
    prevSpeechModeRef.current = speechMode;

    if (showSettings) return;
    if (!popupRef.current) return;

    requestAnimationFrame(() => {
      if (showSettings) return;
      const popup = popupRef.current;
      if (!popup || !mainPopupActive) return;

      const active = document.activeElement;
      const focusInPopup = active && popup.contains(active);
      const onText =
        active === textRef.current || active === textBodyRef.current;

      if (!speechMode && onText) {
        getFirstControlRef()?.focus({ preventScroll: true });
        return;
      }

      if (!focusInPopup) {
        if (speechMode) {
          if (autoplayingRef.current) {
            getTextPanelFocusEl()?.focus({ preventScroll: true });
          } else {
            prevArrowRef.current?.focus({ preventScroll: true });
          }
        } else {
          getFirstControlRef()?.focus({ preventScroll: true });
        }
      }
    });
  }, [speechMode, mainPopupActive, getFirstControlRef, showSettings, getTextPanelFocusEl]);

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

  const handleNextImage = useCallback(() => {
    if (images.length <= 1) return;
    flashSelected(nextImageRef);

    const next = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(next);

    // Combined mode describes every image in one body of text, so there is no
    // per-image section to jump to.
    const block = isCombined
      ? null
      : textBlocks.find((b) => b.kind === "guided" && b.imageIndex === next);
    if (block) {
      setActiveBlockKey(block.key);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollBlockToTop(block.key));
      });
    }

    const position = `Image ${next + 1} of ${images.length}.`;
    announce(block ? `${position} ${getBlockSpeech(block, false)}` : position, {
      dedupeMs: 200,
    });
  }, [
    images,
    currentImageIndex,
    announce,
    flashSelected,
    isCombined,
    textBlocks,
    scrollBlockToTop,
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

  const handlePrimaryAction = isVideo ? handleVideoToggle : openZoom;

  const bumpArrow = useCallback((ref) => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("artifact-popup-nav-arrow--bump");
    requestAnimationFrame(() => {
      el.classList.add("artifact-popup-nav-arrow--bump");
      el.addEventListener(
        "animationend",
        () => el.classList.remove("artifact-popup-nav-arrow--bump"),
        { once: true }
      );
    });
  }, []);

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

      const focusables = getPopupFocusables();

      if (isSelect) {
        e.preventDefault();
        e.stopPropagation();
        const active = document.activeElement;
        if (active === prevArrowRef.current) handlePrevArrow();
        else if (active === nextArrowRef.current) handleNextArrow();
        else if (active === nextImageRef.current) handleNextImage();
        else if (active === transcriptBtnRef.current) openTranscript();
        else if (active === zoomOrPlayRef.current) handlePrimaryAction();
        return;
      }

      const active = document.activeElement;

      e.preventDefault();
      e.stopPropagation();

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
          bumpArrow(nextArrowRef);
          const label = nextArrowRef.current?.getAttribute("aria-label");
          if (label) announce(label, { politeness: "assertive" });
        }
      } else if (isBack) {
        if (idx > 0) {
          focusables[idx - 1].focus();
        } else if (idx === 0) {
          bumpArrow(prevArrowRef);
          const label = prevArrowRef.current?.getAttribute("aria-label");
          if (label) announce(label, { politeness: "assertive" });
        }
      }
    },
    [
      showSettings,
      transcriptOpen,
      getPopupFocusables,
      bumpArrow,
      announce,
      handlePrevArrow,
      handleNextArrow,
      handleNextImage,
      openTranscript,
      handlePrimaryAction,
      setVisualSection,
      clearTranscriptDwell,
    ]
  );

  const handleTextKeyDown = useCallback((e) => {
    stepScrollKeyDown(e, textBodyRef);
  }, []);

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

  const hasTranscript =
    typeof artifact.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
  const transcriptText = hasTranscript ? textOrMissing(artifact.transcriptText) : null;
  const highlightTextPanel =
    visualActiveSection === "title" ||
    visualActiveSection === "description" ||
    visualActiveSection === "guided";
  const videoAlt = isVideo ? getVideoAlt(artifact) : "";
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
                aria-label={videoAlt || "Artifact video"}
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
            {isVideo && (
              <button
                type="button"
                ref={zoomOrPlayRef}
                className={`carousel-btn${autoplayBtnClass("play")}`}
                onClick={handlePrimaryAction}
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                data-autofocus={!speechMode ? true : undefined}
              >
                {isVideoPlaying ? "Pause" : "Play Video"}
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
                data-autofocus={!speechMode && !isVideo ? true : undefined}
              >
                Transcript
              </button>
            )}
            {!isVideo && (
              <>
                {hasMultipleImages && (
                  <button
                    type="button"
                    ref={nextImageRef}
                    className={`carousel-btn${autoplayBtnClass("nextImage")}`}
                    onClick={handleNextImage}
                    aria-label="Next image"
                    data-autofocus={
                      !speechMode && !hasTranscript ? true : undefined
                    }
                  >
                    Next Image
                  </button>
                )}
                <button
                  type="button"
                  ref={zoomOrPlayRef}
                  className={`carousel-btn artifact-popup-zoom-btn${
                    zoomOpen ? " is-selected" : ""
                  }`}
                  onClick={handlePrimaryAction}
                  aria-label="Zoom"
                  data-autofocus={
                    !speechMode && !hasTranscript && !hasMultipleImages
                      ? true
                      : undefined
                  }
                >
                  <img src="Zoom.svg" alt="" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="artifact-popup-text-wrap">
            <div
              className={`artifact-popup-text${
                highlightTextPanel ? " artifact-popup-text--autoplay-active" : ""
              }`}
              ref={textRef}
              tabIndex={!speechMode && isTextScrollable ? 0 : -1}
              onKeyDown={!speechMode ? handleTextKeyDown : undefined}
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
                  tabIndex={speechMode ? 0 : -1}
                  role={speechMode ? "document" : undefined}
                  onKeyDown={speechMode ? handleTextKeyDown : undefined}
                >
                  {textBlocks.map((block) =>
                    block.kind === "guided" ? (
                      <section
                        key={block.key}
                        data-block-key={block.key}
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
