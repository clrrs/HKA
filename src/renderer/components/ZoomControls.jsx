import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAnnounce } from "../state/AnnouncerProvider";
import { useAppState } from "../state/StateProvider";
import { getElementSummary, logInputEvent } from "../state/interactionLog";

export default function ZoomControls({ image, onExit }) {
  const { scene, subscene } = useAppState();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const holdTimerRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const globalAnnounce = useAnnounce();

  const announce = useCallback((message, options = {}) => {
    globalAnnounce(message, { source: "ZoomControls", ...options });
  }, [globalAnnounce]);

  // Calculate max pan based on zoom level
  const getMaxPan = useCallback(() => {
    if (scale <= 1) return { x: 0, y: 0 };
    const maxPan = Math.min((scale - 1) * 100, 150);
    return { x: maxPan, y: maxPan };
  }, [scale]);

  const zoomIn = useCallback(() => {
    if (scene === "artifact") {
      logInputEvent({
        source: "ZoomControls",
        scene,
        subscene,
        action: "zoom-in",
        target: getElementSummary(document.activeElement),
      });
    }
    if (scaleRef.current >= 4) {
      announce("Maximum zoom.", { dedupeMs: 300 });
      return;
    }
    const newScale = Math.min(scaleRef.current + 0.25, 4);
    scaleRef.current = newScale;
    setScale(newScale);
    announce(`Zoomed in. ${Math.round((newScale - 1) * 100)} percent.`, { dedupeMs: 150 });
  }, [announce, scene, subscene]);

  const zoomOut = useCallback(() => {
    if (scene === "artifact") {
      logInputEvent({
        source: "ZoomControls",
        scene,
        subscene,
        action: "zoom-out",
        target: getElementSummary(document.activeElement),
      });
    }
    if (scaleRef.current <= 0.25) {
      announce("Minimum zoom.", { dedupeMs: 300 });
      return;
    }
    const newScale = Math.max(scaleRef.current - 0.25, 0.25);
    scaleRef.current = newScale;
    setScale(newScale);

    if (newScale <= 1) {
      const resetPosition = { x: 0, y: 0 };
      positionRef.current = resetPosition;
      setPosition(resetPosition);
    } else {
      const maxPanVal = Math.min((newScale - 1) * 100, 150);
      const nextPosition = {
        x: Math.max(-maxPanVal, Math.min(maxPanVal, positionRef.current.x)),
        y: Math.max(-maxPanVal, Math.min(maxPanVal, positionRef.current.y)),
      };
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }

    announce(`Zoomed out. ${Math.round((newScale - 1) * 100)} percent.`, { dedupeMs: 150 });
  }, [announce, scene, subscene]);

  const pan = useCallback((direction) => {
    if (scene === "artifact") {
      logInputEvent({
        source: "ZoomControls",
        scene,
        subscene,
        action: `pan-${direction}`,
        target: getElementSummary(document.activeElement),
      });
    }
    const maxPan = getMaxPan();
    const increment = 10;

    let { x, y } = positionRef.current;

    switch (direction) {
      case "up":
        if (y >= maxPan.y) {
          announce("Top limit reached.", { dedupeMs: 300 });
          return;
        }
        y = Math.min(y + increment, maxPan.y);
        announce("Panned up.", { dedupeMs: 150 });
        break;
      case "down":
        if (y <= -maxPan.y) {
          announce("Bottom limit reached.", { dedupeMs: 300 });
          return;
        }
        y = Math.max(y - increment, -maxPan.y);
        announce("Panned down.", { dedupeMs: 150 });
        break;
      case "left":
        if (x >= maxPan.x) {
          announce("Left limit reached.", { dedupeMs: 300 });
          return;
        }
        x = Math.min(x + increment, maxPan.x);
        announce("Panned left.", { dedupeMs: 150 });
        break;
      case "right":
        if (x <= -maxPan.x) {
          announce("Right limit reached.", { dedupeMs: 300 });
          return;
        }
        x = Math.max(x - increment, -maxPan.x);
        announce("Panned right.", { dedupeMs: 150 });
        break;
      default:
        return;
    }

    const nextPosition = { x, y };
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }, [getMaxPan, announce, scene, subscene]);

  const reset = useCallback(() => {
    if (scene === "artifact") {
      logInputEvent({
        source: "ZoomControls",
        scene,
        subscene,
        action: "zoom-reset",
        target: getElementSummary(document.activeElement),
      });
    }
    scaleRef.current = 1;
    positionRef.current = { x: 0, y: 0 };
    setScale(1);
    setPosition({ x: 0, y: 0 });
    announce("Reset. Fit to screen.");
  }, [announce, scene, subscene]);

  // Hold-to-repeat functionality
  const startHoldToRepeat = useCallback((action) => {
    action();
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(action, 150);
    }, 400);
  }, []);

  const stopHoldToRepeat = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopHoldToRepeat();
  }, [stopHoldToRepeat]);

  const maxPan = getMaxPan();
  const canPanUp = position.y < maxPan.y;
  const canPanDown = position.y > -maxPan.y;
  const canPanLeft = position.x < maxPan.x;
  const canPanRight = position.x > -maxPan.x;
  const canZoomIn = scale < 4;
  const canZoomOut = scale > 0.25;

  return (
    <div className="zoom-container">
      <div className="zoom-viewport">
        <img 
          ref={imgRef}
          src={image.src}
          alt={image.alt}
          className="zoomable-image"
          style={{
            transform: `translate(${position.x}%, ${position.y}%) scale(${scale})`
          }}
        />
      </div>
      
      <div className="zoom-controls-menu" role="toolbar" aria-label="Zoom and pan controls">
        <button 
          type="button" 
          onClick={onExit}
          aria-label="Exit Zoom Mode"
          className="zoom-btn"
        >
          Exit
        </button>
        
        <div className="zoom-btn-group">
          <button 
            type="button" 
            data-autofocus
            onClick={zoomIn}
            onMouseDown={() => startHoldToRepeat(zoomIn)}
            onMouseUp={stopHoldToRepeat}
            onMouseLeave={stopHoldToRepeat}
            aria-disabled={!canZoomIn}
            aria-label="Zoom in"
            className="zoom-btn"
          >
            +
          </button>
          <button 
            type="button" 
            onClick={zoomOut}
            onMouseDown={() => startHoldToRepeat(zoomOut)}
            onMouseUp={stopHoldToRepeat}
            onMouseLeave={stopHoldToRepeat}
            aria-disabled={!canZoomOut}
            aria-label="Zoom out"
            className="zoom-btn"
          >
            −
          </button>
        </div>
        
        <div className="pan-btn-group">
          <button 
            type="button" 
            onClick={() => pan("left")}
            onMouseDown={() => startHoldToRepeat(() => pan("left"))}
            onMouseUp={stopHoldToRepeat}
            onMouseLeave={stopHoldToRepeat}
            aria-disabled={!canPanLeft}
            aria-label="Pan left"
            className="zoom-btn"
          >
            ◀
          </button>
          <div className="pan-vertical">
            <button 
              type="button" 
              onClick={() => pan("up")}
              onMouseDown={() => startHoldToRepeat(() => pan("up"))}
              onMouseUp={stopHoldToRepeat}
              onMouseLeave={stopHoldToRepeat}
              aria-disabled={!canPanUp}
              aria-label="Pan up"
              className="zoom-btn"
            >
              ▲
            </button>
            <button 
              type="button" 
              onClick={() => pan("down")}
              onMouseDown={() => startHoldToRepeat(() => pan("down"))}
              onMouseUp={stopHoldToRepeat}
              onMouseLeave={stopHoldToRepeat}
              aria-disabled={!canPanDown}
              aria-label="Pan down"
              className="zoom-btn"
            >
              ▼
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => pan("right")}
            onMouseDown={() => startHoldToRepeat(() => pan("right"))}
            onMouseUp={stopHoldToRepeat}
            onMouseLeave={stopHoldToRepeat}
            aria-disabled={!canPanRight}
            aria-label="Pan right"
            className="zoom-btn"
          >
            ▶
          </button>
        </div>
        
        <button 
          type="button" 
          onClick={reset}
          aria-label="Reset zoom"
          className="zoom-btn"
        >
          Reset
        </button>
      </div>
      
    </div>
  );
}

