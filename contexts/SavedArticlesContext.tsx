import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article } from '../types';
import { useAuth } from './AuthContext';

interface SavedArticlesContextType {
  savedArticles: Article[];
  addArticle: (article: Article) => void;
  removeArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

const getStoredArticles = (): Article[] => {
    if (typeof window === 'undefined') return [];
    try {
        const item = window.localStorage.getItem('savedArticles');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.warn('Error reading saved articles from localStorage:', String(error));
        return [];
    }
};

export const SavedArticlesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedArticles, setSavedArticles] = useState<Article[]>(getStoredArticles);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  // Clear saved articles on logout
  useEffect(() => {
    if (!isLoggedIn) {
      setSavedArticles([]);
    }
  }, [isLoggedIn]);

  const addArticle = (article: Article) => {
    setSavedArticles(prev => [...prev, article]);
  };

  const removeArticle = (articleId: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some(a => a.id === articleId);
  };

  return (
    <SavedArticlesContext.Provider value={{ savedArticles, addArticle, removeArticle, isArticleSaved }}>
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error('useSavedArticles must be used within a SavedArticlesProvider');
  }
  return context;
};
