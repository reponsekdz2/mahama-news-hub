import React from 'react';
// Fix: Add .ts extension to module import
import { Article } from '../types.ts';
// Fix: Add .tsx extension to module import
import { useAuth } from '../contexts/AuthContext.tsx';
// Fix: Add .tsx extension to module import
import { useSavedArticles } from '../contexts/SavedArticlesContext.tsx';
// Fix: Add .ts extension to module import
import { likeArticle, unlikeArticle } from '../services/articleService.ts';

interface ArticleCardProps {
  article: Article;
  onReadMore: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  const { isLoggedIn, user } = useAuth();
  const { isArticleSaved, addArticle, removeArticle } = useSavedArticles();

  const [isLiked, setIsLiked] = React.useState(article.isLiked);
  const [likeCount, setLikeCount] = React.useState(article.likeCount);

  React.useEffect(() => {
    setIsLiked(article.isLiked);
    setLikeCount(article.likeCount);
  }, [article.isLiked, article.likeCount]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!isLoggedIn || !user?.token) return;

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (isLiked) {
        await unlikeArticle(article.id, user.token);
      } else {
        await likeArticle(article.id, user.token);
      }
    } catch (error) {
      console.error("Failed to update like status", error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    isArticleSaved(article.id) ? removeArticle(article.id) : addArticle(article);
  };
  
  const articleIsSaved = isArticleSaved(article.id);

  // Helper to strip HTML and truncate
  const createSnippet = (html: string, length: number) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  const snippet = createSnippet(article.content, 100);

  return (
    <div
      onClick={onReadMore}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      <img className="h-48 w-full object-cover" src={article.imageUrl} alt={article.title} />
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <p className="text-xs text-accent-500 font-semibold uppercase">{article.category}</p>
          <h3 className="mt-1 font-bold text-lg text-gray-900 dark:text-white leading-tight truncate">{article.title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{snippet}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex-grow flex flex-col justify-end">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            By {article.authorName || 'Staff'}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 6.957 15.425 5 12 5c-1.465 0-2.858.48-4.001 1.343L3.707 2.293zM12 15c-1.465 0-2.858-.48-4.001-1.343L6.293 15.364A10.009 10.009 0 0112 15zm-2.121-3.121A3 3 0 0112 11c1.103 0 2.084.585 2.658 1.442l-2.779 2.779A3.004 3.004 0 019.879 11.879z" clipRule="evenodd" /></svg>
                <span>{article.viewCount}</span>
              </div>
              <button
                onClick={handleLike}
                disabled={!isLoggedIn}
                className="flex items-center text-gray-500 dark:text-gray-400 text-xs space-x-1 disabled:opacity-50"
                aria-label={isLiked ? 'Unlike article' : 'Like article'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${isLiked ? 'text-accent-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{likeCount}</span>
              </button>
            </div>
            {isLoggedIn && (
              <button
                onClick={handleSave}
                className="text-gray-400 hover:text-accent-500"
                aria-label={articleIsSaved ? 'Unsave article' : 'Save article'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" className={articleIsSaved ? 'text-accent-500' : ''} />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;