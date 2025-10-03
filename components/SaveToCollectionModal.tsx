import React, { useState, useEffect } from 'react';
import { Article, Collection } from '../types.ts';
import { useLibrary } from '../contexts/LibraryContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Spinner from './Spinner.tsx';

interface SaveToCollectionModalProps {
  article: Article;
  onClose: () => void;
}

const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({ article, onClose }) => {
  const { collections, addArticleToCollection, removeArticleFromCollection, createCollection, isLoading } = useLibrary();
  const { t } = useLanguage();
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleToggleArticleInCollection = (collectionId: string, articleId: string, isCurrentlyIn: boolean) => {
    if (isCurrentlyIn) {
      removeArticleFromCollection(collectionId, articleId);
    } else {
      addArticleToCollection(collectionId, article);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const newCollection = await createCollection(newCollectionName.trim());
    if (newCollection) {
        addArticleToCollection(newCollection.id, article);
    }
    setNewCollectionName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('saveToCollection')}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isLoading ? <Spinner /> : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {collections.map(collection => {
                    const isArticleIn = !!collection.articles?.some(a => a.id === article.id);
                    return (
                        <div key={collection.id} className="flex items-center justify-between">
                            <label htmlFor={`collection-${collection.id}`} className="text-gray-700 dark:text-gray-300 cursor-pointer">
                                {collection.name} ({collection.articleCount ?? 0})
                            </label>
                            <input
                                id={`collection-${collection.id}`}
                                type="checkbox"
                                checked={isArticleIn}
                                onChange={() => handleToggleArticleInCollection(collection.id, article.id, isArticleIn)}
                                className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                            />
                        </div>
                    )
                })}
            </div>
          )}

          <form onSubmit={handleCreateCollection} className="mt-4 pt-4 border-t dark:border-gray-700">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder={t('newCollection')}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
            />
            <button type="submit" disabled={!newCollectionName.trim() || isLoading} className="w-full mt-2 px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
              {t('create')} & {t('saved')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default SaveToCollectionModal;
