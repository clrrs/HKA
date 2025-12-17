import { useEffect, useRef } from "react";

export function useSceneFocus(sceneId, isActive) {
  const lastFocusedRef = useRef(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const sceneEl = document.querySelector(`[data-scene="${sceneId}"]`);
    if (!sceneEl) return;
    
    const first = sceneEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (first) {
      // Small timeout to ensure visible
      setTimeout(() => { 
        first.focus(); 
      }, 50);
    }
    
    return () => { 
      lastFocusedRef.current = document.activeElement; 
    };
  }, [sceneId, isActive]);
}

export function useKeyboardNav() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Global keyboard shortcuts can go here
      // For now, letting default tab navigation work
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

