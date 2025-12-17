import React, { createContext, useContext, useState, useEffect } from "react";

const AppState = createContext();

export function useAppState() { 
  return useContext(AppState); 
}

export default function StateProvider({ children }) {
  const [scene, setScene] = useState("home");
  const [subscene, setSubscene] = useState(null);
  const [artifactId, setArtifactId] = useState(null);
  
  const [prefs, setPrefs] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem("prefs")) || { 
        textSize: "medium", 
        theme: "dark", 
        brightness: 1 
      }; 
    } catch { 
      return { textSize: "medium", theme: "dark", brightness: 1 }; 
    }
  });

  useEffect(() => {
    localStorage.setItem("prefs", JSON.stringify(prefs));
    document.documentElement.classList.remove("text-small", "text-medium", "text-large");
    document.documentElement.classList.add(`text-${prefs.textSize}`);
    document.documentElement.classList.toggle("theme-dark", prefs.theme === "dark");
    document.documentElement.classList.toggle("theme-light", prefs.theme === "light");
    document.documentElement.style.setProperty("--brightness", prefs.brightness);
  }, [prefs]);

  const setPref = (k, v) => setPrefs(prev => ({...prev, [k]: v}));

  const goToScene = (sceneName, options = {}) => {
    setScene(sceneName);
    setSubscene(options.subscene || null);
    if (options.artifactId !== undefined) {
      setArtifactId(options.artifactId);
    }
  };

  const [previousScene, setPreviousScene] = useState("home");

  const goBack = () => {
    // Simple back navigation logic
    if (subscene === "zoom") {
      setSubscene("expanded");
    } else if (subscene === "expanded") {
      setSubscene(null);
    } else if (scene === "artifact") {
      setScene("travel");
    } else if (scene === "travel") {
      setScene("home");
    } else if (scene === "accessibility") {
      setScene(previousScene);
    }
  };

  // Track previous scene when going to accessibility
  const goToSceneWithHistory = (sceneName, options = {}) => {
    if (sceneName === "accessibility" && scene !== "accessibility") {
      setPreviousScene(scene);
    }
    goToScene(sceneName, options);
  };

  return (
    <AppState.Provider value={{ 
      scene, 
      setScene, 
      subscene, 
      setSubscene, 
      artifactId,
      setArtifactId,
      prefs, 
      setPref,
      goToScene: goToSceneWithHistory,
      goBack
    }}>
      {children}
    </AppState.Provider>
  );
}

