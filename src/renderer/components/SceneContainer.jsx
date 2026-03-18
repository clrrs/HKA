import React from "react";
import { useAppState } from "../state/StateProvider";
import Scene from "./Scene";
import AttractScene from "./scenes/AttractScene";
import InstructionScene from "./scenes/InstructionScene";
import HomeScene from "./scenes/HomeScene";
import QuoteScene from "./scenes/QuoteScene";
import TravelScene from "./scenes/TravelScene";
import ArtifactScene from "./scenes/ArtifactScene";
import StartScene from "./scenes/StartScene";

export default function SceneContainer() {
  const { scene } = useAppState();

  return (
    <div className="scene-container">
      <Scene id="attract" isActive={scene === "attract"}>
        <AttractScene isActive={scene === "attract"} />
      </Scene>
      <Scene id="instruction" isActive={scene === "instruction"}>
        <InstructionScene isActive={scene === "instruction"} />
      </Scene>
      <Scene id="start" isActive={scene === "start"}>
        <StartScene />
      </Scene>
      
      <Scene id="home" isActive={scene === "home"}>
        <HomeScene />
      </Scene>

      <Scene id="quote" isActive={scene === "quote"}>
        <QuoteScene />
      </Scene>
      
      <Scene id="travel" isActive={scene === "travel"}>
        <TravelScene />
      </Scene>
      
      <Scene id="artifact" isActive={scene === "artifact"}>
        <ArtifactScene />
      </Scene>
    </div>
  );
}

