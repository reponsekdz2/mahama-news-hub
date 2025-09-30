import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  selectedTopic: string;
  onTopicChange: (topicKey: string) => void;
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
}

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2 flex-shrink-0">
    <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
      <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
    </svg>
    <span className="font-bold text-xl sm:text-2xl text-accent-600 hidden sm:inline">Mahama News TV</span>
  </div>
);

const UserMenu: React.FC<{onTopicChange: (topic: string) => void, onLogout: () => void}> = ({ onTopicChange, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (topic: string) => {
        onTopicChange(topic);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800"
              aria-label={t('userMenu')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {isOpen && (
                 <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-40">
                    <div className="py-1">
                        <button onClick={() => handleSelect('forYou')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('forYou')}</button>
                        <button onClick={() => handleSelect('savedArticles')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('savedArticles')}</button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('logout')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ selectedTopic, onTopicChange, onSearch, onOpenSettings, onOpenLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const loggedInCategories = ['forYou', 'savedArticles', ...CATEGORIES];
  const navCategories = isLoggedIn ? loggedInCategories : CATEGORIES;

  // Close menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <SearchBar onSearch={onSearch} />
            
            {isLoggedIn ? (
                <UserMenu onTopicChange={onTopicChange} onLogout={logout} />
            ) : (
                <button
                  onClick={onOpenLogin}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800"
                  aria-label={t('loginAriaLabel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
            )}

            <button 
              onClick={onOpenSettings} 
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800"
              aria-label={t('openSettings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-controls="categories-menu"
                aria-label="Open categories menu"
              >
                 {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                 ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                 )}
              </button>
              
              {isMenuOpen && (
                <div 
                  id="categories-menu"
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1" role="none">
                    {navCategories.map(categoryKey => (
                      <button
                        key={categoryKey}
                        onClick={() => {
                          onTopicChange(categoryKey);
                          setIsMenuOpen(false);
                        }}
                        className={`${
                          selectedTopic.toLowerCase() === t(categoryKey as any).toLowerCase()
                            ? 'bg-accent-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } block w-full text-left px-4 py-2 text-sm transition-colors`}
                        role="menuitem"
                      >
                        {t(categoryKey as any)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
