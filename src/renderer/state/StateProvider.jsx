import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
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
};

const AppState = createContext();

// Test shortcut 0 (freeze the inactivity timer) has to beat every scene-level
// capture handler — attract, instruction, theme tip toast and the idle warning all
// swallow unrecognized keys. Registering at module load puts this listener first in
// window/capture order, ahead of anything a component effect can attach.
const idleTimeoutToggleRef = { current: null };
const autoReadFastToggleRef = { current: null };
export const volumeAnnounceRef = { current: null };
export const volumeHudRef = { current: null };

if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat) return;
      if (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0") {
        if (!idleTimeoutToggleRef.current) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        idleTimeoutToggleRef.current();
        return;
      }
      if (e.key === "9" || e.code === "Digit9" || e.code === "Numpad9") {
        if (!autoReadFastToggleRef.current) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        autoReadFastToggleRef.current();
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "w" || key === "i") {
        e.preventDefault();
        e.stopImmediatePropagation();
        const isUp = key === "w";
        const channel = isUp ? "volume-up" : "volume-down";
        const label = isUp ? "Volume Up" : "Volume Down";
        volumeAnnounceRef.current?.(label);
        if (typeof window.kioskApi?.invoke === "function") {
          window.kioskApi.invoke(channel).then((pct) => {
            if (typeof pct === "number") volumeHudRef.current?.(label, pct);
          });
        } else {
          window.kioskApi?.send(channel);
        }
      }
    },
    true
  );
}

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
      const stored = JSON.parse(localStorage.getItem("prefs")) || {};
      // Drop removed speechRate key if still present in older saves.
      delete stored.speechRate;
      return { ...DEFAULT_PREFS, ...stored };
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

  // Auto-read plays entirely on timers and live-region updates, so it fires none of
  // the events the inactivity timer counts as activity. Without this the timer runs
  // down while the app is actively reading to the visitor.
  const [autoReadActive, setAutoReadActive] = useState(false);

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
    setSpeechMode((prev) => {
      if (!prev) {
        lastTtsToggleRef.current = Date.now();
        window.kioskApi?.send("toggle-tts");
        return true;
      }
      return prev;
    });
  }, []);

  const [hasSeenThemeTip, setHasSeenThemeTip] = useState(false);

  const markThemeTipSeen = useCallback(() => {
    setHasSeenThemeTip(true);
  }, []);

  const [previousScene, setPreviousScene] = useState("home");

  const [idleTimeoutDisabled, setIdleTimeoutDisabled] = useState(false);
  const [autoReadFast, setAutoReadFast] = useState(false);

  useLayoutEffect(() => {
    const toggle = () => setIdleTimeoutDisabled((prev) => !prev);
    idleTimeoutToggleRef.current = toggle;
    return () => {
      if (idleTimeoutToggleRef.current === toggle) {
        idleTimeoutToggleRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    const toggle = () => setAutoReadFast((prev) => !prev);
    autoReadFastToggleRef.current = toggle;
    return () => {
      if (autoReadFastToggleRef.current === toggle) {
        autoReadFastToggleRef.current = null;
      }
    };
  }, []);

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
    setAutoReadActive(false);
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
      autoReadActive,
      setAutoReadActive,
      speechMode,
      toggleSpeechMode,
      setSpeechModeWithTts,
      lastTtsToggleRef,
      isPaused,
      togglePaused,
      hasSeenThemeTip,
      markThemeTipSeen,
      resetToStart,
      idleTimeoutDisabled,
      autoReadFast,
      testEasterEgg,
      triggerTestEasterEgg,
      dismissTestEasterEgg
    }}>
      {children}
    </AppState.Provider>
  );
}
