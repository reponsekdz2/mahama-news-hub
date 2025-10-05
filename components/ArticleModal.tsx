import React, { useEffect, useRef, useState } from 'react';
import { Article } from '../types.ts';
import ArticleActions from './ArticleActions.tsx';
import RelatedArticles from './RelatedArticles.tsx';
import CommentsSection from './CommentsSection.tsx';
import Poll from './Poll.tsx';
import { calculateReadingTime } from '../utils/readingTime.ts';
import { recordView } from '../services/articleService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSettings } from '../contexts/SettingsContext.tsx';

interface ArticleModalProps {
    article: Article;
    onClose: () => void;
    onArticleNavigate: (article: Article) => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onArticleNavigate }) => {
    const { user } = useAuth();
    const { fontSize, lineHeight } = useSettings();
    const modalBodyRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    
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

    // Reading progress bar logic
    const handleScroll = () => {
        const element = modalBodyRef.current;
        if (element) {
            const { scrollTop, scrollHeight, clientHeight } = element;
            if (scrollHeight <= clientHeight) {
                setScrollProgress(100);
                return;
            }
            const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollProgress(progress);
        }
    };


    const readingTime = calculateReadingTime(article.content);
    
    const proseClasses: Record<string, string> = {
        sm: 'prose-sm',
        base: 'prose-base',
        lg: 'prose-lg',
        normal: 'prose-normal',
        relaxed: 'prose-relaxed',
        loose: 'prose-loose'
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg">
                    <div className="h-1 bg-accent-500 rounded-t-lg" style={{ width: `${scrollProgress}%` }} />
                </div>
                <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">{article.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div ref={modalBodyRef} onScroll={handleScroll} className="flex-grow overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">{article.category}</span>
                            {article.isPremium && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    PREMIUM
                                </span>
                            )}
                        </div>
                        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{article.title}</h1>
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

                        <div 
                            className={`prose dark:prose-invert max-w-none mt-6 ${proseClasses[fontSize]} ${proseClasses[lineHeight]}`}
                            dangerouslySetInnerHTML={{ __html: article.content }} 
                        />
                        
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