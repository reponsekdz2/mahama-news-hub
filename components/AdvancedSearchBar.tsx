import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { SearchFilters } from '../App.tsx';

interface AdvancedSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ filters, onFiltersChange }) => {
    const { t } = useLanguage();

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({
            ...filters,
            [e.target.name]: e.target.value
        });
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4 border dark:border-gray-700">
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 hidden md:block">{t('advancedSearch')}:</h3>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                    <label htmlFor="dateRange" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('dateRange')}</label>
                    <select
                        id="dateRange"
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
                 <div>
                    <label htmlFor="sortBy" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('sortBy')}</label>
                    <select
                        id="sortBy"
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
        </div>
    );
};

export default AdvancedSearchBar;