import React, { useState } from 'react';
import { useLibrary } from '../contexts/LibraryContext.tsx';
import { Article } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Spinner from './Spinner.tsx';

interface SaveToCollectionModalProps {
    article: Article;
    onClose: () => void;
}

const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({ article, onClose }) => {
    const { collections, createCollection, addArticleToCollection, isLoading } = useLibrary();
    const { t } = useLanguage();
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    const handleSave = async (collectionId: string) => {
        addArticleToCollection(collectionId, article);
        onClose();
    };

    const handleCreateAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;
        setIsCreating(true);
        const newCollection = await createCollection(newCollectionName);
        if (newCollection) {
            handleSave(newCollection.id);
        }
        setIsCreating(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t('saveToCollection')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                </header>
                <div className="p-4">
                    {isLoading ? <Spinner /> : (
                        <ul className="max-h-48 overflow-y-auto divide-y dark:divide-gray-700">
                            {collections.map(collection => (
                                <li key={collection.id}>
                                    <button onClick={() => handleSave(collection.id)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {collection.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <form onSubmit={handleCreateAndSave} className="mt-4 pt-4 border-t dark:border-gray-700">
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={e => setNewCollectionName(e.target.value)}
                            placeholder={t('newCollection')}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button type="submit" disabled={isCreating || !newCollectionName.trim()} className="w-full mt-2 bg-accent-600 text-white py-2 rounded-md hover:bg-accent-700 disabled:opacity-50">
                            {isCreating ? 'Creating...' : t('create') + ' & ' + t('saved')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SaveToCollectionModal;
