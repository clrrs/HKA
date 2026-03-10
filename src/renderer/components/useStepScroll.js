import { useEffect, useRef, useState } from "react";

/**
 * K/L key step-scrolling for a scrollable container, modeled on DocumentViewer.
 *
 * - Computes scroll anchors based on container height (75% steps).
 * - L moves forward through anchors; at last anchor, moves focus to close button (if provided).
 * - K moves backward; from close button, jumps back into body at bottom.
 *
 * Returns:
 * - bodyRef: attach to the scrollable element
 * - handleKeyDown: attach to the dialog or scrollable element
 * - resetAnchors: call when (re)opening the overlay
 */
export function useStepScroll() {
  const bodyRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [anchors, setAnchors] = useState([0]);
  const [scrollIndex, setScrollIndex] = useState(0);

  const computeAnchors = (body) => {
    const step = Math.floor(body.clientHeight * 0.75) || body.clientHeight;
    const max = body.scrollHeight - body.clientHeight;
    const nextAnchors = [0];
    let pos = step;
    while (pos < max) {
      nextAnchors.push(pos);
      pos += step;
    }
    if (!nextAnchors.includes(max) && max > 0) {
      nextAnchors.push(max);
    }
    return nextAnchors;
  };

  const resetAnchors = () => {
    const body = bodyRef.current;
    if (!body) return;

    const nextAnchors = computeAnchors(body);
    setAnchors(nextAnchors);
    setScrollIndex(0);
    body.scrollTop = 0;
    body.focus();
  };

  const handleKeyDown = (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key !== "k" && key !== "l") return;

    const body = bodyRef.current;
    if (!body) return;

    // If anchors haven't been properly initialized yet but content is scrollable,
    // compute them on first use so the very first L press scrolls.
    let activeAnchors = anchors;
    if (activeAnchors.length <= 1 && body.scrollHeight > body.clientHeight) {
      activeAnchors = computeAnchors(body);
      setAnchors(activeAnchors);
      setScrollIndex(0);
      body.scrollTop = 0;
    }

    if (activeAnchors.length === 0) return;

    event.preventDefault();
    event.stopPropagation();

    if (key === "l") {
      if (scrollIndex < activeAnchors.length - 1) {
        const nextIndex = scrollIndex + 1;
        setScrollIndex(nextIndex);
        body.scrollTo({ top: activeAnchors[nextIndex], behavior: "smooth" });
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    } else if (key === "k") {
      if (document.activeElement === closeButtonRef.current) {
        body.focus();
        const lastIndex = activeAnchors.length - 1;
        body.scrollTo({ top: activeAnchors[lastIndex] || 0, behavior: "smooth" });
        setScrollIndex(lastIndex);
        return;
      }
      if (scrollIndex > 0) {
        const nextIndex = scrollIndex - 1;
        setScrollIndex(nextIndex);
        body.scrollTo({ top: activeAnchors[nextIndex], behavior: "smooth" });
      }
    }
  };

  // Reset when content size changes significantly (optional: keep simple for now)
  useEffect(() => {
    // No-op; caller controls when to recompute via resetAnchors
  }, []);

  return {
    bodyRef,
    closeButtonRef,
    handleKeyDown,
    resetAnchors,
  };
}

