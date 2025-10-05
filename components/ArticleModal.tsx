import React, { useEffect } from 'react';
import { Article } from '../types.ts';
import ArticleActions from './ArticleActions.tsx';
import RelatedArticles from './RelatedArticles.tsx';
import CommentsSection from './CommentsSection.tsx';
import Poll from './Poll.tsx';
import { calculateReadingTime } from '../utils/readingTime.ts';
import { recordView } from '../services/articleService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface ArticleModalProps {
    article: Article;
    onClose: () => void;
    onArticleNavigate: (article: Article) => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onArticleNavigate }) => {
    const { user } = useAuth();
    
    // Effect for handling the Escape key to close the modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Record a view when the modal opens
        recordView(article.id, user?.token);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, article.id, user?.token]);
    
    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const readingTime = calculateReadingTime(article.content);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel max-w-4xl h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 className="modal-title">{article.title}</h2>
                    <button onClick={onClose} className="btn-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="modal-body">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">{article.category}</span>
                            {article.isPremium && <span className="badge badge-premium">PREMIUM</span>}
                        </div>
                        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">{article.title}</h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{article.summary}</p>
                        
                        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                             <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">&bull;</span>
                            <span>{readingTime} min read</span>
                        </div>

                        <ArticleActions article={article} />

                        {article.videoUrl && (
                             <video src={article.videoUrl} controls className="w-full rounded-lg my-6" />
                        )}

                        <div className="prose dark:prose-invert max-w-none mt-6 article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
                        
                        {article.poll && <Poll initialPoll={article.poll} />}
                        
                        <CommentsSection articleId={article.id} />

                        <RelatedArticles currentArticleId={article.id} category={article.category} onArticleClick={onArticleNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;