import React from "react";
import { useSceneFocus } from "../state/useSceneManager";

export default function Scene({ id, children, isActive }) {
  useSceneFocus(id, isActive);
  
  return (
    <div 
      data-scene={id} 
      aria-hidden={!isActive}
      inert={!isActive ? "" : undefined}
      className={isActive ? "scene scene-active" : "scene scene-hidden"}
    >
      {children}
    </div>
  );
}

