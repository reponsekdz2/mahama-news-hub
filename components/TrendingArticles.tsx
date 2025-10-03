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

    if (isLoading || articles.length === 0) {
        // Render a placeholder or nothing while loading
        return (
            <div>
                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{t('trendingArticles')}</h3>
                 <ul className="mt-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <li key={i} className="animate-pulse flex items-start">
                            <div className="bg-gray-300 dark:bg-gray-700 h-6 w-6 rounded-sm"></div>
                            <div className="ml-2 w-full">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mt-2"></div>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{t('trendingArticles')}</h3>
            <ul className="mt-4 space-y-3">
                {articles.map((article, index) => (
                    <li key={article.id} className="flex items-start">
                        <span className="text-xl font-bold text-accent-500/50 dark:text-accent-400/50 w-8 flex-shrink-0">{index + 1}</span>
                        <div>
                           <button onClick={() => onArticleSelect(article.id)} className="text-base text-left text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline">
                             {article.title}
                           </button>
                           <p className="text-xs text-gray-400 dark:text-gray-500">{article.views.toLocaleString()} views</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrendingArticles;
