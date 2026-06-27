import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";

import { getThemePreference, saveThemePreference } from "./theme.storage";
import { darkTheme, lightTheme } from "./themes";
import { resolveColorScheme } from "./theme.utils";
import { ThemePreference } from "./theme.type";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedScheme: "light" | "dark";
  theme: typeof lightTheme;
  isHydrated: boolean;
  setPreference: (value: ThemePreference) => Promise<void>;
  setLightTheme: () => Promise<void>;
  setDarkTheme: () => Promise<void>;
  setSystemTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemSchemeFromHook = useColorScheme();
  const [systemScheme, setSystemScheme] =
    useState<ColorSchemeName>(systemSchemeFromHook);
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSystemScheme(systemSchemeFromHook);
  }, [systemSchemeFromHook]);

  useEffect(() => {
    let mounted = true;

    async function hydrateTheme() {
      try {
        const stored = await getThemePreference();
        if (mounted && stored) {
          setPreferenceState(stored);
        }
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrateTheme();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    await saveThemePreference(value);
  }, []);

  const resolvedScheme = useMemo(
    () => resolveColorScheme(preference, systemScheme),
    [preference, systemScheme],
  );

  const theme = useMemo(
    () => (resolvedScheme === "dark" ? darkTheme : lightTheme),
    [resolvedScheme],
  );

  const setLightTheme = useCallback(async () => {
    await setPreference("light");
  }, [setPreference]);

  const setDarkTheme = useCallback(async () => {
    await setPreference("dark");
  }, [setPreference]);

  const setSystemTheme = useCallback(async () => {
    await setPreference("system");
  }, [setPreference]);

  const toggleTheme = useCallback(async () => {
    const next = resolvedScheme === "dark" ? "light" : "dark";
    await setPreference(next);
  }, [resolvedScheme, setPreference]);

  const value = useMemo(
    () => ({
      preference,
      resolvedScheme,
      theme,
      isHydrated,
      setPreference,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      toggleTheme,
    }),
    [
      preference,
      resolvedScheme,
      theme,
      isHydrated,
      setPreference,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }
  return context;
}
