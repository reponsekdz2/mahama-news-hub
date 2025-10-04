import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { searchArticles } from '../services/articleService.ts';
import { fetchTrendingArticles, TrendingArticle } from '../services/analyticsService.ts';
import { Article } from '../types.ts';
import useDebounce from '../hooks/useDebounce.ts';
import Spinner from './Spinner.tsx';
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
            // Instantiate SpeechRecognition from the window object.
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
            try {
                const trendingData = await fetchTrendingArticles();
                setTrending(trendingData);
            } catch (error) { console.error(error); }

            const storedRecent = localStorage.getItem('recentSearches');
            if (storedRecent) {
                setRecentSearches(JSON.parse(storedRecent));
            }
        };
        fetchInitialData();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        inputRef.current?.focus();

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const results = await searchArticles(debouncedQuery);
                setSuggestions(results);
            } catch (error) {
                console.error(error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestions();
    }, [debouncedQuery]);

    const handleSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        
        const updatedRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updatedRecent);
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
        
        onSearch({ query: searchTerm, filters });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allItems = [...suggestions, ...recentSearches];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1 && allItems[activeIndex]) {
                const itemToSearch = suggestions[activeIndex] ? suggestions[activeIndex].title : recentSearches[activeIndex - suggestions.length];
                handleSearch(itemToSearch);
            } else {
                handleSearch(query);
            }
        }
    };
    
     const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    }

    const combinedList = [
        ...suggestions.map(s => ({ type: 'suggestion', value: s.title })),
        ...recentSearches.map(s => ({ type: 'recent', value: s }))
    ];

    return (
        <div ref={overlayRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start p-4 pt-[10vh]" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-fadeIn">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? t('listening') : t('searchPlaceholder')}
                        className="w-full bg-transparent text-lg text-gray-800 dark:text-gray-200 pl-12 pr-20 py-4 focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        {recognitionRef.current && (
                            <button onClick={toggleListening} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title={t('voiceSearch')}>
                                <svg className={`h-6 w-6 ${isListening ? 'text-accent-500 animate-pulse' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v4" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 23h8" />
                                </svg>
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="p-4 border-y border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="dateRange-overlay" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('dateRange')}</label>
                        <select
                            id="dateRange-overlay"
                            name="dateRange"
                            value={filters.dateRange}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                        >
                            <option value="all">{t('allTime')}</option>
                            <option value="24h">{t('past24Hours')}</option>
                            <option value="7d">{t('pastWeek')}</option>
                            <option value="30d">{t('pastMonth')}</option>
                        </select>
                    </div>
                     <div className="w-full sm:w-1/2">
                        <label htmlFor="sortBy-overlay" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('sortBy')}</label>
                        <select
                            id="sortBy-overlay"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                        >
                            <option value="newest">{t('newest')}</option>
                            <option value="oldest">{t('oldest')}</option>
                            <option value="views">{t('mostViews')}</option>
                            <option value="likes">{t('mostLikes')}</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    {isLoading && <div className="text-center py-4 text-sm text-gray-500">Searching...</div>}
                    {debouncedQuery && suggestions.length > 0 && (
                        <div className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('searchSuggestions')}</h3>
                            <ul className="mt-2">
                                {suggestions.map((s, idx) => (
                                    <li key={s.id} onClick={() => handleSearch(s.title)} onMouseEnter={() => setActiveIndex(idx)} className={`p-2 rounded-md cursor-pointer ${activeIndex === idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>{s.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {debouncedQuery && !isLoading && suggestions.length === 0 && (
                        <p className="text-center py-4 text-sm text-gray-500">{t('noSuggestions')}</p>
                    )}

                    {!debouncedQuery && recentSearches.length > 0 && (
                         <div className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('recentSearches')}</h3>
                            <ul className="mt-2">
                                {recentSearches.map((s, idx) => (
                                    <li key={idx} onClick={() => handleSearch(s)} onMouseEnter={() => setActiveIndex(suggestions.length + idx)} className={`p-2 rounded-md cursor-pointer ${activeIndex === suggestions.length + idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!debouncedQuery && trending.length > 0 && (
                        <div className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('trendingArticles')}</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {trending.map(item => (
                                    <button key={item.id} onClick={() => handleSearch(item.title)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                        {item.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;