import React from 'react';
import { Article } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSavedArticles } from '../contexts/SavedArticlesContext';

interface MainArticleProps {
  article: Article;
  onReadMore: () => void;
}

const MainArticle: React.FC<MainArticleProps> = ({ article, onReadMore }) => {
  if (!article) return null;
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6 md:my-8 cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300 relative"
      onClick={onReadMore}
    >
      {isLoggedIn && (
        <button
          onClick={handleSaveToggle}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-colors"
          aria-label={isSaved ? 'Unsave article' : 'Save article'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
      <div className="md:flex">
        <div className="md:w-1/2 overflow-hidden">
          <img className="h-64 w-full object-cover md:h-full group-hover:scale-105 transition-transform duration-300" src={article.imageUrl} alt={article.title} />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-between md:w-1/2">
          <div>
            <div className="uppercase tracking-wide text-sm text-accent-500 font-semibold">{article.category}</div>
            <h2 className="block mt-1 text-2xl leading-tight font-bold text-black dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{article.title}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{article.summary}</p>
          </div>
          <div className="mt-6">
             <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('sources')}</h3>
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri} onClick={e => e.stopPropagation()}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-sm text-gray-500 dark:text-gray-400">{t('noSources')}</span>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainArticle;
