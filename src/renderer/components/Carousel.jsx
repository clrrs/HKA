import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../state/StateProvider";
import ZoomControls from "./ZoomControls";

export default function Carousel({ images = [] }) {
  const { subscene, setSubscene } = useAppState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);
  const announcerRef = useRef(null);

  const announce = useCallback((message) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
      setTimeout(() => {
        announcerRef.current.textContent = message;
      }, 50);
    }
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying && images.length > 1 && !subscene) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, images.length, subscene]);

  // Stop auto-play when entering expanded/zoom modes
  useEffect(() => {
    if (subscene) {
      setIsAutoPlaying(false);
    }
  }, [subscene]);

  const stopAutoPlay = () => setIsAutoPlaying(false);
  const startAutoPlay = () => {
    if (!subscene) setIsAutoPlaying(true);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    announce(`Image ${((currentIndex + 1) % images.length) + 1} of ${images.length}`);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    announce(`Image ${(currentIndex === 0 ? images.length : currentIndex)} of ${images.length}`);
  };

  const enterExpanded = () => {
    stopAutoPlay();
    setSubscene("expanded");
    announce(`Expanded view. Image ${currentIndex + 1} of ${images.length}. ${images[currentIndex]?.alt}`);
  };

  const exitExpanded = () => {
    setSubscene(null);
    startAutoPlay();
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
    if (e.key === "Enter" && !subscene) {
      e.preventDefault();
      enterExpanded();
    }
  };

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
      {/* Layer 1: Surface View (auto-carousel) */}
      {!subscene && (
        <div 
          className="carousel-layer carousel-surface"
          tabIndex={0}
          role="img"
          aria-label={`Image carousel, ${images.length} images, press Enter to explore`}
          onKeyDown={handleKeyDown}
          onFocus={stopAutoPlay}
          onBlur={startAutoPlay}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
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
          <div className="carousel-prompt" aria-hidden="true">
            <span>Press Enter to Explore</span>
          </div>
        </div>
      )}

      {/* Layer 2: Expanded Navigation */}
      {subscene === "expanded" && (
        <div className="carousel-layer carousel-expanded">
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
              className="carousel-btn"
            >
              Exit
            </button>
            {images.length > 1 && (
              <>
                <button 
                  type="button" 
                  onClick={prevSlide}
                  aria-label="Previous"
                  className="carousel-btn"
                >
                  ◀ Prev
                </button>
                <button 
                  type="button" 
                  onClick={nextSlide}
                  aria-label={`Image ${currentIndex + 1} of ${images.length}. ${currentImage.alt}. Next`}
                  className="carousel-btn"
                >
                  Next ▶
                </button>
              </>
            )}
            <button 
              type="button" 
              onClick={enterZoom}
              aria-label="Zoom"
              className="carousel-btn"
            >
              🔍 Zoom
            </button>
          </div>
        </div>
      )}

      {/* Layer 3: Zoom Mode */}
      {subscene === "zoom" && (
        <div className="carousel-layer carousel-zoom">
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
