import React from 'react';
import { Article } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSavedArticles } from '../contexts/SavedArticlesContext';

interface ArticleCardProps {
  article: Article;
  onReadMore: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const { savedArticles, addArticle, removeArticle } = useSavedArticles();

  const isSaved = savedArticles.some(a => a.id === article.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeArticle(article.id);
    } else {
      addArticle(article);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300"
      onClick={onReadMore}
    >
      <div className="overflow-hidden relative">
        <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.imageUrl} alt={article.title} />
        {isLoggedIn && (
          <button
            onClick={handleSaveToggle}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-colors"
            aria-label={isSaved ? 'Unsave article' : 'Save article'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <div className="uppercase tracking-wide text-xs text-accent-500 font-semibold">{article.category}</div>
          <h3 className="block mt-1 text-lg leading-tight font-semibold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{article.title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow">{article.summary}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
           <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('sources')}</h3>
           <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
             {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri} onClick={e => e.stopPropagation()}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-xs text-gray-500 dark:text-gray-400">{t('noSources')}</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
