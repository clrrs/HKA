import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const TEST_EASTER_EGG_MESSAGES = [
  "thank you for trying to break something!",
  "nice try, carry on",
  "thank you for bug hunting.",
];

const TEST_EASTER_EGG_IMAGES = [
  "/zz_testingMaterials/catOfTechnology.jpeg",
  "/zz_testingMaterials/catOfSadness.jpg",
  "/zz_testingMaterials/catOfBug.jpeg",
];

const TEST_EASTER_EGG_SFX = [
  "/zz_testingMaterials/testsfx1.mp3",
  "/zz_testingMaterials/testsfx2.mp3",
  "/zz_testingMaterials/testsfx3.mp3",
];

const DEFAULT_PREFS = {
  textSize: "medium",
  theme: "dark",
  brightness: 1,
  speechRate: "normal"
};

const AppState = createContext();

export function useAppState() { 
  return useContext(AppState); 
}

export default function StateProvider({ children }) {
  const [scene, setScene] = useState("attract");
  const [subscene, setSubscene] = useState(null);
  const [artifactId, setArtifactId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(null);
  
  const [prefs, setPrefs] = useState(() => {
    try {
      // speechRate always starts at "normal" so a crash can't leave a
      // previous user's fast/slow setting active for the next user.
      return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem("prefs")) || {}), speechRate: "normal" };
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

  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);

  const [speechMode, setSpeechMode] = useState(true);
  const toggleSpeechMode = () => setSpeechMode(prev => !prev);
  const [hasVisitedThemeSelection, setHasVisitedThemeSelection] = useState(false);

  const [previousScene, setPreviousScene] = useState("start");

  const [idleTimeoutDisabled, setIdleTimeoutDisabled] = useState(false);
  const toggleIdleTimeoutDisabled = () =>
    setIdleTimeoutDisabled((prev) => !prev);

  const [testEasterEgg, setTestEasterEgg] = useState(null);

  const triggerTestEasterEgg = useCallback(() => {
    setTestEasterEgg({
      message:
        TEST_EASTER_EGG_MESSAGES[
          Math.floor(Math.random() * TEST_EASTER_EGG_MESSAGES.length)
        ],
      imageSrc:
        TEST_EASTER_EGG_IMAGES[
          Math.floor(Math.random() * TEST_EASTER_EGG_IMAGES.length)
        ],
      audioSrc:
        TEST_EASTER_EGG_SFX[
          Math.floor(Math.random() * TEST_EASTER_EGG_SFX.length)
        ],
    });
  }, []);

  const dismissTestEasterEgg = useCallback(() => {
    setTestEasterEgg(null);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.speechMode = speechMode ? "on" : "off";
  }, [speechMode]);

  const resetToStart = () => {
    setScene("attract");
    setSubscene(null);
    setArtifactId(null);
    setCurrentTheme(null);
    setPrefs(DEFAULT_PREFS);
    setShowSettings(false);
    setPreviousScene("attract");
    setTestEasterEgg(null);
    setHasVisitedThemeSelection(false);
    window.kioskApi?.send("reset-speech-rate");
    try {
      localStorage.removeItem("prefs");
    } catch {
      // ignore
    }
  };

  const goBack = () => {
    // if (subscene === "zoom") {
    //   setSubscene("expanded");
    // } else
    if (subscene === "expanded") {
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
      videoOverlayOpen,
      setVideoOverlayOpen,
      speechMode,
      toggleSpeechMode,
      hasVisitedThemeSelection,
      setHasVisitedThemeSelection,
      resetToStart,
      idleTimeoutDisabled,
      toggleIdleTimeoutDisabled,
      testEasterEgg,
      triggerTestEasterEgg,
      dismissTestEasterEgg
    }}>
      {children}
    </AppState.Provider>
  );
}

