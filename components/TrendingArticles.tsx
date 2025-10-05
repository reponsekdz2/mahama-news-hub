import React, { useState, useEffect } from 'react';
import { fetchTrendingArticles, TrendingArticle } from '../services/analyticsService.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface TrendingArticlesProps {
    onArticleSelect: (articleId: string) => void;
}

const TrendingArticles: React.FC<TrendingArticlesProps> = ({ onArticleSelect }) => {
    const [articles, setArticles] = useState<TrendingArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const trending = await fetchTrendingArticles();
                setArticles(trending);
            } catch (error) {
                console.error("Failed to load trending articles:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTrending();
    }, []);

    const renderSkeletons = () => (
        <ul className="mt-4 space-y-4">
            {[...Array(5)].map((_, i) => (
                <li key={i} className="animate-pulse flex items-start">
                    <div className="bg-gray-300 dark:bg-gray-700 h-6 w-6 rounded-sm flex-shrink-0"></div>
                    <div className="ml-3 w-full">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mt-2"></div>
                    </div>
                </li>
            ))}
        </ul>
    );

    if (isLoading) {
        return (
            <div>
                 <h3 className="pb-3 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('trendingArticles')}</h3>
                 {renderSkeletons()}
            </div>
        )
    }
    
    if (articles.length === 0) return null;

    return (
        <div>
            <h3 className="pb-3 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('trendingArticles')}</h3>
            <ul className="mt-4 space-y-4">
                {articles.map((article, index) => (
                    <li key={article.id} className="flex items-start gap-4 group">
                        <span className="text-2xl font-extrabold text-gray-300 dark:text-gray-600 group-hover:text-accent-400 transition-colors">{index + 1}</span>
                        <div>
                           <button onClick={() => onArticleSelect(article.id)} className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 text-left leading-snug transition-colors">
                             {article.title}
                           </button>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.views.toLocaleString()} views</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrendingArticles;