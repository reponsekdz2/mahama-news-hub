import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getPreferences, updatePreference } from '../services/userService.ts';
import { useAuth } from './AuthContext.tsx';
import { UserPreferences } from '../types.ts';

export type Theme = 'light' | 'dark';
export type AccentColor = UserPreferences['accentColor'];
export type FontSize = 'sm' | 'base' | 'lg';
export type LineHeight = 'normal' | 'relaxed' | 'loose';

export const availableColors: AccentColor[] = ['red', 'orange', 'green', 'blue', 'purple', 'teal', 'pink'];

export const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  red: { '500': '239 68 68', '600': '220 38 38', '50': '254 242 242', '100': '254 226 226', '200': '254 202 202', '300': '252 165 165', '400': '248 113 113', '700': '185 28 28', '800': '153 27 27', '900': '127 29 29' },
  orange: { '500': '249 115 22', '600': '234 88 12', '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18' },
  green: { '500': '34 197 94', '600': '22 163 74', '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45' },
  blue: { '500': '59 130 246', '600': '37 99 235', '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '700': '29 78 216', '800': '30 66 159', '900': '30 58 138' },
  purple: { '500': '139 92 246', '600': '124 58 237', '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149' },
  teal: { '500': '20 184 166', '600': '13 148 136', '50': '240 253 250', '100': '204 251 241', '200': '153 246 228', '300': '107 231 206', '400': '52 211 153', '700': '15 118 110', '800': '19 94 88', '900': '19 78 74'},
  pink: { '500': '236 72 153', '600': '219 39 119', '50': '253 242 248', '100': '252 231 243', '200': '251 207 232', '300': '249 168 212', '400': '244 114 182', '700': '190 24 93', '800': '157 23 77', '900': '131 24 67'},
};


interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  lineHeight: LineHeight;
  setLineHeight: (height: LineHeight) => void;
  loadUserSettings: (token: string) => Promise<void>;
  isPersistenceLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applySettingsStyle = (settings: { theme: Theme, accentColor: AccentColor }) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);

    const color = ACCENT_COLORS[settings.accentColor];
    for (const [shade, rgb] of Object.entries(color)) {
      root.style.setProperty(`--accent-color-${shade}`, rgb);
    }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPersistenceLoading, setIsPersistenceLoading] = useState(true);

  // Load initial settings from localStorage or set defaults to 'light'
  const [theme, _setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [accentColor, _setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'red');
  const [fontSize, _setFontSize] = useState<FontSize>(() => (localStorage.getItem('fontSize') as FontSize) || 'base');
  const [lineHeight, _setLineHeight] = useState<LineHeight>(() => (localStorage.getItem('lineHeight') as LineHeight) || 'normal');


  useEffect(() => {
    applySettingsStyle({ theme, accentColor });
    if(isPersistenceLoading) setIsPersistenceLoading(false);
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
  
  const setFontSize = (newSize: FontSize) => {
      _setFontSize(newSize);
      localStorage.setItem('fontSize', newSize);
      if(user?.token) updatePreference('fontSize', newSize, user.token).catch(console.error);
  }
  
  const setLineHeight = (newHeight: LineHeight) => {
      _setLineHeight(newHeight);
      localStorage.setItem('lineHeight', newHeight);
      if(user?.token) updatePreference('lineHeight', newHeight, user.token).catch(console.error);
  }

  const loadUserSettings = useCallback(async (token: string) => {
    setIsPersistenceLoading(true);
    try {
        const prefs = await getPreferences(token);
        _setTheme(prefs.theme || 'light');
        _setAccentColor(prefs.accentColor || 'red');
        _setFontSize(prefs.fontSize || 'base');
        _setLineHeight(prefs.lineHeight || 'normal');
        localStorage.setItem('theme', prefs.theme || 'light');
        localStorage.setItem('accentColor', prefs.accentColor || 'red');
        localStorage.setItem('fontSize', prefs.fontSize || 'base');
        localStorage.setItem('lineHeight', prefs.lineHeight || 'normal');
    } catch (error) {
        console.warn("Could not load user settings from DB, using local.", error);
    } finally {
      setIsPersistenceLoading(false);
    }
  }, []);

  const value = { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize, lineHeight, setLineHeight, loadUserSettings, isPersistenceLoading };

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