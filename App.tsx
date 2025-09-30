import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MainArticle from './components/MainArticle';
import ArticleCard from './components/ArticleCard';
import Footer from './components/Footer';
import { MainArticleSkeleton, ArticleCardSkeleton } from './components/Skeletons';
import BackToTopButton from './components/BackToTopButton';
import SettingsModal from './components/SettingsModal';
import ArticleModal from './components/ArticleModal';
import AuthModal from './components/AuthModal';
import { Article } from './types';
import { fetchNews, fetchPersonalizedNews } from './services/geminiService';
import { useLanguage, CATEGORIES } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { useSavedArticles } from './contexts/SavedArticlesContext';

const App: React.FC = () => {
  const { t, languageName } = useLanguage();
  const { isLoggedIn } = useAuth();
  const { savedArticles } = useSavedArticles();

  const [articles, setArticles] = useState<Article[]>([]);
  const [topic, setTopic] = useState(t('topStories'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [categoryKey, setCategoryKey] = useState('topStories');

  const translatedCategories = CATEGORIES.map(key => t(key as any));

  const loadNews = useCallback(async (currentTopicKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedArticles: Article[] = [];
      const currentTopic = t(currentTopicKey as any);

      if (currentTopicKey === 'forYou') {
        const savedTitles = savedArticles.map(a => a.title);
        fetchedArticles = await fetchPersonalizedNews(savedTitles, languageName);
      } else if (currentTopicKey === 'savedArticles') {
        fetchedArticles = savedArticles;
      } else {
        fetchedArticles = await fetchNews(currentTopic, languageName, translatedCategories);
      }
      setArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [languageName, translatedCategories, t, savedArticles]);

  useEffect(() => {
    // If user logs out and is on a logged-in-only page, redirect to top stories
    if (!isLoggedIn && (categoryKey === 'forYou' || categoryKey === 'savedArticles')) {
        setCategoryKey('topStories');
    } else {
        loadNews(categoryKey);
    }
  }, [categoryKey, loadNews, isLoggedIn]);

  // Refetch news when language changes, maintaining the current category
  useEffect(() => {
      const currentTranslatedTopic = t(categoryKey as any);
      setTopic(currentTranslatedTopic);
      loadNews(categoryKey);
  }, [languageName, t, loadNews, categoryKey]);

  const handleTopicChange = (newTopicKey: string) => {
    setCategoryKey(newTopicKey);
    const newTopic = t(newTopicKey as any);
    setTopic(newTopic);
  };
  
  const handleSearch = (query: string) => {
    setCategoryKey(query);
    setTopic(query);
  };

  const mainArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="fade-in">
          <MainArticleSkeleton />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {[...Array(4)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-red-50 dark:bg-gray-800 rounded-lg my-8 fade-in">
          <h2 className="text-2xl font-bold text-accent-600">{t('oops')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
          <button
            onClick={() => loadNews(categoryKey)}
            className="mt-6 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            {t('tryAgain')}
          </button>
        </div>
      );
    }

    if (articles.length === 0) {
        const message = categoryKey === 'savedArticles' ? t('noSavedArticles') : t('noArticles');
        const hint = categoryKey === 'savedArticles' ? t('noSavedArticlesHint') : t('noArticlesHint');
      return (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg my-8 fade-in">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{message}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{hint}</p>
        </div>
      );
    }

    return (
      <div className="fade-in">
        {mainArticle && <MainArticle article={mainArticle} onReadMore={() => setSelectedArticle(mainArticle)} />}
        {otherArticles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {otherArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onReadMore={() => setSelectedArticle(article)} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        selectedTopic={topic} 
        onTopicChange={handleTopicChange} 
        onSearch={handleSearch} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mt-6 md:mt-8 capitalize">{topic}</h1>
        {renderContent()}
      </main>
      <Footer />
      <BackToTopButton />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default App;
