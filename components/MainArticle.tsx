import React from 'react';
import { Article } from '../types.ts';
import { calculateReadingTime } from '../utils/readingTime.ts';

interface MainArticleProps {
    article: Article;
    onReadMore: (article: Article) => void;
}

const MainArticle: React.FC<MainArticleProps> = ({ article, onReadMore }) => {
    const readingTime = calculateReadingTime(article.content || article.summary);

    return (
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6 md:my-8 transition-shadow hover:shadow-xl">
            <div className="md:flex">
                <div className="md:w-1/2">
                    <img
                        className="h-64 w-full object-cover md:h-full"
                        src={article.imageUrl}
                        alt={article.title}
                    />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-between md:w-1/2">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">{article.category}</span>
                            {article.isPremium && <span className="text-xs font-bold text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">PREMIUM</span>}
                        </div>
                        <h2 className="mt-2 block text-2xl md:text-3xl lg:text-4xl leading-tight font-extrabold text-gray-900 dark:text-white">
                            {article.title}
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed article-summary-clamp">
                            {article.summary}
                        </p>
                    </div>
                    <div className="mt-6">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>{article.authorName}</span>
                            <span className="mx-2">&bull;</span>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">&bull;</span>
                            <span>{readingTime} min read</span>
                        </div>
                        <button
                            onClick={() => onReadMore(article)}
                            className="mt-4 inline-block text-lg font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-200"
                        >
                            Read More &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default MainArticle;
