import React, { useState } from 'react';
import { useLibrary } from '../contexts/LibraryContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { Article } from '../types.ts';
import ArticleCard from './ArticleCard.tsx';
import Spinner from './Spinner.tsx';

interface LibraryPageProps {
  onNavigateBack: () => void;
  onReadArticle: (article: Article) => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ onNavigateBack, onReadArticle }) => {
  const { collections, isLoading } = useLibrary();
  const { t } = useLanguage();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (collections.length > 0 && !selectedCollectionId) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId]);

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <div className="my-6 md:my-8 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{t('myLibrary')}</h1>
        <button onClick={onNavigateBack} className="text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">
          &larr; {t('backToNews')}
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4">
            <h2 className="text-xl font-bold mb-4">Collections</h2>
            <ul className="space-y-2">
              {collections.map(collection => (
                <li key={collection.id}>
                  <button
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedCollectionId === collection.id ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {collection.name} ({collection.articleCount ?? 0})
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className="md:w-3/4">
            {selectedCollection ? (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-700">{selectedCollection.name}</h2>
                {selectedCollection.articles && selectedCollection.articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedCollection.articles.map(article => (
                      <ArticleCard key={article.id} article={article} onReadMore={() => onReadArticle(article)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-500 dark:text-gray-400">This collection is empty.</p>
                )}
              </div>
            ) : (
              <p className="text-center py-12 text-gray-500 dark:text-gray-400">Select a collection to view articles.</p>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
