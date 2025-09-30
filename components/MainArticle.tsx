import React from 'react';
import { Article } from '../types';

interface MainArticleProps {
  article: Article;
  onReadMore: () => void;
}

const MainArticle: React.FC<MainArticleProps> = ({ article, onReadMore }) => {
  if (!article) return null;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6 md:my-8 cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300"
      onClick={onReadMore}
    >
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
             <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</h3>
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri} onClick={e => e.stopPropagation()}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-sm text-gray-500 dark:text-gray-400">No sources available.</span>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainArticle;
