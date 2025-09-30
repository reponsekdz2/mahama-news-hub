import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onReadMore: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300"
      onClick={onReadMore}
    >
      <div className="overflow-hidden">
        <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.imageUrl} alt={article.title} />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <div className="uppercase tracking-wide text-xs text-accent-500 font-semibold">{article.category}</div>
          <h3 className="block mt-1 text-lg leading-tight font-semibold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{article.title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow">{article.summary}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
           <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</h3>
           <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
             {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri} onClick={e => e.stopPropagation()}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-xs text-gray-500 dark:text-gray-400">No sources available.</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
