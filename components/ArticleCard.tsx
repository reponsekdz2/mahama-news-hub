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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-accent-500">
            <button onClick={() => onReadMore(article)} className="block overflow-hidden relative">
                <img className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" src={article.imageUrl} alt={article.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </button>
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase">{article.category}</span>
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
                <div className="mt-auto pt-4">
                     {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {article.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                        </div>
                    )}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            <span>{article.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                             <span>{readingTime} min read</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
