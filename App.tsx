import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import MainArticle from './components/MainArticle.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import Footer from './components/Footer.tsx';
import Spinner from './components/Spinner.tsx';
import { MainArticleSkeleton, ArticleCardSkeleton } from './components/Skeletons.tsx';
import BackToTopButton from './components/BackToTopButton.tsx';
import AuthModal from './components/AuthModal.tsx';
import ArticleModal from './components/ArticleModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx';
import { useSavedArticles } from './contexts/SavedArticlesContext.tsx';
import { useSettings } from './contexts/SettingsContext.tsx';
import { Article } from './types.ts';
import { fetchArticles } from './services/articleService.ts';
import { fetchPersonalizedNews } from './services/geminiService.ts';


const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('Top Stories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'news' | 'admin' | 'settings'>('news');
  
  const { user, isLoggedIn, login } = useAuth();
  const { t, loadUserLanguage } = useLanguage();
  const { savedArticles } = useSavedArticles();
  const { loadUserSettings } = useSettings();

  // On login, fetch user preferences
  useEffect(() => {
    if (user?.token) {
      loadUserLanguage(user.token);
      loadUserSettings(user.token);
    }
  }, [user?.token, loadUserLanguage, loadUserSettings]);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedArticles: Article[] = [];
      if (selectedTopic === 'savedArticles') {
          fetchedArticles = savedArticles;
      } else if (selectedTopic === 'forYou' && user?.token) {
          const savedTitles = savedArticles.map(a => a.title);
          fetchedArticles = await fetchPersonalizedNews(savedTitles, user.token);
      } else {
          const topicToFetch = searchQuery || selectedTopic;
          fetchedArticles = await fetchArticles(topicToFetch, user?.token);
      }
      setArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setLoading(false);
      if (view === 'news') {
        window.scrollTo(0, 0);
      }
    }
  }, [selectedTopic, searchQuery, isLoggedIn, savedArticles, user?.token, view]);

  useEffect(() => {
    if(view === 'news') {
      loadNews();
    }
  }, [view, loadNews]);

  const handleTopicChange = (topic: string) => {
    setSearchQuery('');
    setSelectedTopic(topic);
    setView('news');
  };

  const handleSearch = (query: string) => {
    setView('news');
    setSelectedTopic(query); 
    setSearchQuery(query);
  };
  
  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };
  
  const handleNavigation = (targetView: 'news' | 'admin' | 'settings') => {
      setView(targetView);
      if (targetView === 'admin') setSelectedTopic('Admin Panel');
      if (targetView === 'settings') setSelectedTopic('Settings');
      if (targetView === 'news') setSelectedTopic('Top Stories');
  }

  const mainArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.slice(1);
  
  const renderView = () => {
      switch(view) {
          case 'admin':
            return <AdminPanel onNavigateBack={() => handleNavigation('news')} />;
          case 'settings':
            return <SettingsPage onNavigateBack={() => handleNavigation('news')} />;
          case 'news':
          default:
             return (
                 <>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white my-6 md:my-8 border-b-4 border-accent-500 pb-2">
                    {searchQuery ? `${t('searchResultsFor')} "${searchQuery}"` : t(selectedTopic as any) || selectedTopic}
                    </h1>
                    {loading ? (
                    <>
                        <MainArticleSkeleton />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    </>
                    ) : error ? (
                    <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>
                    ) : (
                    <>
                        {mainArticle ? (
                        <MainArticle article={mainArticle} onReadMore={() => handleReadMore(mainArticle)} />
                        ) : (
                        <p className="text-center py-12 text-gray-500 dark:text-gray-400">{t('noArticlesFound')}</p>
                        )}

                        {otherArticles.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {otherArticles.map(article => (
                            <ArticleCard key={article.id} article={article} onReadMore={() => handleReadMore(article)} />
                            ))}
                        </div>
                        )}
                    </>
                    )}
                </>
             )
      }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 flex flex-col">
      <Header
        selectedTopic={selectedTopic}
        onTopicChange={handleTopicChange}
        onSearch={handleSearch}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onNavigate={(target) => handleNavigation(target)}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {renderView()}
      </main>

      <Footer onTopicChange={handleTopicChange} />
      <BackToTopButton />

      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
};

export default App;
