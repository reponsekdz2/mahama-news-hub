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
import AdvancedSearchBar from './components/AdvancedSearchBar.tsx';
import BackToTopButton from './components/BackToTopButton.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LibraryPage from './components/LibraryPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import OfflineBanner from './components/OfflineBanner.tsx';
import SubscriptionPlanModal from './components/SubscriptionPlanModal.tsx';
import { getSiteSettings } from './services/settingsService.ts';
import MaintenancePage from './components/MaintenancePage.tsx';


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
  const loadArticles = useCallback(async (topic: string, filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedArticles = await fetchArticles(topic, filters, user?.token);
      setArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (view === 'home' || view === 'search') {
      loadArticles(currentTopic, searchFilters);
    }
  }, [currentTopic, searchFilters, view, loadArticles]);

  const handleReadArticle = async (article: Article) => {
    try {
      // Fetch the full article details to ensure content is not truncated
      const fullArticle = await getArticleById(article.id, user?.token);
      setSelectedArticle(fullArticle);
      window.scrollTo(0, 0);
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
    setCurrentTopic('all');
    setView('search');
    window.scrollTo(0, 0);
  };
  
  const handleNavigate = (targetView: View) => {
      setView(targetView);
      setSearchQuery('');
      setCurrentTopic('Top Stories');
      window.scrollTo(0, 0);
  }

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
      return <ErrorDisplay message={error} onRetry={() => loadArticles(currentTopic, searchFilters)} />;
    }

    return (
      <>
        {view === 'search' && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Search results for: "{searchQuery}"
            </h2>
            <AdvancedSearchBar filters={searchFilters} onFiltersChange={setSearchFilters} />
          </div>
        )}

        {isLoading ? (
          <>
            <MainArticleSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {mainArticle ? (
              <MainArticle article={mainArticle} onReadMore={handleReadArticle} />
            ) : (
               <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No articles found.</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
            {otherArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
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
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
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
        currentTopic={currentTopic}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isPersistenceLoading ? <Spinner /> : renderContent()}
      </main>
      <Footer />
      <BackToTopButton />
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onArticleNavigate={handleReadArticle}
        />
      )}
      {isSubscriptionModalOpen && <SubscriptionPlanModal onClose={() => setIsSubscriptionModalOpen(false)} />}
    </div>
  );
};

export default App;
