import React from "react";
import { useSceneFocus } from "../state/useSceneManager";

export default function Scene({ id, children, isActive }) {
  useSceneFocus(id, isActive && id !== "quote");

  const hiddenClass = id === "quote" ? "scene-kept-alive" : "scene-hidden";

  return (
    <div 
      data-scene={id} 
      inert={!isActive ? "" : undefined}
      className={isActive ? "scene scene-active" : `scene ${hiddenClass}`}
    >
      {children}
    </div>
  );
}

