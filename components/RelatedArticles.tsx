import React, { useState, useEffect } from 'react';
import { Article } from '../types.ts';
import { fetchRelatedArticles } from '../services/articleService.ts';

interface RelatedArticlesProps {
    currentArticleId: string;
    category: string;
    onArticleClick: (article: Article) => void;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentArticleId, category, onArticleClick }) => {
    const [related, setRelated] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRelated = async () => {
            try {
                setIsLoading(true);
                const articles = await fetchRelatedArticles(currentArticleId);
                setRelated(articles);
            } catch (error) {
                console.error("Failed to fetch related articles", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRelated();
    }, [currentArticleId]);

    if (isLoading || related.length === 0) {
        return null; // Don't render anything if loading or no related articles
    }

    return (
        <div className="mt-12 pt-6 border-t dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Related in {category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map(article => (
                    <a href={`#`} onClick={(e) => { e.preventDefault(); onArticleClick(article); }} key={article.id} className="block group">
                        <div className="overflow-hidden rounded-lg">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <h4 className="mt-2 font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-accent-500 dark:group-hover:text-accent-400">{article.title}</h4>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default RelatedArticles;
