import React, { useEffect } from 'react';
import { Article } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import AIToolsPanel from './AIToolsPanel.tsx';
import CommentsSection from './CommentsSection.tsx';
import { recordView } from '../services/articleService.ts';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { isLoggedIn, user } = useAuth();
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    recordView(article.id, user?.token);
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article.id, user?.token]);

  // Handle click on the modal overlay to close it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col"
      >
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">{article.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <main className="overflow-y-auto p-6 flex-grow">
          <div className="uppercase tracking-wide text-sm text-accent-500 font-semibold">{article.category}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">By {article.authorName || 'Staff'}</p>
          
          {article.videoUrl ? (
            <video controls src={article.videoUrl} className="w-full h-auto object-cover my-4 rounded-md bg-black">
              Your browser does not support the video tag.
            </video>
          ) : (
            <img className="w-full h-auto object-cover my-4 rounded-md" src={article.imageUrl} alt={article.title} />
          )}

          <div 
            className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {isLoggedIn && <AIToolsPanel article={article} />}
          
          <CommentsSection articleId={article.id} />
        </main>
      </div>
    </div>
  );
};

export default ArticleModal;
