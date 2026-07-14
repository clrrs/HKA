import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

export const DEFAULT_PREFS = {
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

  const [isPaused, setIsPaused] = useState(false);
  const togglePaused = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const goToScene = (sceneName, options = {}) => {
    setScene(sceneName);
    setSubscene(options.subscene || null);
    if (options.artifactId !== undefined) {
      setArtifactId(options.artifactId);
    } else if (sceneName !== "theme") {
      // Artifact popup only exists on the theme scene; clear it so it
      // doesn't reappear stale the next time the theme scene is entered.
      setArtifactId(null);
    }
    if (options.theme !== undefined) {
      setCurrentTheme(options.theme);
    }
  };

  const openArtifact = useCallback((id) => {
    setArtifactId(id);
  }, []);

  const closeArtifact = useCallback(() => {
    setArtifactId(null);
    setSubscene(null);
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsOnboarding, setSettingsOnboarding] = useState(false);
  const [pendingAccessibilityOnboarding, setPendingAccessibilityOnboarding] =
    useState(true);

  const dismissSettings = useCallback(() => {
    setShowSettings(false);
    setSettingsOnboarding(false);
    setPendingAccessibilityOnboarding(false);
  }, []);

  const openSettingsOnboarding = useCallback(() => {
    setSettingsOnboarding(true);
    setShowSettings(true);
  }, []);

  const toggleSettings = () => {
    setShowSettings((prev) => {
      if (prev && settingsOnboarding) {
        setSettingsOnboarding(false);
        setPendingAccessibilityOnboarding(false);
      }
      return !prev;
    });
  };

  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);

  const [speechMode, setSpeechMode] = useState(true);
  const toggleSpeechMode = () => setSpeechMode((prev) => !prev);
  const lastTtsToggleRef = useRef(0);

  const setSpeechModeWithTts = useCallback((enabled) => {
    lastTtsToggleRef.current = Date.now();
    setSpeechMode(enabled);
    window.kioskApi?.send("toggle-tts");
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    window.kioskApi?.send("reset-speech-rate");
    setSpeechMode((prev) => {
      if (!prev) {
        lastTtsToggleRef.current = Date.now();
        window.kioskApi?.send("toggle-tts");
        return true;
      }
      return prev;
    });
  }, []);

  const [visitedThemes, setVisitedThemes] = useState({});

  const markThemeVisited = useCallback((themeId) => {
    setVisitedThemes((prev) => (prev[themeId] ? prev : { ...prev, [themeId]: true }));
  }, []);

  const [previousScene, setPreviousScene] = useState("home");

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
    setSettingsOnboarding(false);
    setPendingAccessibilityOnboarding(true);
    setPreviousScene("attract");
    setTestEasterEgg(null);
    setVisitedThemes({});
    setIsPaused(false);
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
    } else if (scene === "theme") {
      setScene("quote");
    } else if (scene === "quote") {
      setScene("home");
    } else if (scene === "home") {
      setScene("instruction");
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
      openArtifact,
      closeArtifact,
      currentTheme,
      prefs, 
      setPref,
      resetPrefs,
      goToScene: goToSceneWithHistory,
      goBack,
      showSettings,
      toggleSettings,
      settingsOnboarding,
      pendingAccessibilityOnboarding,
      openSettingsOnboarding,
      dismissSettings,
      videoOverlayOpen,
      setVideoOverlayOpen,
      speechMode,
      toggleSpeechMode,
      setSpeechModeWithTts,
      lastTtsToggleRef,
      isPaused,
      togglePaused,
      visitedThemes,
      markThemeVisited,
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
