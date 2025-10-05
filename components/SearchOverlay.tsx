import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { searchArticles } from '../services/articleService.ts';
import { getRecentSearches, logSearch } from '../services/searchService.ts';
import { fetchTrendingArticles, TrendingArticle } from '../services/analyticsService.ts';
import { Article } from '../types.ts';
import useDebounce from '../hooks/useDebounce.ts';
import { SearchFilters } from '../App.tsx';

// Add type definitions for Web Speech API to resolve TypeScript errors.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

interface SearchOverlayProps {
    onClose: () => void;
    onSearch: (params: { query: string; filters: SearchFilters }) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose, onSearch }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Pick<Article, 'id' | 'title'>[]>([]);
    const [trending, setTrending] = useState<TrendingArticle[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [filters, setFilters] = useState<SearchFilters>({ dateRange: 'all', sortBy: 'newest' });
    
    const overlayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 300);

    // Speech Recognition
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                setQuery(event.results[0][0].transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Fetch initial data and set up event listeners
    useEffect(() => {
        const fetchInitialData = async () => {
            try { await fetchTrendingArticles().then(setTrending); } catch (e) { console.error(e) }
            if (user?.token) {
                try { await getRecentSearches(user.token).then(setRecentSearches); } catch(e) { console.error(e) }
            }
        };
        fetchInitialData();
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        inputRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, user?.token]);

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        searchArticles(debouncedQuery)
            .then(setSuggestions)
            .catch(() => setSuggestions([]))
            .finally(() => setIsLoading(false));
    }, [debouncedQuery]);

    const handleSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        if (user?.token) {
            logSearch(searchTerm, user.token).catch(console.error);
            setRecentSearches(prev => [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 5));
        }
        onSearch({ query: searchTerm, filters });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allItems = [...suggestions, ...recentSearches, ...trending];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1 && allItems[activeIndex]) {
                const item = allItems[activeIndex];
                const searchTerm = typeof item === 'string' ? item : item.title;
                handleSearch(searchTerm);
            } else {
                handleSearch(query);
            }
        }
    };

    return (
        <div ref={overlayRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start p-4 pt-[10vh]" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl transform -translate-y-4 animate-fadeIn">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 group focus-within:ring-2 focus-within:ring-accent-500 rounded-t-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? t('listening') : t('searchPlaceholder')}
                        className="w-full bg-transparent text-lg text-gray-900 dark:text-white px-4 py-4 border-0 focus:ring-0"
                    />
                    <div className="flex items-center gap-2">
                        {recognitionRef.current && (
                            <button onClick={toggleListening} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title={t('voiceSearch')}>
                                <svg className={`h-6 w-6 ${isListening ? 'text-accent-500 animate-pulse' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5a6 6 0 0 0-6-6v-1.5a6 6 0 0 0-6 6v1.5m6 7.5v-7.5m0-6h.008v.008H12v-.008Z" /></svg>
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
                     <div className="w-full sm:w-1/2">
                        <label htmlFor="dateRange" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('dateRange')}</label>
                        <select id="dateRange" name="dateRange" value={filters.dateRange} onChange={(e) => setFilters(f => ({...f, dateRange: e.target.value as any}))} className="mt-1 form-select">
                            <option value="all">{t('allTime')}</option>
                            <option value="24h">{t('past24Hours')}</option>
                            <option value="7d">{t('pastWeek')}</option>
                            <option value="30d">{t('pastMonth')}</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="sortBy" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('sortBy')}</label>
                        <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value as any}))} className="mt-1 form-select">
                            <option value="newest">{t('newest')}</option>
                            <option value="oldest">{t('oldest')}</option>
                            <option value="views">{t('mostViews')}</option>
                            <option value="likes">{t('mostLikes')}</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 max-h-[calc(60vh-10rem)] overflow-y-auto">
                    {isLoading && <div className="text-center py-4 text-sm text-gray-500">Searching...</div>}
                    
                    {debouncedQuery ? (
                        <>
                            {suggestions.length > 0 && (
                                <div>
                                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('searchSuggestions')}</h3>
                                    <ul className="mt-1">
                                        {suggestions.map((s, idx) => (
                                            <li key={s.id}><button onClick={() => handleSearch(s.title)} onMouseEnter={() => setActiveIndex(idx)} className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 ${activeIndex === idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>{s.title}</button></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {suggestions.length === 0 && !isLoading && (<p className="text-center py-4 text-sm text-gray-500">{t('noSuggestions')}</p>)}
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {recentSearches.length > 0 && (
                                <div>
                                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('recentSearches')}</h3>
                                    <ul className="mt-1">
                                        {recentSearches.map((s, idx) => (
                                            <li key={idx}><button onClick={() => handleSearch(s)} onMouseEnter={() => setActiveIndex(suggestions.length + idx)} className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 ${activeIndex === suggestions.length + idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>{s}</button></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {trending.length > 0 && (
                                <div>
                                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('trendingArticles')}</h3>
                                     <ul className="mt-1">
                                        {trending.map((item, idx) => (
                                             <li key={item.id}><button onClick={() => handleSearch(item.title)} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-6.75 12.25a1 1 0 001.64.903l6.75-12.25a1 1 0 00-.618-1.502z" clipRule="evenodd" /></svg>{item.title}</button></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;