import React from "react";
import { useAppState } from "../state/StateProvider";
import Scene from "./Scene";
import HomeScene from "./scenes/HomeScene";
import TravelScene from "./scenes/TravelScene";
import ArtifactScene from "./scenes/ArtifactScene";
import StartScene from "./scenes/StartScene";

export default function SceneContainer() {
  const { scene } = useAppState();

  return (
    <main className="scene-container">
      <Scene id="start" isActive={scene === "start"}>
        <StartScene />
      </Scene>
      
      <Scene id="home" isActive={scene === "home"}>
        <HomeScene />
      </Scene>
      
      <Scene id="travel" isActive={scene === "travel"}>
        <TravelScene />
      </Scene>
      
      <Scene id="artifact" isActive={scene === "artifact"}>
        <ArtifactScene />
      </Scene>
    </main>
  );
}

