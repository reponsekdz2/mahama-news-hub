import React, { useState, useRef, useEffect } from 'react';
import { Article } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLibrary } from '../contexts/LibraryContext.tsx';
import { likeArticle, unlikeArticle, trackShare } from '../services/articleService.ts';
import * as offlineService from '../services/offlineArticleService.ts';
import SaveToCollectionModal from './SaveToCollectionModal.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ArticleActionsProps {
    article: Article;
}

const ArticleActions: React.FC<ArticleActionsProps> = ({ article }) => {
    const { isLoggedIn, user, hasActiveSubscription } = useAuth();
    const { t } = useLanguage();
    const { isArticleInLibrary } = useLibrary();
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    
    const [isLiked, setIsLiked] = useState(article.isLiked);
    const [likeCount, setLikeCount] = useState(article.likeCount);
    const [copySuccess, setCopySuccess] = useState('');
    const [isOffline, setIsOffline] = useState(false);

    const [isShareOpen, setIsShareOpen] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLiked(article.isLiked);
        setLikeCount(article.likeCount);
        if (hasActiveSubscription) {
            offlineService.isArticleOffline(article.id).then(setIsOffline);
        }
    }, [article.isLiked, article.likeCount, article.id, hasActiveSubscription]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setIsShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const articleIsInLibrary = isArticleInLibrary(article.id);

    const handleLike = async () => {
        if (!isLoggedIn || !user?.token) return;
        const originalIsLiked = isLiked;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            originalIsLiked ? await unlikeArticle(article.id, user.token) : await likeArticle(article.id, user.token);
        } catch (error) {
            console.error("Failed to update like status", error);
            setIsLiked(originalIsLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };
    
    const handleOfflineToggle = async () => {
        if (!hasActiveSubscription) return; // Should be disabled, but double-check
        if (isOffline) {
            await offlineService.removeArticleFromOffline(article.id);
            setIsOffline(false);
        } else {
            await offlineService.saveArticleForOffline(article);
            setIsOffline(true);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: `Check out this article from Mahama News TV: ${article.summary}`,
                    url: window.location.href,
                });
                if (user?.token) trackShare(article.id, 'native_share', user.token);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for desktop browsers
            setIsShareOpen(true);
        }
    };

    const handleLegacyShare = (platform: string) => {
        if(user?.token) {
            trackShare(article.id, platform, user.token);
        }
        setIsShareOpen(false);
    };

    const copyToClipboard = () => {
        const url = window.location.href; 
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed');
        });
        handleLegacyShare('copy_link');
    };

    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(article.title);

    return (
        <>
            {isCollectionModalOpen && <SaveToCollectionModal article={article} onClose={() => setIsCollectionModalOpen(false)} />}
            <div className="my-6 py-4 border-y dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>By <strong>{article.authorName}</strong></span>
                    <div className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> {article.viewCount}</div>
                    <span>{likeCount} Likes</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleLike} disabled={!isLoggedIn} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Like article">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isLiked ? 'text-accent-500' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="relative group">
                        <button 
                            onClick={handleOfflineToggle} 
                            disabled={!isLoggedIn || !hasActiveSubscription} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                            aria-label={isOffline ? t('removeFromOffline') : t('savedForOffline')}
                        >
                            {isOffline ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            )}
                        </button>
                        {(!isLoggedIn || !hasActiveSubscription) && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {t('offlineRequiresSubscription')}
                            </div>
                        )}
                    </div>
                    {isLoggedIn && (
                        <button onClick={() => setIsCollectionModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Save to collection">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" className={articleIsInLibrary ? 'text-accent-500' : ''}/></svg>
                        </button>
                    )}
                    <div className="relative" ref={shareRef}>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label={t('shareArticle')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        </button>
                        {isShareOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-max bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
                                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} onClick={() => handleLegacyShare('twitter')} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label="Share on Twitter">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} onClick={() => handleLegacyShare('facebook')} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label="Share on Facebook">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                                </a>
                                <button onClick={copyToClipboard} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 relative" aria-label="Copy link">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    {copySuccess && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">{copySuccess}</span>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleActions;