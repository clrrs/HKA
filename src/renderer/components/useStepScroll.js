import { useEffect, useRef, useState } from "react";

/**
 * K/L key step-scrolling for transcript / guided description dialogs.
 *
 * Behaviour (matches kiosk keypad spec):
 * - L from text: step-scrolls down through anchors; at the bottom, moves focus to the Exit button.
 * - L from Exit: moves focus back to the text at the TOP (scrollTop = 0).
 * - K from text: step-scrolls up through anchors; at the top, moves focus to the Exit button.
 * - K from Exit: moves focus back to the text without changing scroll position.
 *
 * Returns:
 * - bodyRef: attach to the scrollable element
 * - closeButtonRef: attach to the Exit button
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

    const closeEl = closeButtonRef.current;

    if (key === "l") {
      // From Exit: jump back to top of text.
      if (document.activeElement === closeEl) {
        body.focus();
        body.scrollTo({ top: 0, behavior: "smooth" });
        setScrollIndex(0);
        return;
      }

      // From text: step down; at bottom, move focus to Exit.
      if (scrollIndex < activeAnchors.length - 1) {
        const nextIndex = scrollIndex + 1;
        setScrollIndex(nextIndex);
        body.scrollTo({ top: activeAnchors[nextIndex], behavior: "smooth" });
      } else if (closeEl) {
        closeEl.focus();
      }
    } else if (key === "k") {
      // From Exit: move back to text, keep current scroll position.
      if (document.activeElement === closeEl) {
        body.focus();
        return;
      }

      // From text: step up; at top, move focus to Exit.
      if (scrollIndex > 0) {
        const nextIndex = scrollIndex - 1;
        setScrollIndex(nextIndex);
        body.scrollTo({ top: activeAnchors[nextIndex], behavior: "smooth" });
      } else if (closeEl) {
        closeEl.focus();
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

