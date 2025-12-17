import React from "react";
import SceneContainer from "./components/SceneContainer";
import { useKeyboardNav } from "./state/useSceneManager";

export default function App() {
  useKeyboardNav();
  
  return (
    <div className="app">
      <SceneContainer />
    </div>
  );
}

