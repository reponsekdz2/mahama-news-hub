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
    const { t } = useLanguage();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const handleSearchSubmit = (params: { query: string; filters: SearchFilters }) => {
        onSearch(params);
        setIsSearchOverlayOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = CATEGORIES;
    const userInitial = user ? user.name.charAt(0).toUpperCase() : '';

    const UserMenu = () => (
      <>
        {user?.role === 'admin' && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin'); setIsUserMenuOpen(false); setIsMobileMenuOpen(false); }} className="dropdown-item">Admin Panel</a>}
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('library'); setIsUserMenuOpen(false); setIsMobileMenuOpen(false); }} className="dropdown-item">{t('myLibrary')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); setIsUserMenuOpen(false); setIsMobileMenuOpen(false); }} className="dropdown-item">{t('settings')}</a>
        <div className="dropdown-divider"></div>
        <button onClick={logout} className="dropdown-item dropdown-item-danger">{t('logout')}</button>
      </>
    );

    return (
        <>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isSearchOverlayOpen && <SearchOverlay onClose={() => setIsSearchOverlayOpen(false)} onSearch={handleSearchSubmit} />}
            <header className="header">
                {/* Top bar */}
                <div className="header-top-bar">
                    <div className="container">
                        <ThemeToggle />
                        {isLoggedIn && user ? (
                            <div className="flex items-center space-x-2">
                                <NotificationsDropdown onNavigateToArticle={(articleId) => {
                                    // This could be improved to use a context-based navigation
                                    console.log("Navigate to article", articleId);
                                }} />
                                <div className="relative" ref={userMenuRef}>
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="user-menu-button" aria-label={t('userMenu')}>
                                        <div className="user-avatar">
                                            {userInitial}
                                        </div>
                                        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="dropdown-menu">
                                            <UserMenu />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary">{t('login')}</button>
                        )}
                    </div>
                </div>

                {/* Main Header */}
                <div className="header-main">
                    <div className="container">
                        <div className="flex items-center">
                            <div className="md:hidden mr-2">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="btn-icon">
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>
                            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="header-brand">
                                Mahama News
                            </a>
                        </div>

                        {/* Right side actions */}
                        <div className="header-actions">
                             <button onClick={onSurpriseMe} className="btn-ghost hidden sm:flex items-center space-x-2" aria-label={t('surpriseMe')}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.615 6.33a.5.5 0 10-.83.54L7.85 10l-2.065 3.13a.5.5 0 00.83.54L10 10.95l2.15 3.26a.5.5 0 00.83-.54L10.916 10l2.065-3.13a.5.5 0 00-.83-.54L10 9.05 7.85 6.33z" clipRule="evenodd" /></svg>
                               <span className="text-sm font-medium">{t('surpriseMe')}</span>
                            </button>
                            <button onClick={() => setIsSearchOverlayOpen(true)} className="btn-ghost flex items-center space-x-2" aria-label={t('searchAriaLabel')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <span className="text-sm font-medium hidden md:block">{t('searchAriaLabel')}</span>
                            </button>
                             <button onClick={onSubscribeClick} className="btn btn-secondary">Subscribe</button>
                        </div>
                    </div>
                </div>

                 {/* Desktop Navigation */}
                <nav className="header-nav">
                    <div className="container">
                        {navLinks.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => onTopicSelect(topic)}
                                className={`nav-link ${currentTopic === topic ? 'active' : ''}`}
                            >
                                {t(topic as any)}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="fixed inset-0 z-40 md:hidden">
                        {/* Overlay */}
                        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
                        {/* Panel */}
                        <div className="mobile-menu-panel">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2">&times;</button>
                            <h3 className="text-xl font-bold text-accent-600 dark:text-accent-400 mb-4">Menu</h3>
                            <nav className="space-y-2 border-b dark:border-gray-700 pb-4 mb-4">
                                {navLinks.map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => { onTopicSelect(topic); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {t(topic as any)}
                                    </button>
                                ))}
                            </nav>
                             {isLoggedIn && user && (
                                <div className="space-y-2">
                                  <UserMenu />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;