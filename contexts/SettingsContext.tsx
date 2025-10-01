import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getPreferences, updatePreference } from '../services/userService.ts';
import { useAuth } from './AuthContext.tsx';

export type Theme = 'light' | 'dark';
export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'orange';
export const availableColors: AccentColor[] = ['blue', 'green', 'red', 'purple', 'orange'];

export const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  blue: { '500': '59 130 246', '600': '37 99 235', '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '700': '29 78 216', '800': '30 66 159', '900': '30 58 138' },
  green: { '500': '34 197 94', '600': '22 163 74', '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45' },
  red: { '500': '239 68 68', '600': '220 38 38', '50': '254 242 242', '100': '254 226 226', '200': '254 202 202', '300': '252 165 165', '400': '248 113 113', '700': '185 28 28', '800': '153 27 27', '900': '127 29 29' },
  purple: { '500': '139 92 246', '600': '124 58 237', '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149' },
  orange: { '500': '249 115 22', '600': '234 88 12', '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18' },
};

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  loadUserSettings: (token: string) => Promise<void>;
  isPersistenceLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applyThemeStyle = (theme: Theme, accentColor: AccentColor) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    const color = ACCENT_COLORS[accentColor];
    for (const [shade, rgb] of Object.entries(color)) {
      root.style.setProperty(`--accent-color-${shade}`, rgb);
    }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPersistenceLoading, setIsPersistenceLoading] = useState(true);

  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const getInitialAccent = (): AccentColor => {
      return (localStorage.getItem('accentColor') as AccentColor | null) || 'red';
  };

  const [theme, _setTheme] = useState<Theme>(getInitialTheme);
  const [accentColor, _setAccentColor] = useState<AccentColor>(getInitialAccent);

  useEffect(() => {
    applyThemeStyle(theme, accentColor);
  }, [theme, accentColor]);

  const setTheme = (newTheme: Theme) => {
    _setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user?.token) {
        updatePreference('theme', newTheme, user.token).catch(console.error);
    }
  };

  const setAccentColor = (newColor: AccentColor) => {
    _setAccentColor(newColor);
    localStorage.setItem('accentColor', newColor);
     if (user?.token) {
        updatePreference('accentColor', newColor, user.token).catch(console.error);
    }
  };

  const loadUserSettings = useCallback(async (token: string) => {
    setIsPersistenceLoading(true);
    try {
        const prefs = await getPreferences(token);
        _setTheme(prefs.theme);
        _setAccentColor(prefs.accentColor);
        localStorage.setItem('theme', prefs.theme);
        localStorage.setItem('accentColor', prefs.accentColor);
    } catch (error) {
        console.warn("Could not load user settings from DB, using local.", error);
    } finally {
      setIsPersistenceLoading(false);
    }
  }, []);

  const value = { theme, setTheme, accentColor, setAccentColor, loadUserSettings, isPersistenceLoading };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
