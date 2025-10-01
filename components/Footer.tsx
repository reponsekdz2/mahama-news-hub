import React from 'react';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import { useSettings } from '../contexts/SettingsContext.tsx';

interface FooterProps {
    onTopicChange: (topic: string) => void;
}

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
      <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
    </svg>
    <span className="font-bold text-xl text-accent-600">Mahama News TV</span>
  </div>
);

const Footer: React.FC<FooterProps> = ({ onTopicChange }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useSettings();

  const SocialLink: React.FC<{href: string, icon: string, label: string}> = ({ href, icon, label }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-500 transition-colors" aria-label={label}>
        <img src={icon} className="w-6 h-6 dark:invert" alt={label}/>
    </a>
  );

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Branding */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('aboutUsText')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{t('quickLinks')}</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button onClick={() => onTopicChange(cat)} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{t(cat as any)}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social & Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{t('followUs')}</h3>
            <div className="flex space-x-4 mt-4">
                <SocialLink href="https://x.com" icon="https://simpleicons.org/icons/x.svg" label="Follow on X" />
                <SocialLink href="https://facebook.com" icon="https://simpleicons.org/icons/facebook.svg" label="Follow on Facebook" />
                <SocialLink href="https://linkedin.com" icon="https://simpleicons.org/icons/linkedin.svg" label="Follow on LinkedIn" />
            </div>
          </div>
          
          {/* Column 4: Settings */}
           <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{t('settings')}</h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('language')}</span>
                        <div className="flex items-center space-x-1 mt-1">
                            {(['en', 'fr', 'rw'] as const).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${language === lang ? 'bg-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                            >
                                {lang.toUpperCase()}
                            </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('darkMode')}</span>
                        <div className="mt-1">
                            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-accent-600' : 'bg-gray-300'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
           </div>

        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Mahama News TV. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">{t('poweredBy')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
