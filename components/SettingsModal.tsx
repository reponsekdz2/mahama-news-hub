
import React from 'react';
import { useSettings, availableColors, ACCENT_COLORS } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 md:max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6 space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{t('darkMode')}</span>
              <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-accent-600' : 'bg-gray-200'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Accent Color Picker */}
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t('accentColor')}</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${accentColor === color ? 'border-accent-500 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: `rgb(${ACCENT_COLORS[color]['500']})` }}
                    aria-label={`Set accent color to ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t('language')}</span>
              <div className="flex items-center space-x-2 mt-2">
                {(['en', 'fr', 'rw'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === lang ? 'bg-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
