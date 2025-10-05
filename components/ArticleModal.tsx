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
import { summarizeContent } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';

interface ArticleModalProps {
    article: Article;
    onClose: () => void;
    onArticleNavigate: (article: Article) => void;
    onSubscribeClick: () => void;
}

const PremiumContentPrompt: React.FC<{ onSubscribeClick: () => void, summary: string }> = ({ onSubscribeClick, summary }) => (
    <div className="text-center p-8 my-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border dark:border-gray-700">
        <h3 className="text-2xl font-bold text-yellow-500">Premium Article</h3>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{summary}</p>
        <p className="mt-4 text-gray-600 dark:text-gray-400">This is a premium article. Subscribe to read the full content and get access to all exclusive stories.</p>
        <button onClick={onSubscribeClick} className="mt-6 px-8 py-3 bg-accent-600 text-white font-semibold rounded-lg shadow-md hover:bg-accent-700 transition-transform hover:scale-105">
            Subscribe to Read
        </button>
    </div>
);

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onArticleNavigate, onSubscribeClick }) => {
    const { user } = useAuth();
    const { fontSize, lineHeight } = useSettings();
    const modalBodyRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState('');
    
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

    const handleSummarize = async () => {
        if (!user?.token) return;
        setIsSummarizing(true);
        setSummaryError('');
        setAiSummary('');
        try {
            const result = await summarizeContent(article.content, user.token);
            setAiSummary(result.summary);
        } catch (err) {
            setSummaryError(err instanceof Error ? err.message : "Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

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
    
    const isPaywalled = article.content.includes('class="paywall-blocker"');

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

                        <ArticleActions article={article} onSummarize={handleSummarize} isSummarizing={isSummarizing} />

                        {isSummarizing && <Spinner />}
                        {summaryError && <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">{summaryError}</p>}
                        {aiSummary && (
                            <div className="my-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 relative">
                                <h3 className="text-lg font-bold text-accent-600 dark:text-accent-400 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V3a1 1 0 00-1-1H5zM3 8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zM5 14a1 1 0 00-1 1v1.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V15a1 1 0 00-1-1H5zM8.5 2a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1zM10 3.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zM8.5 14a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1zM14 15a1 1 0 100-2 1 1 0 000 2zm-1.5-5.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z" clipRule="evenodd" /></svg>
                                    AI Summary
                                </h3>
                                <button onClick={() => setAiSummary('')} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    &times;
                                </button>
                                <div className="prose prose-sm dark:prose-invert max-w-none mt-2" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />
                            </div>
                        )}

                        {article.videoUrl && (
                             <video src={article.videoUrl} controls className="w-full rounded-lg my-6" />
                        )}

                        {isPaywalled ? (
                            <PremiumContentPrompt onSubscribeClick={onSubscribeClick} summary={article.summary} />
                        ) : (
                            <div 
                                className={`prose dark:prose-invert max-w-none mt-6 ${proseClasses[fontSize]} ${proseClasses[lineHeight]}`}
                                dangerouslySetInnerHTML={{ __html: article.content }} 
                            />
                        )}
                        
                        {!isPaywalled && article.poll && <Poll initialPoll={article.poll} />}
                        
                        {!isPaywalled && <CommentsSection articleId={article.id} />}

                        <RelatedArticles currentArticleId={article.id} category={article.category} onArticleClick={onArticleNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;