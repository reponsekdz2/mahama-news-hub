import React from 'react';
import { Article } from '../types';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;
  
  const shareUrl = article.sources.length > 0 ? article.sources[0].uri : window.location.href;
  const shareText = encodeURIComponent(`Check out this article: ${article.title}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img className="h-64 w-full object-cover rounded-t-lg" src={article.imageUrl} alt={article.title} />
          <button onClick={onClose} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <span className="uppercase tracking-wide text-sm text-accent-500 font-semibold">{article.category}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{article.title}</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{article.summary}</p>
          
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</h3>
             <div className="flex flex-col space-y-2 mt-2">
              {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-sm text-gray-500 dark:text-gray-400">No sources available.</span>}
             </div>
          </div>

          <div className="mt-6 border-t pt-4 dark:border-gray-700 flex items-center justify-end space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Share:</span>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z"></path></svg>
            </a>
            <button onClick={handleCopyLink} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
