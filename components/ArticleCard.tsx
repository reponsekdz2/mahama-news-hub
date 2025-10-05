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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group transition-shadow hover:shadow-xl">
            <button onClick={() => onReadMore(article)} className="block overflow-hidden">
                <img className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" src={article.imageUrl} alt={article.title} />
            </button>
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase">{article.category}</span>
                        {article.isPremium && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">PREMIUM</span>}
                    </div>
                    <button onClick={() => onReadMore(article)} className="block mt-2">
                        <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-400">
                            {article.title}
                        </h3>
                    </button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {article.summary}
                    </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex-grow flex flex-col justify-end">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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