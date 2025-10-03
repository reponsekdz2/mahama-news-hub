import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types.ts';
import AIToolsPanel from './AIToolsPanel.tsx';
import CommentsSection from './CommentsSection.tsx';
import Poll from './Poll.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.ts';
import ArticleActions from './ArticleActions.tsx';
import RelatedArticles from './RelatedArticles.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { calculateReadingTime } from '../utils/readingTime.ts';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { isSpeaking, isPaused, speak, pause, cancel } = useSpeechSynthesis();
  const contentRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [isReaderMode, setIsReaderMode] = useState(false);
  
  const readingTime = calculateReadingTime(article.content);

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else {
      const textToRead = `${article.title}. ${article.content.replace(/<[^>]+>/g, '')}`; // Strip HTML
      speak(textToRead);
    }
  };

  const handleScroll = () => {
    if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        if (scrollHeight <= clientHeight) {
            setReadProgress(100);
            return;
        }
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(progress);
    }
  };

  // Ensure speech is stopped when modal is closed
  React.useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);
  
  // Attach scroll listener
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
        contentElement.addEventListener('scroll', handleScroll);
        return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Handle escape key for closing modal or reader mode
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              if(isReaderMode) {
                  setIsReaderMode(false);
              } else {
                  onClose();
              }
          }
      }
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReaderMode, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity" onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transition-all duration-300 ${isReaderMode ? 'max-w-full h-full rounded-none' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Reading Progress Bar */}
        <div className={`w-full bg-gray-200 dark:bg-gray-700 h-1 ${isReaderMode ? 'fixed top-0' : 'rounded-t-lg'}`}>
            <div className="bg-accent-500 h-1" style={{ width: `${readProgress}%` }}></div>
        </div>

        <header className={`p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0 transition-all duration-300 ${isReaderMode ? 'opacity-0 h-0 p-0 border-none' : ''}`}>
          <div className="flex-1 truncate pr-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{article.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{readingTime} {t('minRead')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleSpeak} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title={isSpeaking && !isPaused ? "Pause" : "Read aloud"}>
              {isSpeaking && !isPaused ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </button>
            <button onClick={() => setIsReaderMode(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title={t('readerMode')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        
        <div ref={contentRef} className={`flex-grow overflow-y-auto p-6 md:p-8 transition-all duration-300 ${isReaderMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
          <img src={article.imageUrl} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          <div className={`transition-opacity duration-300 ${isReaderMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
            <ArticleActions article={article} />
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 quill-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          
          <div className={`transition-opacity duration-300 ${isReaderMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              {article.poll && <Poll initialPoll={article.poll} />}
              
              {article.tags && article.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {isLoggedIn && <AIToolsPanel article={article} />}
              
              <CommentsSection articleId={article.id} />

              <RelatedArticles currentArticleId={article.id} category={article.category} onArticleClick={() => { /* Not needed here as a full reload of modal is implied */ }} />
          </div>
        </div>

        {isReaderMode && (
          <div className="fixed inset-0 z-10 cursor-pointer" onClick={() => setIsReaderMode(false)}>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Click anywhere or press Esc to exit reader mode
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleModal;