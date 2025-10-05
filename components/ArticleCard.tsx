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
        <div className="card article-card group">
            <button onClick={() => onReadMore(article)} className="article-card-image-wrapper">
                <img className="article-card-image" src={article.imageUrl} alt={article.title} />
            </button>
            <div className="article-card-content">
                <div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase">{article.category}</span>
                        {article.isPremium && <span className="badge badge-premium">PREMIUM</span>}
                    </div>
                    <button onClick={() => onReadMore(article)} className="block mt-2">
                        <h3 className="article-card-title">
                            {article.title}
                        </h3>
                    </button>
                    <p className="article-card-summary">
                        {article.summary}
                    </p>
                </div>
                <div className="article-card-footer">
                    <div className="article-card-meta">
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