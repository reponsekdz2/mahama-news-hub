import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MainArticle from './components/MainArticle';
import ArticleCard from './components/ArticleCard';
import Footer from './components/Footer';
import { MainArticleSkeleton, ArticleCardSkeleton } from './components/Skeletons';
import BackToTopButton from './components/BackToTopButton';
import SettingsModal from './components/SettingsModal';
import ArticleModal from './components/ArticleModal';
import { Article } from './types';
import { fetchNews } from './services/geminiService';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topic, setTopic] = useState('Top Stories');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const loadNews = useCallback(async (currentTopic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedArticles = await fetchNews(currentTopic);
      setArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(topic);
  }, [topic, loadNews]);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
  };
  
  const handleSearch = (query: string) => {
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
          <h2 className="text-2xl font-bold text-accent-600">Oops! Something went wrong.</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
          <button
            onClick={() => loadNews(topic)}
            className="mt-6 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg my-8 fade-in">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">No articles found.</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try selecting a different category or searching for a topic.</p>
        </div>
      );
    }

    return (
      <div className="fade-in">
        {mainArticle && <MainArticle article={mainArticle} onReadMore={() => setSelectedArticle(mainArticle)} />}
        {otherArticles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {otherArticles.map((article) => (
              <ArticleCard key={article.title} article={article} onReadMore={() => setSelectedArticle(article)} />
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
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />
      <BackToTopButton />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
};

export default App;
