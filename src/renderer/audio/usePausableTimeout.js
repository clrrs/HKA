import { useEffect, useRef } from "react";

/**
 * Schedules a timeout that freezes remaining delay when isPaused is true.
 */
export function usePausableTimeout(isPaused) {
  const timeoutRef = useRef(null);
  const deadlineRef = useRef(null);
  const callbackRef = useRef(null);
  const frozenRemainingRef = useRef(null);

  const clear = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    deadlineRef.current = null;
    callbackRef.current = null;
    frozenRemainingRef.current = null;
  };

  const schedule = (fn, delayMs) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    frozenRemainingRef.current = null;
    if (delayMs <= 0) {
      deadlineRef.current = null;
      callbackRef.current = null;
      fn();
      return;
    }
    callbackRef.current = fn;
    deadlineRef.current = Date.now() + delayMs;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      deadlineRef.current = null;
      callbackRef.current = null;
      frozenRemainingRef.current = null;
      fn();
    }, delayMs);
  };

  useEffect(() => {
    if (isPaused) {
      if (timeoutRef.current !== null && deadlineRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        frozenRemainingRef.current = Math.max(0, deadlineRef.current - Date.now());
      }
      return;
    }

    if (
      timeoutRef.current === null &&
      frozenRemainingRef.current !== null &&
      callbackRef.current
    ) {
      const delayMs = frozenRemainingRef.current;
      const fn = callbackRef.current;
      frozenRemainingRef.current = null;
      deadlineRef.current = Date.now() + delayMs;
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        deadlineRef.current = null;
        callbackRef.current = null;
        fn();
      }, delayMs);
    }
  }, [isPaused]);

  useEffect(() => () => clear(), []);

  return { schedule, clear };
}
