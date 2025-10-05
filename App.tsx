import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext.tsx';
import { useSettings } from './contexts/SettingsContext.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx';
import { useLibrary } from './contexts/LibraryContext.tsx';
import { fetchArticles, getArticleById, fetchRandomArticle } from './services/articleService.ts';
import { Article } from './types.ts';
import Header from './components/Header.tsx';
import MainArticle from './components/MainArticle.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import Footer from './components/Footer.tsx';
import Spinner from './components/Spinner.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';
import ArticleModal from './components/ArticleModal.tsx';
import { MainArticleSkeleton, ArticleCardSkeleton } from './components/Skeletons.tsx';
import BackToTopButton from './components/BackToTopButton.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LibraryPage from './components/LibraryPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import OfflineBanner from './components/OfflineBanner.tsx';
import SubscriptionPlanModal from './components/SubscriptionPlanModal.tsx';
import { getSiteSettings } from './services/settingsService.ts';
import MaintenancePage from './components/MaintenancePage.tsx';
import Aside from './components/Aside.tsx';


// This export is needed by other files
export interface SearchFilters {
  dateRange: 'all' | '24h' | '7d' | '30d';
  sortBy: 'newest' | 'oldest' | 'views' | 'likes';
}

type View = 'home' | 'search' | 'admin' | 'library' | 'settings' | 'surprise';

const App: React.FC = () => {
  // States
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentTopic, setCurrentTopic] = useState('Top Stories');
  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ dateRange: 'all', sortBy: 'newest' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>({});


  // Contexts
  const { user, isLoggedIn } = useAuth();
  const { loadUserSettings, isPersistenceLoading } = useSettings();
  const { loadUserLanguage } = useLanguage();
  const { fetchLibrary } = useLibrary();

  // Load user data on login
  useEffect(() => {
    if (isLoggedIn && user?.token) {
      loadUserSettings(user.token);
      loadUserLanguage(user.token);
      fetchLibrary();
    }
  }, [isLoggedIn, user?.token, loadUserSettings, loadUserLanguage, fetchLibrary]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Fetch site settings on initial load
  useEffect(() => {
    getSiteSettings()
        .then(setSiteSettings)
        .catch(console.error);
  }, []);

  // Main article fetching logic
  const loadArticles = useCallback(async (topic: string, filters: SearchFilters, query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedArticles = await fetchArticles(topic, filters, user?.token, query);
      setArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (view === 'home') {
      loadArticles(currentTopic, searchFilters);
    } else if (view === 'search') {
      loadArticles('all', searchFilters, searchQuery);
    }
  }, [currentTopic, searchFilters, view, searchQuery, loadArticles]);

  const handleReadArticle = async (article: Article) => {
    try {
      // Fetch the full article details to ensure content is not truncated
      const fullArticle = await getArticleById(article.id, user?.token);
      setSelectedArticle(fullArticle);
      document.body.style.overflow = 'hidden';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article details.');
    }
  };
  
  const handleReadArticleById = async (articleId: string) => {
    try {
        const fullArticle = await getArticleById(articleId, user?.token);
        setSelectedArticle(fullArticle);
        document.body.style.overflow = 'hidden';
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article details.');
    }
  };


  const handleSurpriseMe = async () => {
      setView('surprise');
      setIsLoading(true);
      setError(null);
      try {
          const article = await fetchRandomArticle(user?.token);
          if (article) {
              setSelectedArticle(article);
              document.body.style.overflow = 'hidden';
          } else {
              setError("Couldn't find an article to surprise you with!");
          }
      } catch(err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch a random article.');
      } finally {
          setIsLoading(false);
          // Set view back to home after modal is closed
          setTimeout(() => setView('home'), 100);
      }
  }

  const handleSearch = ({ query, filters }: { query: string, filters: SearchFilters }) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    setCurrentTopic('all'); // This will be ignored in favor of the query
    setView('search');
    window.scrollTo(0, 0);
  };
  
  const handleNavigate = (targetView: View) => {
      setView(targetView);
      setSearchQuery('');
      setCurrentTopic('Top Stories');
      window.scrollTo(0, 0);
  }

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    document.body.style.overflow = 'auto';
  };

  const mainArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

  if (siteSettings.maintenance_mode === 'true' && user?.role !== 'admin') {
      return <MaintenancePage />;
  }

  const renderContent = () => {
    if (view === 'admin' && user?.role === 'admin') {
      return <AdminPanel onNavigateBack={() => handleNavigate('home')} />;
    }
    if (view === 'library' && isLoggedIn) {
      return <LibraryPage onNavigateBack={() => handleNavigate('home')} onReadArticle={handleReadArticle} />;
    }
    if (view === 'settings' && isLoggedIn) {
      return <SettingsPage onNavigateBack={() => handleNavigate('home')} />;
    }

    if (error) {
      return <ErrorDisplay message={error} onRetry={() => loadArticles(currentTopic, searchFilters, searchQuery)} />;
    }

    return (
      <>
        {view === 'search' && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Search results for: <span className="text-accent-600 dark:text-accent-400">"{searchQuery}"</span>
            </h2>
          </div>
        )}

        {isLoading ? (
          <>
            <MainArticleSkeleton />
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {mainArticle ? (
              <MainArticle article={mainArticle} onReadMore={handleReadArticle} />
            ) : (
               <div className="text-center py-12">
                  <h2 className="text-xl font-semibold">No articles found.</h2>
                  <p className="mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
            {otherArticles.length > 0 && (
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {otherArticles.map(article => (
                  <ArticleCard key={article.id} article={article} onReadMore={handleReadArticle} />
                ))}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {!isOnline && <OfflineBanner />}
      <Header
        onTopicSelect={topic => {
          setCurrentTopic(topic);
          setView('home');
          setSearchQuery('');
        }}
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onSurpriseMe={handleSurpriseMe}
        onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
        currentTopic={view === 'search' ? 'search' : currentTopic}
      />
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-3">
                 {isPersistenceLoading ? <Spinner /> : renderContent()}
            </div>
            <div className="lg:col-span-1 mt-8 lg:mt-0">
                <div className="sticky top-24">
                    <Aside 
                        onArticleSelect={handleReadArticleById}
                        onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
                        onTagSelect={(tag) => handleSearch({ query: tag, filters: { dateRange: 'all', sortBy: 'newest' }})}
                        category={currentTopic}
                    />
                </div>
            </div>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={handleCloseArticle}
          onArticleNavigate={handleReadArticle}
          onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
        />
      )}
      {isSubscriptionModalOpen && <SubscriptionPlanModal onClose={() => setIsSubscriptionModalOpen(false)} />}
    </div>
  );
};

export default App;
