import React, { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_PREFS = {
  textSize: "medium",
  theme: "dark",
  brightness: 1
};

const AppState = createContext();

export function useAppState() { 
  return useContext(AppState); 
}

export default function StateProvider({ children }) {
  const [scene, setScene] = useState("start");
  const [subscene, setSubscene] = useState(null);
  const [artifactId, setArtifactId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(null);
  
  const [prefs, setPrefs] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem("prefs")) || DEFAULT_PREFS; 
    } catch { 
      return DEFAULT_PREFS; 
    }
  });

  useEffect(() => {
    localStorage.setItem("prefs", JSON.stringify(prefs));
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.textSize = prefs.textSize;
    document.documentElement.style.setProperty("--brightness", prefs.brightness);
  }, [prefs]);

  const setPref = (k, v) => setPrefs(prev => ({...prev, [k]: v}));

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
  };

  const goToScene = (sceneName, options = {}) => {
    setScene(sceneName);
    setSubscene(options.subscene || null);
    if (options.artifactId !== undefined) {
      setArtifactId(options.artifactId);
    }
    if (options.theme !== undefined) {
      setCurrentTheme(options.theme);
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings(prev => !prev);

  const [previousScene, setPreviousScene] = useState("start");

  const resetToStart = () => {
    setScene("start");
    setSubscene(null);
    setArtifactId(null);
    setCurrentTheme(null);
    setPrefs(DEFAULT_PREFS);
    setShowSettings(false);
    setPreviousScene("start");
    try {
      localStorage.removeItem("prefs");
    } catch {
      // ignore
    }
  };

  const goBack = () => {
    if (subscene === "zoom") {
      setSubscene("expanded");
    } else if (subscene === "expanded") {
      setSubscene(null);
    } else if (scene === "artifact") {
      setScene("travel");
    } else if (scene === "travel") {
      setScene("quote");
    } else if (scene === "quote") {
      setScene("home");
    } else if (scene === "home") {
      setScene("start");
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
      currentTheme,
      prefs, 
      setPref,
      resetPrefs,
      goToScene: goToSceneWithHistory,
      goBack,
      showSettings,
      toggleSettings,
      resetToStart
    }}>
      {children}
    </AppState.Provider>
  );
}

