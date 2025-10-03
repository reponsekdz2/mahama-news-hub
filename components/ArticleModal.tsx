import React from 'react';
import { Article } from '../types.ts';
import AIToolsPanel from './AIToolsPanel.tsx';
import CommentsSection from './CommentsSection.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.ts';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { isLoggedIn } = useAuth();
  const { isSpeaking, isPaused, speak, pause, cancel } = useSpeechSynthesis();

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else {
      const textToRead = `${article.title}. ${article.content.replace(/<[^>]+>/g, '')}`; // Strip HTML
      speak(textToRead);
    }
  };

  // Ensure speech is stopped when modal is closed
  React.useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">{article.title}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleSpeak} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title={isSpeaking && !isPaused ? "Pause" : "Read aloud"}>
              {isSpeaking && !isPaused ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        
        <div className="flex-grow overflow-y-auto p-6">
          <img src={article.imageUrl} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: article.content }} />
          
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
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;