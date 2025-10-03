import React, { useState } from 'react';
import { Article } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLibrary } from '../contexts/LibraryContext.tsx';
import { likeArticle, unlikeArticle } from '../services/articleService.ts';
import SaveToCollectionModal from './SaveToCollectionModal.tsx';
import { calculateReadingTime } from '../utils/readingTime.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ArticleCardProps {
  article: Article;
  onReadMore: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  const { isLoggedIn, user } = useAuth();
  const { t } = useLanguage();
  const { isArticleInLibrary } = useLibrary();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const [isLiked, setIsLiked] = React.useState(article.isLiked);
  const [likeCount, setLikeCount] = React.useState(article.likeCount);

  React.useEffect(() => {
    setIsLiked(article.isLiked);
    setLikeCount(article.likeCount);
  }, [article.isLiked, article.likeCount]);
  
  const articleIsInLibrary = isArticleInLibrary(article.id);
  const readingTime = calculateReadingTime(article.content);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!isLoggedIn || !user?.token) return;

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (originalIsLiked) {
        await unlikeArticle(article.id, user.token);
      } else {
        await likeArticle(article.id, user.token);
      }
    } catch (error) {
      console.error("Failed to update like status", error);
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    }
  };
  
  const handleSaveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCollectionModalOpen(true);
  }

  const createSnippet = (html: string, length: number) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  const snippet = createSnippet(article.content, 100);

  return (
    <>
      {isCollectionModalOpen && <SaveToCollectionModal article={article} onClose={() => setIsCollectionModalOpen(false)} />}
      <div
        onClick={onReadMore}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-2xl group"
      >
        {/* Image container */}
        <div className="relative">
          <img className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110" src={article.imageUrl} alt={article.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            {isLoggedIn && (
                <button
                    onClick={handleSaveClick}
                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
                    aria-label={articleIsInLibrary ? 'Manage collections for this article' : 'Save article'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" className={articleIsInLibrary ? 'text-accent-400' : ''} />
                    </svg>
                </button>
            )}
             <button
                onClick={handleLike}
                disabled={!isLoggedIn}
                className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors disabled:opacity-60"
                aria-label={isLiked ? 'Unlike article' : 'Like article'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isLiked ? 'text-accent-400' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-4">
              <p className="text-xs text-white bg-accent-500 font-semibold uppercase px-2 py-1 rounded-md inline-block">{article.category}</p>
              <h3 className="mt-2 font-bold text-lg text-white leading-tight drop-shadow-md">{article.title}</h3>
          </div>
        </div>
        
        {/* Content container */}
        <div className="p-4 flex flex-col flex-grow">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{snippet}</p>
             {article.tags && article.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex-grow flex flex-col justify-end">
            <div className="flex justify-between items-center">
               <div className="text-xs text-gray-500 dark:text-gray-400">
                  By <strong>{article.authorName || 'Staff'}</strong> &middot; {readingTime} {t('minRead')}
                </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  <span>{article.viewCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  <span>{likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleCard;
