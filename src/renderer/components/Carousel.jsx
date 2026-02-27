import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../state/StateProvider";
import ZoomControls from "./ZoomControls";

// Focus trap hook - keeps tab cycling within a container
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key !== 'Tab') return;
      
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

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first focusable element when trap activates
    const focusables = container.querySelectorAll(focusableSelector);
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive, containerRef]);
}

export default function Carousel({ images = [] }) {
  const { subscene, setSubscene } = useAppState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);
  const announcerRef = useRef(null);
  const expandedRef = useRef(null);
  const zoomRef = useRef(null);

  // Apply focus trap when in expanded or zoom mode
  useFocusTrap(expandedRef, subscene === "expanded");
  useFocusTrap(zoomRef, subscene === "zoom");

  const announce = useCallback((message) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
      setTimeout(() => {
        announcerRef.current.textContent = message;
      }, 50);
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    announce(`Image ${((currentIndex + 1) % images.length) + 1} of ${images.length}`);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    announce(`Image ${(currentIndex === 0 ? images.length : currentIndex)} of ${images.length}`);
  };

  const enterExpanded = () => {
    setSubscene("expanded");
    announce(`Expanded view. Image ${currentIndex + 1} of ${images.length}. ${images[currentIndex]?.alt}`);
  };

  const exitExpanded = () => {
    setSubscene(null);
    announce("Exited navigation mode.");
  };

  const enterZoom = () => {
    setSubscene("zoom");
    announce("Zoom mode. Use controls to zoom and pan.");
  };

  const exitZoom = () => {
    setSubscene("expanded");
    announce("Exited zoom mode.");
  };

  const handleKeyDown = (e) => {
    if (e.repeat) return;
    if (e.key === "Enter" && !subscene) {
      e.preventDefault();
      enterExpanded();
    }
  };

  // Escape key handler (dev convenience)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        if (subscene === "zoom") {
          exitZoom();
        } else if (subscene === "expanded") {
          exitExpanded();
        }
      }
    };
    
    if (subscene) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [subscene]);

  if (images.length === 0) {
    return <div className="carousel-empty">No images available</div>;
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      className={`carousel ${subscene ? `carousel-${subscene}` : ''}`}
      ref={carouselRef}
      data-layer={subscene || "surface"}
    >
      {/* Layer 1: Surface View (static) */}
      {!subscene && (
        <div 
          className={`carousel-layer carousel-surface ${isHovering ? 'carousel-hovering' : ''}`}
          tabIndex={0}
          role="button"
          aria-label={`Image carousel, ${images.length} images, press Enter to open`}
          onKeyDown={handleKeyDown}
          onClick={enterExpanded}
          onFocus={() => setIsHovering(true)}
          onBlur={() => setIsHovering(false)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="carousel-viewport">
            <img 
              src={currentImage.src} 
              alt={currentImage.alt}
            />
          </div>
          {images.length > 1 && (
            <div className="carousel-indicators" aria-hidden="true">
              {images.map((_, index) => (
                <span 
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
          {isHovering && (
            <div className="carousel-prompt" aria-hidden="true">
              <span>Open Image Carousel</span>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Expanded Navigation - Floating popup with backdrop */}
      {subscene === "expanded" && (
        <div className="carousel-layer carousel-expanded" ref={expandedRef}>
          <div className="carousel-expanded-content">
            <div className="carousel-image-display">
              <img 
                src={currentImage.src} 
                alt={currentImage.alt}
              />
            </div>
            {images.length > 1 && (
              <div className="carousel-indicators" aria-hidden="true">
                {images.map((_, index) => (
                  <span 
                    key={index}
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
            <div className="carousel-menu" role="toolbar" aria-label="Image navigation">
              <button 
                type="button" 
                onClick={exitExpanded}
                aria-label="Exit Image Carousel"
                className="carousel-btn carousel-btn-icon"
              >
                <img src="./Exit.svg" alt="" aria-hidden="true" />
              </button>
              {images.length > 1 && (
                <>
                  <button 
                    type="button" 
                    onClick={prevSlide}
                    aria-label="Previous"
                    className="carousel-btn carousel-btn-icon"
                  >
                    <img src="./Back.svg" alt="" aria-hidden="true" />
                  </button>
                  <button 
                    type="button" 
                    onClick={nextSlide}
                    aria-label={`Image ${currentIndex + 1} of ${images.length}. ${currentImage.alt}. Next`}
                    className="carousel-btn carousel-btn-icon"
                  >
                    <img src="./Forward.svg" alt="" aria-hidden="true" />
                  </button>
                </>
              )}
              <button 
                type="button" 
                onClick={enterZoom}
                aria-label="Zoom"
                className="carousel-btn carousel-btn-icon"
              >
                <img src="./Zoom.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer 3: Zoom Mode */}
      {subscene === "zoom" && (
        <div className="carousel-layer carousel-zoom" ref={zoomRef}>
          <ZoomControls 
            image={currentImage}
            onExit={exitZoom}
          />
        </div>
      )}

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
