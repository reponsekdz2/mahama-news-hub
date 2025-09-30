import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type AccentColor = 'red' | 'blue' | 'green' | 'purple' | 'orange';

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  red: {
    '50': '254 226 226', '100': '254 202 202', '200': '254 178 178', '300': '252 165 165', '400': '248 113 113', '500': '239 68 68', '600': '220 38 38', '700': '185 28 28', '800': '153 27 27', '900': '127 29 29'
  },
  blue: {
    '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138'
  },
  green: {
    '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '500': '34 197 94', '600': '22 163 74', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45'
  },
  purple: {
    '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149'
  },
  orange: {
    '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to safely access localStorage
// FIX: Added <T> to declare a generic type parameter for the function, resolving "Cannot find name 'T'".
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for stored theme, fallback to system preference
    const stored = getStoredValue<'light' | 'dark' | null>('theme', null);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => 
    getStoredValue<AccentColor>('accentColor', 'red')
  );

  useEffect(() => {
    const root = window.document.documentElement;
    // Apply theme
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = ACCENT_COLORS[accentColor];
    // Apply accent color CSS variables
    for (const [shade, value] of Object.entries(colors)) {
        root.style.setProperty(`--accent-color-${shade}`, value);
    }
    // FIX: To resolve the reported type error, we ensure the value passed to localStorage is a valid string.
    // Using JSON.stringify is the correct approach because getStoredValue uses JSON.parse to retrieve it.
    localStorage.setItem('accentColor', JSON.stringify(accentColor));
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
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

// Expose colors for the settings modal
export const availableColors = Object.keys(ACCENT_COLORS) as AccentColor[];
export { ACCENT_COLORS };
