import React, { useState, useRef, useCallback, useEffect } from "react";

export default function ZoomControls({ image, onExit }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const announcerRef = useRef(null);
  const holdTimerRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const announce = useCallback((message) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
      setTimeout(() => {
        announcerRef.current.textContent = message;
      }, 50);
    }
  }, []);

  // Calculate max pan based on zoom level
  const getMaxPan = useCallback(() => {
    if (scale <= 1) return { x: 0, y: 0 };
    const maxPan = Math.min((scale - 1) * 100, 150);
    return { x: maxPan, y: maxPan };
  }, [scale]);

  const zoomIn = useCallback(() => {
    if (scale >= 4) {
      announce("Maximum zoom.");
      return;
    }
    const newScale = Math.min(scale + 0.25, 4);
    setScale(newScale);
    announce(`Zoomed in. ${Math.round((newScale - 1) * 100)} percent.`);
  }, [scale, announce]);

  const zoomOut = useCallback(() => {
    if (scale <= 0.25) {
      announce("Minimum zoom.");
      return;
    }
    const newScale = Math.max(scale - 0.25, 0.25);
    setScale(newScale);
    
    // Constrain pan when zooming out
    const maxPan = { x: Math.min((newScale - 1) * 100, 150), y: Math.min((newScale - 1) * 100, 150) };
    setPosition(prev => ({
      x: Math.max(-maxPan.x, Math.min(maxPan.x, prev.x)),
      y: Math.max(-maxPan.y, Math.min(maxPan.y, prev.y))
    }));
    
    announce(`Zoomed out. ${Math.round((newScale - 1) * 100)} percent.`);
  }, [scale, announce]);

  const pan = useCallback((direction) => {
    const maxPan = getMaxPan();
    const increment = 10;
    
    setPosition(prev => {
      let { x, y } = prev;
      
      switch (direction) {
        case "up":
          if (y >= maxPan.y) {
            announce("Top limit reached.");
            return prev;
          }
          y = Math.min(y + increment, maxPan.y);
          announce("Panned up.");
          break;
        case "down":
          if (y <= -maxPan.y) {
            announce("Bottom limit reached.");
            return prev;
          }
          y = Math.max(y - increment, -maxPan.y);
          announce("Panned down.");
          break;
        case "left":
          if (x >= maxPan.x) {
            announce("Left limit reached.");
            return prev;
          }
          x = Math.min(x + increment, maxPan.x);
          announce("Panned left.");
          break;
        case "right":
          if (x <= -maxPan.x) {
            announce("Right limit reached.");
            return prev;
          }
          x = Math.max(x - increment, -maxPan.x);
          announce("Panned right.");
          break;
      }
      
      return { x, y };
    });
  }, [getMaxPan, announce]);

  const reset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    announce("Reset. Fit to screen.");
  }, [announce]);

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
            onClick={zoomIn}
            onMouseDown={() => startHoldToRepeat(zoomIn)}
            onMouseUp={stopHoldToRepeat}
            onMouseLeave={stopHoldToRepeat}
            disabled={!canZoomIn}
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
            disabled={!canZoomOut}
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
            disabled={!canPanLeft}
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
              disabled={!canPanUp}
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
              disabled={!canPanDown}
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
            disabled={!canPanRight}
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
      
      {/* Screen reader announcer */}
      <div 
        ref={announcerRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
    </div>
  );
}

