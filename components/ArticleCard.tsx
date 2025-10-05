import React from 'react';
import { Article } from '../types.ts';
import { calculateReadingTime } from '../utils/readingTime.ts';

interface ArticleCardProps {
    article: Article;
    onReadMore: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
    const readingTime = calculateReadingTime(article.summary);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-lg">
            <button onClick={() => onReadMore(article)} className="block w-full">
                <img className="h-48 w-full object-cover" src={article.imageUrl} alt={article.title} />
            </button>
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase">{article.category}</span>
                        {article.isPremium && <span className="text-xs font-bold text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">PREMIUM</span>}
                    </div>
                    <button onClick={() => onReadMore(article)} className="block mt-2">
                        <h3 className="text-lg leading-tight font-bold text-gray-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 text-left">
                            {article.title}
                        </h3>
                    </button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 article-summary-clamp-sm">
                        {article.summary}
                    </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex-grow flex flex-col justify-end">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{article.authorName}</span>
                        <span className="mx-2">&bull;</span>
                        <span>{readingTime} min read</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
