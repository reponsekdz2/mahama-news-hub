import React from 'react';
import { Article } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { likeArticle, unlikeArticle } from '../services/articleService.ts';
import { useSavedArticles } from '../contexts/SavedArticlesContext.tsx';

interface MainArticleProps {
  article: Article;
  onReadMore: () => void;
}

const MainArticle: React.FC<MainArticleProps> = ({ article, onReadMore }) => {
  const { isLoggedIn, user } = useAuth();
  const { isArticleSaved, addArticle, removeArticle } = useSavedArticles();
  
  const [isLiked, setIsLiked] = React.useState(article.isLiked);
  const [likeCount, setLikeCount] = React.useState(article.likeCount);

  React.useEffect(() => {
    setIsLiked(article.isLiked);
    setLikeCount(article.likeCount);
  }, [article.isLiked, article.likeCount]);

  const handleLike = async () => {
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
  
  const handleSave = () => {
      isArticleSaved(article.id) ? removeArticle(article.id) : addArticle(article);
  }

  const articleIsSaved = isArticleSaved(article.id);

  const createSnippet = (html: string, length: number) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  const snippet = createSnippet(article.content, 200);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6 md:my-8">
      <div className="md:flex">
        <div className="md:w-1/2">
          {article.videoUrl ? (
            <video controls src={article.videoUrl} className="w-full h-full object-cover">
              Your browser does not support the video tag.
            </video>
          ) : (
            <img className="h-64 w-full object-cover md:h-full" src={article.imageUrl} alt={article.title} />
          )}
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-between md:w-1/2">
          <div>
            <div className="uppercase tracking-wide text-sm text-accent-500 font-semibold">{article.category}</div>
            <h1 className="block mt-1 text-2xl leading-tight font-bold text-black dark:text-white hover:underline">{article.title}</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">{snippet}</p>
          </div>
          <div className="mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                By {article.authorName || 'Staff'}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={onReadMore}
                className="text-accent-500 dark:text-accent-400 hover:text-accent-600 dark:hover:text-accent-300 font-bold py-2 rounded"
              >
                Read more &rarr;
              </button>
              <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      <span>{article.viewCount}</span>
                  </div>
                   <button
                        onClick={handleLike}
                        disabled={!isLoggedIn}
                        className="flex items-center text-gray-500 dark:text-gray-400 text-sm space-x-1 disabled:opacity-50"
                        aria-label={isLiked ? 'Unlike article' : 'Like article'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isLiked ? 'text-accent-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>{likeCount}</span>
                    </button>
                  {isLoggedIn && (
                     <button
                        onClick={handleSave}
                        className="text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400"
                        aria-label={articleIsSaved ? 'Unsave article' : 'Save article'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" className={articleIsSaved ? 'text-accent-500' : 'text-gray-400'} />
                        </svg>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainArticle;
