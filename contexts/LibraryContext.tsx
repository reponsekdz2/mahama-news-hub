import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Article, Collection } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import * as collectionService from '../services/collectionService.ts';

interface LibraryContextType {
  collections: Collection[];
  isLoading: boolean;
  fetchLibrary: () => void;
  createCollection: (name: string) => Promise<Collection | null>;
  renameCollection: (id: string, newName: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addArticleToCollection: (collectionId: string, article: Article) => void;
  removeArticleFromCollection: (collectionId: string, articleId: string) => void;
  isArticleInLibrary: (articleId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchLibrary = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const fetchedCollections = await collectionService.getCollections(user.token);
      setCollections(fetchedCollections);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  const createCollection = async (name: string): Promise<Collection | null> => {
    if (!user?.token) return null;
    try {
      const newCollection = await collectionService.createCollection(name, user.token);
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (error) {
      console.error("Failed to create collection:", error);
      return null;
    }
  };
  
  const renameCollection = async (id: string, newName: string) => {
    if(!user?.token) return;
    try {
        await collectionService.updateCollection(id, newName, user.token);
        setCollections(prev => prev.map(c => c.id === id ? {...c, name: newName} : c));
    } catch (error) {
        console.error("Failed to rename collection:", error);
    }
  }

  const deleteCollection = async (id: string) => {
    if(!user?.token) return;
    try {
        await collectionService.deleteCollection(id, user.token);
        setCollections(prev => prev.filter(c => c.id !== id));
    } catch (error) {
        console.error("Failed to delete collection:", error);
    }
  }

  const addArticleToCollection = async (collectionId: string, article: Article) => {
    if (!user?.token) return;
    try {
        await collectionService.addArticleToCollection(collectionId, article.id, user.token);
        setCollections(prev => prev.map(c => c.id === collectionId ? {
            ...c,
            articleCount: (c.articleCount ?? 0) + 1,
            articles: [...(c.articles || []), article]
        } : c));
    } catch (error) {
        console.error("Failed to add article to collection:", error);
    }
  };

  const removeArticleFromCollection = async (collectionId: string, articleId: string) => {
    if (!user?.token) return;
    try {
        await collectionService.removeArticleFromCollection(collectionId, articleId, user.token);
        setCollections(prev => prev.map(c => c.id === collectionId ? {
            ...c,
            articleCount: Math.max(0, (c.articleCount ?? 1) - 1),
            articles: (c.articles || []).filter(a => a.id !== articleId)
        } : c));
    } catch (error) {
        console.error("Failed to remove article from collection:", error);
    }
  };
  
  const isArticleInLibrary = (articleId: string) => {
      return collections.some(c => c.articles?.some(a => a.id === articleId));
  }

  return (
    <LibraryContext.Provider value={{ 
        collections, 
        isLoading, 
        fetchLibrary,
        createCollection,
        renameCollection,
        deleteCollection,
        addArticleToCollection, 
        removeArticleFromCollection,
        isArticleInLibrary
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
