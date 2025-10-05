import React, { useState, useRef } from 'react';
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
    const { t } = useLanguage();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleSearchSubmit = (params: { query: string; filters: SearchFilters }) => {
        onSearch(params);
        setIsSearchOverlayOpen(false);
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = CATEGORIES;

    return (
        <>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isSearchOverlayOpen && <SearchOverlay onClose={() => setIsSearchOverlayOpen(false)} onSearch={handleSearchSubmit} />}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                                Mahama News
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex md:space-x-4 lg:space-x-6">
                            {navLinks.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => onTopicSelect(topic)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentTopic === topic
                                            ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300'
                                            : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {t(topic as any)}
                                </button>
                            ))}
                        </nav>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setIsSearchOverlayOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('searchAriaLabel')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                            <ThemeToggle />
                            {isLoggedIn && user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <NotificationsDropdown onNavigateToArticle={() => {}} />
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2" aria-label={t('userMenu')}>
                                        <div className="w-8 h-8 rounded-full bg-accent-200 dark:bg-accent-800 flex items-center justify-center font-bold text-accent-700 dark:text-accent-300">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none">
                                            {user.role === 'admin' && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Panel</a>}
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('library'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('myLibrary')}</a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings')}</a>
                                            <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('logout')}</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700">{t('login')}</button>
                            )}
                            <div className="md:hidden">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400">
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => { onTopicSelect(topic); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {t(topic as any)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
