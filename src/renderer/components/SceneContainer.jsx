import React from "react";
import { useAppState } from "../state/StateProvider";
import Scene from "./Scene";
import HomeScene from "./scenes/HomeScene";
import TravelScene from "./scenes/TravelScene";
import ArtifactScene from "./scenes/ArtifactScene";
import AccessibilityScene from "./scenes/AccessibilityScene";

export default function SceneContainer() {
  const { scene } = useAppState();

  return (
    <main className="scene-container">
      <Scene id="home" isActive={scene === "home"}>
        <HomeScene />
      </Scene>
      
      <Scene id="travel" isActive={scene === "travel"}>
        <TravelScene />
      </Scene>
      
      <Scene id="artifact" isActive={scene === "artifact"}>
        <ArtifactScene />
      </Scene>
      
      <Scene id="accessibility" isActive={scene === "accessibility"}>
        <AccessibilityScene />
      </Scene>
    </main>
  );
}

