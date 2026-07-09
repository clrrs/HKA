import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "../state/StateProvider";
import { useAnnounce } from "../state/AnnouncerProvider";
import { getArtifact, getNextArtifact, getPrevArtifact } from "../data/artifacts";
import { textOrMissing } from "../data/contentPlaceholder";
import ArtifactVideoOverlay from "./ArtifactVideoOverlay";

const SCROLL_STEP_RATIO = 0.75;
const WORDS_PER_SEC = 2.4;
const CHUNK_BUFFER_MS = 4000;
const AUTO_READ_COMPLETE_INSTRUCTION =
  "Use the artifact control menu to continue exploring this artifact, or navigate to the next artifact button to go to the next artifact.";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateChunkDurationMs(text) {
  const words = countWords(text);
  return Math.round((words / WORDS_PER_SEC) * 1000) + CHUNK_BUFFER_MS;
}

function buildAutoplayChunks(artifact, images, isVideo) {
  if (!artifact) return [];

  const chunks = [
    { text: artifact.title, imageIndex: 0 },
    { text: artifact.description, imageIndex: 0 },
  ];

  if (isVideo || images.length === 0) {
    const guided = artifact.guidedDescription?.trim();
    if (guided) {
      chunks.push({
        text: `Image 1 of 1: Guided Description. ${guided}`,
        imageIndex: 0,
      });
    }
    return chunks;
  }

  const firstGuided = artifact.guidedDescription?.trim();
  if (firstGuided) {
    const count = images.length;
    chunks.push({
      text: `Image 1 of ${count}: Guided Description. ${firstGuided}`,
      imageIndex: 0,
    });
  } else if (images[0]?.alt) {
    chunks.push({ text: images[0].alt, imageIndex: 0 });
  }

  for (let i = 1; i < images.length; i++) {
    const alt = images[i]?.alt || "";
    chunks.push({
      text: `Image ${i + 1} of ${images.length}. ${alt}`,
      imageIndex: i,
    });
  }

  return chunks;
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
  const { speechMode, isPaused, setVideoOverlayOpen } = useAppState();
  const globalAnnounce = useAnnounce();
  const announce = useCallback(
    (message, options = {}) => globalAnnounce(message, { source: "ArtifactPopup", ...options }),
    [globalAnnounce]
  );

  const artifact = getArtifact(theme.id, artifactId);
  const prevArtifact = getPrevArtifact(theme.id, artifactId);
  const nextArtifact = getNextArtifact(theme.id, artifactId);

  const isVideo = artifact?.type === "video";
  const images = !isVideo ? artifact?.images || [] : [];
  const hasMultipleImages = images.length > 1;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);

  const popupRef = useRef(null);
  const autoplayAnchorRef = useRef(null);
  const autoplayingRef = useRef(false);
  const autoplayTimeoutRef = useRef(null);
  const autoplayDeadlineRef = useRef(null);
  const autoplayRemainingRef = useRef(null);
  const autoplayPlayNextRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  const autoplayDoneRef = useRef(false);
  const lastMainFocusRef = useRef(null);
  const skipNextTrapAutofocusRef = useRef(false);
  const popupInitialFocusDoneRef = useRef(false);
  const prevSpeechModeRef = useRef(speechMode);
  isPausedRef.current = isPaused;
  const prevArrowRef = useRef(null);
  const textRef = useRef(null);
  const nextImageRef = useRef(null);
  const transcriptBtnRef = useRef(null);
  const guidedBtnRef = useRef(null);
  const zoomOrPlayRef = useRef(null);
  const nextArrowRef = useRef(null);
  const zoomRef = useRef(null);
  const transcriptPanelRef = useRef(null);
  const transcriptExitRef = useRef(null);
  const transcriptBodyRef = useRef(null);
  const guidedPanelRef = useRef(null);
  const guidedExitRef = useRef(null);
  const guidedBodyRef = useRef(null);

  const [snapIndex, setSnapIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(2);
  const [snapPaneHeight, setSnapPaneHeight] = useState(0);
  const snapWindowRef = useRef(null);
  const snapImageRef = useRef(null);
  const snapUpRef = useRef(null);
  const snapDownRef = useRef(null);

  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  const mainPopupActive =
    !zoomOpen && !videoPlayerOpen && !transcriptOpen && !guidedOpen;
  useFocusTrap(popupRef, mainPopupActive, {
    skipAutofocusRef: skipNextTrapAutofocusRef,
    initialFocusDoneRef: popupInitialFocusDoneRef,
    autofocusOnActivate: !speechMode,
  });
  useFocusTrap(zoomRef, zoomOpen);
  useFocusTrap(transcriptPanelRef, transcriptOpen);
  useFocusTrap(guidedPanelRef, guidedOpen);

  const cancelAutoplay = useCallback(() => {
    autoplayingRef.current = false;
    autoplayRemainingRef.current = null;
    autoplayPlayNextRef.current = null;
    autoplayDeadlineRef.current = null;
    if (autoplayTimeoutRef.current !== null) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const markAutoplayEnded = useCallback(() => {
    cancelAutoplay();
    autoplayDoneRef.current = true;
    setIsAutoplaying(false);
  }, [cancelAutoplay]);

  const rememberMainFocus = useCallback(() => {
    const el = document.activeElement;
    if (
      el &&
      popupRef.current?.contains(el) &&
      el !== autoplayAnchorRef.current
    ) {
      lastMainFocusRef.current = el;
    }
  }, []);

  const restoreMainFocus = useCallback((fallbackRef) => {
    skipNextTrapAutofocusRef.current = true;
    requestAnimationFrame(() => {
      const target = lastMainFocusRef.current;
      if (
        target &&
        popupRef.current?.contains(target) &&
        target !== autoplayAnchorRef.current
      ) {
        target.focus({ preventScroll: true });
      } else {
        fallbackRef?.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  const getPopupFocusables = useCallback(() => {
    const hasTranscriptLocal =
      typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
    const hasGuidedLocal =
      typeof artifact?.guidedDescription === "string" &&
      artifact.guidedDescription.trim().length > 0;
    return [
      prevArrowRef.current,
      speechMode ? textRef.current : null,
      hasMultipleImages ? nextImageRef.current : null,
      hasTranscriptLocal ? transcriptBtnRef.current : null,
      hasGuidedLocal ? guidedBtnRef.current : null,
      zoomOrPlayRef.current,
      nextArrowRef.current,
    ].filter(Boolean);
  }, [speechMode, hasMultipleImages, artifact]);

  const getFirstControlRef = useCallback(() => {
    if (hasMultipleImages && nextImageRef.current) return nextImageRef.current;
    const hasTranscriptLocal =
      typeof artifact?.transcriptText === "string" && artifact.transcriptText.trim().length > 0;
    if (hasTranscriptLocal && transcriptBtnRef.current) return transcriptBtnRef.current;
    const hasGuidedLocal =
      typeof artifact?.guidedDescription === "string" &&
      artifact.guidedDescription.trim().length > 0;
    if (hasGuidedLocal && guidedBtnRef.current) return guidedBtnRef.current;
    return zoomOrPlayRef.current;
  }, [hasMultipleImages, artifact]);

  useEffect(() => {
    if (artifact && !speechMode) {
      announce(`${artifact.title} opened.`, { politeness: "assertive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!speechMode || !artifact) return;
    if (isPausedRef.current) return;
    if (zoomOpen || videoPlayerOpen || transcriptOpen || guidedOpen) {
      cancelAutoplay();
      setIsAutoplaying(false);
      autoplayDoneRef.current = true;
      return;
    }
    if (autoplayDoneRef.current) return;

    const chunks = buildAutoplayChunks(artifact, images, isVideo);
    if (chunks.length === 0) return;

    let chunkIndex = 0;
    autoplayingRef.current = true;
    setIsAutoplaying(true);
    autoplayAnchorRef.current?.focus({ preventScroll: true });

    const playNext = () => {
      if (!autoplayingRef.current || isPausedRef.current) return;
      if (chunkIndex >= chunks.length) {
        autoplayDoneRef.current = true;
        autoplayingRef.current = false;
        autoplayTimeoutRef.current = null;
        autoplayDeadlineRef.current = null;
        autoplayPlayNextRef.current = null;
        autoplayRemainingRef.current = null;
        setIsAutoplaying(false);
        announce(AUTO_READ_COMPLETE_INSTRUCTION, { politeness: "assertive" });
        return;
      }

      const chunk = chunks[chunkIndex];
      setCurrentImageIndex(chunk.imageIndex);
      announce(chunk.text, { politeness: "assertive" });
      chunkIndex += 1;

      const delay = estimateChunkDurationMs(chunk.text);
      autoplayPlayNextRef.current = playNext;
      autoplayDeadlineRef.current = Date.now() + delay;
      autoplayTimeoutRef.current = setTimeout(playNext, delay);
    };

    autoplayPlayNextRef.current = playNext;
    autoplayDeadlineRef.current = Date.now() + 100;
    autoplayTimeoutRef.current = setTimeout(playNext, 100);

    return () => cancelAutoplay();
  }, [
    speechMode,
    artifact,
    artifactId,
    isVideo,
    images,
    zoomOpen,
    videoPlayerOpen,
    transcriptOpen,
    guidedOpen,
    announce,
    cancelAutoplay,
  ]);

  useEffect(() => {
    if (!autoplayingRef.current) return;

    if (isPaused) {
      if (autoplayTimeoutRef.current !== null && autoplayDeadlineRef.current !== null) {
        autoplayRemainingRef.current = Math.max(
          0,
          autoplayDeadlineRef.current - Date.now()
        );
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
      return;
    }

    if (
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
  }, [isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!autoplayingRef.current || e.repeat) return;
      const key = e.key.toLowerCase();
      const isNext = key === "l" || key === "arrowright";
      const isBack = key === "k" || key === "arrowleft";
      if (!isNext && !isBack) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      markAutoplayEnded();

      if (isNext) {
        getFirstControlRef()?.focus({ preventScroll: true });
      } else {
        prevArrowRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [markAutoplayEnded, getFirstControlRef]);

  useEffect(() => {
    if (!isAutoplaying || !speechMode || !mainPopupActive) return;

    requestAnimationFrame(() => {
      if (!autoplayingRef.current) return;
      const active = document.activeElement;
      if (active === autoplayAnchorRef.current) return;
      autoplayAnchorRef.current?.focus({ preventScroll: true });
    });
  }, [isAutoplaying, speechMode, mainPopupActive]);

  useEffect(() => {
    const prev = prevSpeechModeRef.current;
    if (prev === speechMode) return;
    prevSpeechModeRef.current = speechMode;

    if (!popupRef.current) return;

    requestAnimationFrame(() => {
      const popup = popupRef.current;
      if (!popup || !mainPopupActive) return;

      const active = document.activeElement;
      const focusInPopup = active && popup.contains(active);
      const onText = active === textRef.current;

      if (!speechMode && onText) {
        getFirstControlRef()?.focus({ preventScroll: true });
        return;
      }

      if (!focusInPopup) {
        if (speechMode) {
          if (autoplayingRef.current) {
            autoplayAnchorRef.current?.focus({ preventScroll: true });
          } else {
            prevArrowRef.current?.focus({ preventScroll: true });
          }
        } else {
          getFirstControlRef()?.focus({ preventScroll: true });
        }
      }
    });
  }, [speechMode, mainPopupActive, getFirstControlRef]);

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
    if (prevArtifact) {
      goToArtifact(prevArtifact.id);
    } else {
      goToArtifact(null, { focusThemeStart: true });
    }
  }, [goToArtifact, prevArtifact]);

  const handleNextArrow = useCallback(() => {
    goToArtifact(nextArtifact?.id);
  }, [goToArtifact, nextArtifact]);

  const handleNextImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => {
      const next = (prev + 1) % images.length;
      const alt = images[next]?.alt || "";
      announce(`Image ${next + 1} of ${images.length}. ${alt}`, { dedupeMs: 200 });
      return next;
    });
  }, [images, announce]);

  const closeTranscript = useCallback(() => {
    setTranscriptOpen(false);
    announce("Transcript closed.");
    restoreMainFocus(transcriptBtnRef);
  }, [announce, restoreMainFocus]);

  const openGuided = useCallback(() => {
    rememberMainFocus();
    markAutoplayEnded();
    setGuidedOpen(true);
    announce("Guided description opened.", { politeness: "assertive" });
  }, [announce, markAutoplayEnded, rememberMainFocus]);

  const closeGuided = useCallback(() => {
    setGuidedOpen(false);
    announce("Guided description closed.");
    restoreMainFocus(guidedBtnRef);
  }, [announce, restoreMainFocus]);

  const openTranscript = useCallback(() => {
    rememberMainFocus();
    markAutoplayEnded();
    setTranscriptOpen(true);
    announce("Transcript opened.", { politeness: "assertive" });
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

  const openVideoPlayer = useCallback(() => {
    rememberMainFocus();
    markAutoplayEnded();
    setVideoPlayerOpen(true);
    setVideoOverlayOpen(true);
  }, [setVideoOverlayOpen, markAutoplayEnded, rememberMainFocus]);

  const closeVideoPlayer = useCallback(() => {
    setVideoPlayerOpen(false);
    setVideoOverlayOpen(false);
    restoreMainFocus(zoomOrPlayRef);
  }, [setVideoOverlayOpen, restoreMainFocus]);

  const handlePrimaryAction = isVideo ? openVideoPlayer : openZoom;

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
      if (transcriptOpen || guidedOpen) return;

      const isNext = (e.key === "Tab" && !e.shiftKey) || e.key === "l";
      const isBack = (e.key === "Tab" && e.shiftKey) || e.key === "k";
      const isSelect = e.key === "Enter" || e.key === "j";
      if (!isNext && !isBack && !isSelect) return;

      const focusables = getPopupFocusables();

      if (isSelect) {
        e.preventDefault();
        e.stopPropagation();
        const active = document.activeElement;
        if (active === prevArrowRef.current) handlePrevArrow();
        else if (active === nextArrowRef.current) handleNextArrow();
        else if (active === nextImageRef.current) handleNextImage();
        else if (active === transcriptBtnRef.current) openTranscript();
        else if (active === guidedBtnRef.current) openGuided();
        else if (active === zoomOrPlayRef.current) handlePrimaryAction();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const active = document.activeElement;

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
      transcriptOpen,
      guidedOpen,
      getPopupFocusables,
      bumpArrow,
      announce,
      handlePrevArrow,
      handleNextArrow,
      handleNextImage,
      openTranscript,
      openGuided,
      handlePrimaryAction,
    ]
  );

  const handleTextKeyDown = useCallback((e) => {
    stepScrollKeyDown(e, textRef);
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

  const handleGuidedKeyDown = useCallback((e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (key !== "l" && key !== "k") return;

    const body = guidedBodyRef.current;
    const exitBtn = guidedExitRef.current;
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

    stepScrollKeyDown(e, guidedBodyRef);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.repeat || e.key !== "Escape") return;
      if (zoomOpen) {
        e.preventDefault();
        exitZoom();
      } else if (transcriptOpen) {
        e.preventDefault();
        closeTranscript();
      } else if (guidedOpen) {
        e.preventDefault();
        closeGuided();
      } else if (!videoPlayerOpen) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [zoomOpen, transcriptOpen, guidedOpen, videoPlayerOpen, exitZoom, closeTranscript, closeGuided, onClose]);

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
  const hasGuided =
    typeof artifact.guidedDescription === "string" && artifact.guidedDescription.trim().length > 0;
  const transcriptText = hasTranscript ? textOrMissing(artifact.transcriptText) : null;
  const guidedText = hasGuided ? artifact.guidedDescription.trim() : null;
  const guidedImageTotal = images.length > 0 ? images.length : 1;
  const guidedImageIndex = Math.min(guidedImageTotal, Math.max(1, currentImageIndex + 1));
  const guidedImageSubtitle = `Image ${guidedImageIndex} of ${guidedImageTotal}`;
  const speechLabel = `${artifact.title}. ${artifact.description}`;
  const videoAlt = isVideo ? getVideoAlt(artifact) : "";

  return (
    <div className="artifact-popup-scrim">
      <div
        className="artifact-popup"
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${artifact.title}, artifact details`}
        onKeyDown={handlePopupKeyDown}
      >
        <div
          ref={autoplayAnchorRef}
          tabIndex={-1}
          className="sr-only"
          data-autofocus={speechMode && mainPopupActive && isAutoplaying ? "" : undefined}
          aria-hidden="true"
        />

        <button
          type="button"
          ref={prevArrowRef}
          className="artifact-popup-nav-arrow artifact-popup-nav-arrow--prev"
          onClick={handlePrevArrow}
          aria-label={
            prevArtifact
              ? `Previous artifact: ${prevArtifact.displayTitle}`
              : "Close artifact, return to theme"
          }
        />

        <div className="artifact-popup-card">
          <div className="artifact-popup-media">
            {isVideo ? (
              artifact.posterSrc && (
                <img src={artifact.posterSrc} alt="" aria-hidden="true" />
              )
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
            {hasMultipleImages && (
              <button
                type="button"
                ref={nextImageRef}
                className="carousel-btn"
                onClick={handleNextImage}
                aria-label="Next image"
                data-autofocus={!speechMode ? true : undefined}
              >
                Next Image
              </button>
            )}
            {hasTranscript && (
              <button
                type="button"
                ref={transcriptBtnRef}
                className="carousel-btn"
                onClick={openTranscript}
                aria-label="Transcript"
                data-autofocus={!speechMode && !hasMultipleImages ? true : undefined}
              >
                Transcript
              </button>
            )}
            {hasGuided && (
              <button
                type="button"
                ref={guidedBtnRef}
                className="carousel-btn"
                onClick={openGuided}
                aria-label="Guided description"
                data-autofocus={
                  !speechMode && !hasMultipleImages && !hasTranscript ? true : undefined
                }
              >
                Guided Description
              </button>
            )}
            <button
              type="button"
              ref={zoomOrPlayRef}
              className={
                isVideo ? "carousel-btn" : "carousel-btn artifact-popup-zoom-btn"
              }
              onClick={handlePrimaryAction}
              aria-label={isVideo ? "Play video" : "Zoom"}
              data-autofocus={
                !speechMode && !hasMultipleImages && !hasTranscript && !hasGuided
                  ? true
                  : undefined
              }
            >
              {isVideo ? "Play" : <img src="Zoom.svg" alt="" aria-hidden="true" />}
            </button>
          </div>

          <div
            className="artifact-popup-text"
            ref={textRef}
            tabIndex={speechMode ? 0 : -1}
            onKeyDown={handleTextKeyDown}
            aria-label={speechMode ? speechLabel : undefined}
          >
            <h2 className="artifact-popup-title" aria-hidden={speechMode ? true : undefined}>
              {artifact.title}
            </h2>
            <p className="artifact-popup-description" aria-hidden={speechMode ? true : undefined}>
              {artifact.description}
            </p>
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

          {guidedOpen && guidedText && (
            <div
              className="artifact-popup-transcript"
              ref={guidedPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Guided description"
            >
              <button
                type="button"
                ref={guidedExitRef}
                className="exit-pill-btn artifact-popup-transcript-exit"
                onClick={closeGuided}
                aria-label="Close guided description"
              >
                Exit
              </button>
              <h2 className="artifact-popup-transcript-heading">Guided Description</h2>
              <p className="artifact-popup-transcript-subtitle">{guidedImageSubtitle}</p>
              <div
                className="artifact-popup-transcript-body"
                ref={guidedBodyRef}
                tabIndex={0}
                onKeyDown={handleGuidedKeyDown}
                data-autofocus=""
              >
                {guidedText.split("\n").map((line, i) => (
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
              ? `Next artifact: ${nextArtifact.displayTitle}`
              : "Close artifact, return to theme"
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

      {videoPlayerOpen && isVideo && (
        <ArtifactVideoOverlay
          src={artifact.videoSrc}
          poster={artifact.posterSrc}
          transcript={artifact.transcriptText}
          guidedDescription={artifact.guidedDescription}
          videoAlt={videoAlt}
          onClose={closeVideoPlayer}
        />
      )}
    </div>
  );
}
