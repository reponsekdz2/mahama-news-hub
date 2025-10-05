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

const CustomSelect: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || '';

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-left">
                <span>{selectedLabel}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 p-1">
                    {options.map(opt => (
                        <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-3 py-2 text-sm rounded cursor-pointer ${value === opt.value ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-300' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


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
        const allItems = [...suggestions.map(s => s.title), ...recentSearches];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1 && allItems[activeIndex]) {
                handleSearch(allItems[activeIndex]);
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
                    <CustomSelect label={t('dateRange')} value={filters.dateRange} onChange={val => setFilters(f => ({...f, dateRange: val as any}))} options={[ {value: 'all', label: t('allTime')}, {value: '24h', label: t('past24Hours')}, {value: '7d', label: t('pastWeek')}, {value: '30d', label: t('pastMonth')} ]} />
                    <CustomSelect label={t('sortBy')} value={filters.sortBy} onChange={val => setFilters(f => ({...f, sortBy: val as any}))} options={[ {value: 'newest', label: t('newest')}, {value: 'oldest', label: t('oldest')}, {value: 'views', label: t('mostViews')}, {value: 'likes', label: t('mostLikes')} ]} />
                </div>

                <div className="p-4 max-h-[calc(60vh-10rem)] overflow-y-auto">
                    {isLoading && <div className="text-center py-4 text-sm text-gray-500">Searching...</div>}
                    {debouncedQuery && suggestions.length > 0 && (
                        <div className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('searchSuggestions')}</h3>
                            <ul className="mt-1">
                                {suggestions.map((s, idx) => (
                                    <li key={s.id}><button onClick={() => handleSearch(s.title)} onMouseEnter={() => setActiveIndex(idx)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeIndex === idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>{s.title}</button></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {debouncedQuery && !isLoading && suggestions.length === 0 && (<p className="text-center py-4 text-sm text-gray-500">{t('noSuggestions')}</p>)}

                    {!debouncedQuery && recentSearches.length > 0 && (
                         <div className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('recentSearches')}</h3>
                            <ul className="mt-1">
                                {recentSearches.map((s, idx) => (
                                    <li key={idx}><button onClick={() => handleSearch(s)} onMouseEnter={() => setActiveIndex(suggestions.length + idx)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeIndex === suggestions.length + idx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>{s}</button></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!debouncedQuery && trending.length > 0 && (
                        <div>
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