import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type AccentColor = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo' | 'pink';

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
  },
  teal: {
    '50': '240 253 250', '100': '204 251 241', '200': '167 243 228', '300': '107 231 204', '400': '45 212 191', '500': '20 184 166', '600': '13 148 136', '700': '15 118 110', '800': '17 94 89', '900': '15 76 72'
  },
  indigo: {
    '50': '238 242 255', '100': '224 231 255', '200': '199 210 254', '300': '165 180 252', '400': '129 140 248', '500': '99 102 241', '600': '79 70 229', '700': '67 56 202', '800': '55 48 163', '900': '49 46 129'
  },
  pink: {
    '50': '253 242 248', '100': '252 231 243', '200': '251 207 232', '300': '249 168 212', '400': '244 114 182', '500': '236 72 153', '600': '219 39 119', '700': '190 24 93', '800': '157 23 77', '900': '131 24 67'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    // Fix: Pass the 'unknown' error object directly to console.warn, which accepts any type.
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Default to dark mode for a modern feel, but respect user's preference if set
    const stored = getStoredValue<'light' | 'dark' | null>('theme', null);
    if (stored) return stored;
    // Check system preference, but default to dark if not specified
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => 
    getStoredValue<AccentColor>('accentColor', 'red')
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = ACCENT_COLORS[accentColor];
    for (const [shade, value] of Object.entries(colors)) {
        root.style.setProperty(`--accent-color-${shade}`, value);
    }
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

export const availableColors = Object.keys(ACCENT_COLORS) as AccentColor[];
export { ACCENT_COLORS };