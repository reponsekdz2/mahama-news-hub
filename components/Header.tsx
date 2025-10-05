import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import ThemeToggle from './ThemeToggle.tsx';
import AuthModal from './AuthModal.tsx';
import NotificationsDropdown from './NotificationsDropdown.tsx';
import SearchOverlay from './SearchOverlay.tsx';
import { SearchFilters } from '../App.tsx';

type View = 'home' | 'search' | 'admin' | 'library' | 'settings' | 'surprise';

interface HeaderProps {
    onTopicSelect: (topic: string) => void;
    onSearch: (params: { query: string; filters: SearchFilters }) => void;
    onNavigate: (targetView: View) => void;
    onSurpriseMe: () => void;
    onSubscribeClick: () => void;
    currentTopic: string;
}

const Header: React.FC<HeaderProps> = ({
    onTopicSelect,
    onSearch,
    onNavigate,
    onSurpriseMe,
    onSubscribeClick,
    currentTopic,
}) => {
    const { user, isLoggedIn, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    
    const userMenuRef = useRef<HTMLDivElement>(null);
    const languageMenuRef = useRef<HTMLDivElement>(null);

    const handleSearchSubmit = (params: { query: string; filters: SearchFilters }) => {
        onSearch(params);
        setIsSearchOverlayOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false);
            if (languageMenuRef.current && !languageMenuRef.current.contains(target)) setIsLanguageMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = CATEGORIES;
    const userInitial = user ? user.name.charAt(0).toUpperCase() : '';
    
    const handleMobileLinkClick = (action: () => void) => {
        action();
        setIsMobileMenuOpen(false);
    };

    const UserMenuItems = () => (
      <>
        {user?.role === 'admin' && <button onClick={() => handleMobileLinkClick(() => onNavigate('admin'))} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Admin Panel</button>}
        <button onClick={() => handleMobileLinkClick(() => onNavigate('library'))} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">{t('myLibrary')}</button>
        <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700">{t('logout')}</button>
      </>
    );

    return (
        <>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isSearchOverlayOpen && <SearchOverlay onClose={() => setIsSearchOverlayOpen(false)} onSearch={handleSearchSubmit} />}
            
            <header className="sticky top-0 z-30 h-16 bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                    
                    {/* Left Side: Logo & Nav */}
                    <div className="flex items-center gap-4">
                         <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden" aria-label="Open menu">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        </button>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center gap-3 font-extrabold text-gray-900 dark:text-white" aria-label="Mahama News Home">
                             <svg className="h-10 w-10 text-accent-500 transition-transform duration-300 hover:rotate-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                            </svg>
                            <span className="text-2xl hidden sm:inline">Mahama News</span>
                        </a>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navLinks.map((topic) => (
                                <button key={topic} onClick={() => onTopicSelect(topic)} className={`px-3 py-2 text-sm font-medium rounded-md relative transition-colors ${currentTopic === topic ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                    {t(topic as any)}
                                    {currentTopic === topic && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={onSurpriseMe} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-transform duration-300 hover:rotate-12" aria-label={t('surpriseMe')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                        </button>
                        <button onClick={() => setIsSearchOverlayOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label={t('searchAriaLabel')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </button>
                        
                        <div className="relative" ref={languageMenuRef}>
                            <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Change language">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" /></svg>
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                                    <button onClick={() => { setLanguage('en'); setIsLanguageMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>English</button>
                                    <button onClick={() => { setLanguage('fr'); setIsLanguageMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === 'fr' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Français</button>
                                    <button onClick={() => { setLanguage('rw'); setIsLanguageMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === 'rw' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Kinyarwanda</button>
                                </div>
                            )}
                        </div>

                        <ThemeToggle />
                        
                        {isLoggedIn && user ? (
                           <>
                                <button onClick={() => onNavigate('settings')} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label={t('settings')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>
                               <div className="flex items-center gap-2">
                                    <NotificationsDropdown onNavigateToArticle={(articleId) => console.log("Navigate to", articleId)} />
                                    <div className="relative" ref={userMenuRef}>
                                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center" aria-label={t('userMenu')}>
                                            <div className="h-8 w-8 rounded-full bg-accent-100 text-accent-700 dark:bg-accent-800 dark:text-accent-300 flex items-center justify-center font-bold">{userInitial}</div>
                                        </button>
                                        {isUserMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"><UserMenuItems /></div>
                                        )}
                                    </div>
                               </div>
                           </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAuthModalOpen(true)} className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hidden sm:inline-flex">{t('login')}</button>
                                <button onClick={onSubscribeClick} className="px-3 py-2 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700">Subscribe</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Panel */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="fixed top-0 left-0 bottom-0 flex w-72 max-w-[80vw] flex-col bg-white p-6 shadow-xl dark:bg-gray-800 animate-slideInLeft">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-accent-600 dark:text-accent-400">Menu</h3>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 -mr-2">&times;</button>
                        </div>
                        <nav className="mt-8 flex flex-col gap-1">
                            {navLinks.map((topic) => (
                                <button key={topic} onClick={() => handleMobileLinkClick(() => onTopicSelect(topic))} className={`px-4 py-2 text-left rounded-md font-medium transition-colors ${currentTopic === topic ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {t(topic as any)}
                                </button>
                            ))}
                        </nav>
                        <div className="my-4 h-px bg-gray-200 dark:bg-gray-700"></div>
                        {isLoggedIn ? (
                            <div className="flex flex-col gap-1">
                                <button onClick={() => handleMobileLinkClick(() => onNavigate('settings'))} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">{t('settings')}</button>
                                <UserMenuItems />
                            </div>
                        ) : (
                            <button onClick={() => handleMobileLinkClick(() => setIsAuthModalOpen(true))} className="w-full px-4 py-2 rounded-md font-medium bg-accent-600 text-white hover:bg-accent-700">
                                {t('login')}
                            </button>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onSubscribeClick} className="w-full px-4 py-2 rounded-md font-medium border border-accent-500 text-accent-600 dark:text-accent-400 hover:bg-accent-500 hover:text-white">Subscribe</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
