import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppColors, AppThemeName, themeColors } from './colors';

type ThemeContextValue = {
  colors: AppColors;
  themeName: AppThemeName;
  setThemeName: (themeName: AppThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeStorageKey = '@DebTecJourney:theme';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemTheme = useColorScheme();
  const [themeName, setThemeName] = useState<AppThemeName>(() => (systemTheme === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    let isMounted = true;

    async function loadStoredTheme() {
      const storedTheme = await AsyncStorage.getItem(themeStorageKey);

      if (isMounted && (storedTheme === 'light' || storedTheme === 'dark')) {
        setThemeName(storedTheme);
      }
    }

    loadStoredTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const applyThemeName = useCallback((nextThemeName: AppThemeName) => {
    setThemeName(nextThemeName);
    AsyncStorage.setItem(themeStorageKey, nextThemeName);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: themeColors[themeName],
      themeName,
      setThemeName: applyThemeName,
      toggleTheme: () => applyThemeName(themeName === 'dark' ? 'light' : 'dark'),
    }),
    [applyThemeName, themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
