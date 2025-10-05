import React, { useState, useEffect, useRef } from 'react';
import NotificationsDropdown from './NotificationsDropdown.tsx';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface HeaderProps {
  logoUrl: string;
  selectedTopic: string;
  onTopicChange: (topicKey: string) => void;
  onSearch: () => void;
  onSurpriseMe: () => void;
  onOpenLogin: () => void;
  onNavigate: (view: 'admin' | 'settings') => void;
}

const Logo: React.FC<{onClick: () => void, logoUrl: string}> = ({ onClick, logoUrl }) => (
  <button onClick={onClick} className="flex items-center space-x-2 flex-shrink-0">
    {logoUrl ? (
        <img src={logoUrl} alt="Site Logo" className="h-8 w-auto" />
    ) : (
        <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
          <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
        </svg>
    )}
    <span className="font-bold text-xl sm:text-2xl text-accent-600 hidden sm:inline">Mahama News TV</span>
  </button>
);

const UserMenu: React.FC<{onTopicChange: (topic: string) => void, onLogout: () => void, onNavigate: (view: 'admin' | 'settings') => void}> = ({ onTopicChange, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
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

    const handleNavigateAndClose = (view: 'admin' | 'settings') => {
        onNavigate(view);
        setIsOpen(false);
    };
    
    const handleSelectAndClose = (topic: string) => {
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
                        {user?.role === 'admin' && (
                           <button onClick={() => handleNavigateAndClose('admin')} className="block w-full text-left px-4 py-2 text-sm font-semibold text-accent-600 dark:text-accent-400 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Panel</button>
                        )}
                        <button onClick={() => handleSelectAndClose('myLibrary')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('myLibrary')}</button>
                        <button onClick={() => handleSelectAndClose('readingHistory')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('readingHistory')}</button>
                        <button onClick={() => handleNavigateAndClose('settings')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings')}</button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('logout')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ logoUrl, selectedTopic, onTopicChange, onSearch, onSurpriseMe, onOpenLogin, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  const baseNavCategories = CATEGORIES;
  const loggedInNavCategories = ['myLibrary', 'readingHistory'];
  const allNavCategories = isLoggedIn ? [...baseNavCategories, ...loggedInNavCategories] : baseNavCategories;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    // Cleanup on component unmount
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  const NavLink: React.FC<{topicKey: string}> = ({ topicKey }) => (
    <button
        onClick={() => onTopicChange(topicKey)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTopic === topicKey
            ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
    >
        {t(topicKey as any)}
    </button>
  );

  const MobileMenuItem: React.FC<{onClick: () => void, children: React.ReactNode, className?: string}> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`block w-full text-left px-4 py-3 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md ${className}`}>
        {children}
    </button>
  );

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Logo onClick={() => onTopicChange('Top Stories')} logoUrl={logoUrl} />

                  {/* Desktop Navigation & Controls */}
                  <div className="hidden lg:flex items-center space-x-1">
                      {baseNavCategories.map(cat => <NavLink key={cat} topicKey={cat} />)}
                      <div className="w-4 border-l dark:border-gray-600 h-6 mx-2"></div>
                      <button onClick={onSurpriseMe} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('surpriseMe')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L11 12l2.293 2.293a1 1 0 010 1.414L11 18m0-6l2.293-2.293a1 1 0 011.414 0L17 12m-6 0l2.293 2.293a1 1 0 010 1.414L13 18" /></svg>
                      </button>
                      <button onClick={onSearch} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('searchAriaLabel')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </button>
                      {isLoggedIn && <NotificationsDropdown onNavigateToArticle={() => { /* Implement navigation */ }} />}
                      {isLoggedIn ? (
                          <UserMenu onTopicChange={onTopicChange} onLogout={logout} onNavigate={onNavigate}/>
                      ) : (
                          <button
                            onClick={onOpenLogin}
                            className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-md"
                          >
                            {t('login')}
                          </button>
                      )}
                  </div>
                  
                  {/* Mobile Menu Button */}
                  <div className="lg:hidden">
                      <button
                          onClick={() => setIsMobileMenuOpen(true)}
                          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Open menu"
                      >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                      </button>
                  </div>
              </div>
          </div>
      </header>

      {/* --- Mobile Menu Panel --- */}
      {/* Backdrop */}
      <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
      />
      {/* Panel */}
      <div
          ref={panelRef}
          className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
      >
          <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                  <h2 id="mobile-menu-title" className="font-bold text-lg text-accent-600 dark:text-accent-400">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close menu">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              {/* Content */}
              <div className="flex-grow overflow-y-auto p-4 space-y-2">
                  <MobileMenuItem onClick={() => { onSearch(); setIsMobileMenuOpen(false); }}>{t('searchAriaLabel')}</MobileMenuItem>
                  <MobileMenuItem onClick={() => { onSurpriseMe(); setIsMobileMenuOpen(false); }}>{t('surpriseMe')}</MobileMenuItem>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <p className="px-4 pt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Categories</p>
                  {allNavCategories.map(categoryKey => (
                      <MobileMenuItem key={categoryKey} onClick={() => { onTopicChange(categoryKey); setIsMobileMenuOpen(false); }}>
                          {t(categoryKey as any)}
                      </MobileMenuItem>
                  ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  {isLoggedIn ? (
                      <>
                          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <span className="text-base text-gray-700 dark:text-gray-300">{t('notifications')}</span>
                            <NotificationsDropdown onNavigateToArticle={() => { /* Implement navigation */ }} />
                          </div>
                          {user?.role === 'admin' && (
                              <MobileMenuItem onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}>Admin Panel</MobileMenuItem>
                          )}
                          <MobileMenuItem onClick={() => { onNavigate('settings'); setIsMobileMenuOpen(false); }}>{t('settings')}</MobileMenuItem>
                          <MobileMenuItem onClick={logout}>{t('logout')}</MobileMenuItem>
                      </>
                  ) : (
                      <MobileMenuItem onClick={() => { onOpenLogin(); setIsMobileMenuOpen(false); }} className="bg-accent-600 text-white font-semibold hover:bg-accent-700 hover:text-white dark:hover:bg-accent-700">
                          {t('login')}
                      </MobileMenuItem>
                  )}
              </div>
          </div>
      </div>
    </>
  );
};

export default Header;