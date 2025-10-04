import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import MainArticle from './components/MainArticle.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import Spinner from './components/Spinner.tsx';
import { Article, SiteSettings } from './types.ts';
import { fetchArticles, fetchRandomArticle, getArticleById } from './services/articleService.ts';
import { getSiteSettings } from './services/settingsService.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import { useLanguage, CATEGORIES } from './contexts/LanguageContext.tsx';
import { useSettings } from './contexts/SettingsContext.tsx';
import { useLibrary } from './contexts/LibraryContext.tsx';
import Footer from './components/Footer.tsx';
import ArticleModal from './components/ArticleModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import LibraryPage from './components/LibraryPage.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';
import BackToTopButton from './components/BackToTopButton.tsx';
import SearchOverlay from './components/SearchOverlay.tsx';
import AdvancedSearchBar from './components/AdvancedSearchBar.tsx';
import OfflineBanner from './components/OfflineBanner.tsx';
import { MainArticleSkeleton, ArticleCardSkeleton } from './components/Skeletons.tsx';
import SubscriptionPlanModal from './components/SubscriptionPlanModal.tsx';
import Aside from './Aside.tsx';
import TrendingArticles from './components/TrendingArticles.tsx';
import MaintenancePage from './components/MaintenancePage.tsx';


type View = 'home' | 'article' | 'admin' | 'settings' | 'library' | 'searchResults';

export interface SearchFilters {
  dateRange: 'all' | '24h' | '7d' | '30d';
  sortBy: 'newest' | 'oldest' | 'views' | 'likes';
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ dateRange: 'all', sortBy: 'newest' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  const { user, isLoggedIn, login, hasActiveSubscription } = useAuth();
  const { loadUserSettings, isPersistenceLoading } = useSettings();
  const { loadUserLanguage } = useLanguage();
  const { fetchLibrary } = useLibrary();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
        document.title = (settings.site_title as string) || 'Mahama News TV';
        const faviconLink = document.getElementById('favicon-link') as HTMLLinkElement;
        if (faviconLink && settings.site_favicon_url) {
          faviconLink.href = settings.site_favicon_url as string;
        }
      } catch (err) {
        console.error("Failed to load site settings", err);
      }
    };
    fetchSettings();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user?.token) {
      loadUserSettings(user.token);
      loadUserLanguage(user.token);
      fetchLibrary();
    }
  }, [user, login, loadUserSettings, loadUserLanguage, fetchLibrary]);
  
  const loadArticles = useCallback(async (topic: string, filters: SearchFilters, query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedArticles = await fetchArticles(query || topic, filters, user?.token);
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
      loadArticles(selectedTopic, searchFilters);
    }
  }, [selectedTopic, view, loadArticles, searchFilters]);

  const handleTopicChange = (topicKey: string) => {
    if (topicKey === 'myLibrary') {
        setView('library');
        return;
    }
     if (topicKey === 'readingHistory') {
        setSelectedTopic(topicKey);
        setView('home');
        return;
    }
    setSelectedTopic(topicKey);
    setView('home');
    window.scrollTo(0, 0);
  };
  
  const handleReadMore = (article: Article) => {
    if (article.isPremium && !hasActiveSubscription) {
      setIsSubscriptionModalOpen(true);
    } else {
      setSelectedArticle(article);
      setView('article');
      window.scrollTo(0, 0);
    }
  };

  const handleSelectTrending = async (articleId: string) => {
      try {
          const article = await getArticleById(articleId, user?.token);
          handleReadMore(article);
      } catch (err) {
          setError(err instanceof Error ? err.message : "Could not load the article.");
      }
  };

  const handleNavigate = (newView: 'admin' | 'settings') => {
    setView(newView);
    window.scrollTo(0, 0);
  };
  
  const handleSearch = (params: { query: string, filters: SearchFilters }) => {
    setSearchQuery(params.query);
    setSearchFilters(params.filters);
    setView('searchResults');
    loadArticles('Search Results', params.filters, params.query);
    setIsSearchOverlayOpen(false);
    window.scrollTo(0, 0);
  };
  
  const handleSurpriseMe = async () => {
    setIsLoading(true);
    try {
      const article = await fetchRandomArticle(user?.token);
      if(article) {
        handleReadMore(article);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not find an article for you.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToNews = () => {
    setView('home');
    setSelectedArticle(null);
     // Reset SEO tags when going back to the main view
    document.title = (siteSettings.site_title as string) || 'Mahama News TV';
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'A personalized news hub. Get the latest articles, customize your theme, and share stories with ease.');
    }
  };
  
  if (siteSettings.maintenance_mode === 'true' && user?.role !== 'admin') {
    return <MaintenancePage />;
  }

  const renderContent = () => {
    if (isPersistenceLoading) {
      return <div className="min-h-screen"><Spinner /></div>;
    }
    
    if (error) {
      return <ErrorDisplay message={error} onRetry={() => loadArticles(selectedTopic, searchFilters, view === 'searchResults' ? searchQuery : undefined)} />;
    }

    switch (view) {
      case 'article':
        return selectedArticle ? <ArticleModal article={selectedArticle} onClose={handleBackToNews} onReadAnother={handleReadMore} /> : <Spinner />;
      case 'admin':
        return <AdminPanel onNavigateBack={handleBackToNews} />;
      case 'settings':
        return <SettingsPage onNavigateBack={handleBackToNews} />;
      case 'library':
        return <LibraryPage onNavigateBack={handleBackToNews} onReadArticle={handleReadMore} />;
      case 'home':
      case 'searchResults':
        const mainArticle = articles[0];
        const otherArticles = articles.slice(1);
        const title = view === 'searchResults' ? `Results for "${searchQuery}"` : selectedTopic;
        const currentCategory = CATEGORIES.includes(selectedTopic) ? selectedTopic : mainArticle?.category;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-9">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 capitalize">{title}</h1>
                    {view === 'searchResults' && <AdvancedSearchBar filters={searchFilters} onFiltersChange={setSearchFilters} />}
                    {isLoading ? (
                    <>
                        <MainArticleSkeleton />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                        {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    </>
                    ) : articles.length > 0 ? (
                    <>
                        {mainArticle && <MainArticle article={mainArticle} onReadMore={() => handleReadMore(mainArticle)} />}
                        {otherArticles.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            {otherArticles.map(article => (
                            <ArticleCard key={article.id} article={article} onReadMore={() => handleReadMore(article)} />
                            ))}
                        </div>
                        )}
                    </>
                    ) : (
                    <p className="text-center py-12 text-gray-500 dark:text-gray-400">No articles found for this topic.</p>
                    )}
                </div>
                 <aside className="lg:col-span-3">
                    <div className="sticky top-20 space-y-8">
                        <TrendingArticles onArticleSelect={handleSelectTrending} />
                        <Aside 
                            category={currentCategory} 
                            onSubscribeClick={() => setIsSubscriptionModalOpen(true)} 
                        />
                    </div>
                </aside>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {!isOnline && <OfflineBanner />}
      <Header
        logoUrl={siteSettings.site_logo_url as string || ''}
        selectedTopic={selectedTopic}
        onTopicChange={handleTopicChange}
        onSearch={() => setIsSearchOverlayOpen(true)}
        onSurpriseMe={handleSurpriseMe}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onNavigate={handleNavigate}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
      <Footer />
      <BackToTopButton />
      
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      {isSearchOverlayOpen && <SearchOverlay onClose={() => setIsSearchOverlayOpen(false)} onSearch={handleSearch} />}
      {isSubscriptionModalOpen && <SubscriptionPlanModal onClose={() => setIsSubscriptionModalOpen(false)} />}
    </div>
  );
};

export default App;