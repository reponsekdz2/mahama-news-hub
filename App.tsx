import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import AdBanner from './components/AdBanner.tsx';
import LibraryPage from './components/LibraryPage.tsx';
import AdvancedSearchBar from './components/AdvancedSearchBar.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';
import SearchOverlay from './components/SearchOverlay.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx';
import { useLibrary } from './contexts/LibraryContext.tsx';
import { useSettings } from './contexts/SettingsContext.tsx';
import { Article, Advertisement } from './types.ts';
import { fetchArticlesWithAds, getArticleById, fetchRandomArticle } from './services/articleService.ts';
import { fetchPersonalizedNews } from './services/geminiService.ts';
import { fetchReadingHistory } from './services/userService.ts';

type FeedItem = Article | (Advertisement & { isAd: true });
type View = 'news' | 'admin' | 'settings' | 'library';
export type SearchFilters = {
    dateRange: 'all' | '24h' | '7d' | '30d';
    sortBy: 'newest' | 'oldest' | 'views' | 'likes';
}

const App: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('Top Stories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<View>('news');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ dateRange: 'all', sortBy: 'newest' });
  
  const { user, isLoggedIn } = useAuth();
  const { t, loadUserLanguage } = useLanguage();
  const { fetchLibrary, collections } = useLibrary();
  const { loadUserSettings } = useSettings();

  const viewedAds = useRef(new Set<string>());

  useEffect(() => {
    if (user?.token) {
      loadUserLanguage(user.token);
      loadUserSettings(user.token);
      fetchLibrary();
    }
  }, [user?.token, loadUserLanguage, loadUserSettings, fetchLibrary]);

  const loadNews = useCallback(async () => {
    if (['myLibrary'].includes(selectedTopic)) {
      setView('library');
      return;
    }
    
    setLoading(true);
    setError(null);
    viewedAds.current.clear();
    
    try {
      let fetchedArticles: Article[] = [];
      let fetchedAds: Advertisement[] = [];

      if (selectedTopic === 'readingHistory' && user?.token) {
          fetchedArticles = await fetchReadingHistory(user.token);
      } else if (selectedTopic === 'forYou' && user?.token) {
          const favoriteCategories = collections.find(c => c.name === 'Read Later')?.articles?.map(a => a.category) || [];
          fetchedArticles = await fetchPersonalizedNews(favoriteCategories, user.token);
      } else {
          const topicToFetch = searchQuery || selectedTopic;
          const { articles, ads } = await fetchArticlesWithAds(topicToFetch, searchFilters, user?.token);
          fetchedArticles = articles;
          fetchedAds = ads;
      }

      // Intersperse ads into the articles list
      const combinedFeed: FeedItem[] = [...fetchedArticles];
      if (fetchedAds.length > 0) {
          for(let i = 0; i < fetchedAds.length; i++) {
              const ad = fetchedAds[i];
              const insertIndex = 2 + (i * 5); // 2, 7, 12...
              if (insertIndex < combinedFeed.length) {
                  combinedFeed.splice(insertIndex, 0, { ...ad, isAd: true });
              } else {
                  combinedFeed.push({ ...ad, isAd: true });
              }
          }
      }
      setFeedItems(combinedFeed);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content.');
    } finally {
      setLoading(false);
      if (view === 'news') {
        window.scrollTo(0, 0);
      }
    }
  }, [selectedTopic, searchQuery, user?.token, collections, view, searchFilters]);

  useEffect(() => {
    if(view === 'news') {
      loadNews();
    }
  }, [view, loadNews]);

  const handleTopicChange = (topic: string) => {
    setSearchQuery('');
    setSelectedTopic(topic);
    if (topic === 'myLibrary') {
        setView('library');
    } else {
        setView('news');
    }
  };

  const handleSearch = (query: string) => {
    setIsSearchOpen(false);
    setView('news');
    setSelectedTopic(query); 
    setSearchQuery(query);
  };
  
  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };
  
  const handleNavigation = (targetView: 'news' | 'admin' | 'settings' | 'library') => {
      setView(targetView);
      if (targetView === 'admin') setSelectedTopic('Admin Panel');
      if (targetView === 'settings') setSelectedTopic('Settings');
      if (targetView === 'library') setSelectedTopic('myLibrary');
      if (targetView === 'news') setSelectedTopic('Top Stories');
  }

  const handleSelectTrendingArticle = async (articleId: string) => {
    try {
      const fullArticle = await getArticleById(articleId, user?.token);
      setSelectedArticle(fullArticle);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article details.');
    }
  };

  const handleSurpriseMe = async () => {
    try {
        const article = await fetchRandomArticle(user?.token);
        if (article) {
            setView('news'); // Ensure we are on the news view
            setSelectedArticle(article); // Open the modal
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not find a surprising article for you.');
    }
  };

  const mainArticle = feedItems.length > 0 && !('isAd' in feedItems[0]) ? feedItems[0] as Article : null;
  const otherItems = mainArticle ? feedItems.slice(1) : feedItems;
  
  const renderView = () => {
      switch(view) {
          case 'admin':
            return <AdminPanel onNavigateBack={() => handleNavigation('news')} />;
          case 'settings':
            return <SettingsPage onNavigateBack={() => handleNavigation('news')} />;
          case 'library':
            return <LibraryPage onNavigateBack={() => handleNavigation('news')} onReadArticle={handleReadMore} />;
          case 'news':
          default:
             return (
                 <>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white my-6 md:my-8 border-b-4 border-accent-500 pb-2">
                    {searchQuery ? `${t('searchResultsFor')} "${searchQuery}"` : t(selectedTopic as any) || selectedTopic}
                    </h1>

                    <AdvancedSearchBar filters={searchFilters} onFiltersChange={setSearchFilters} />

                    {loading ? (
                    <>
                        <MainArticleSkeleton />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    </>
                    ) : error ? (
                     <ErrorDisplay message={error} onRetry={loadNews} />
                    ) : (
                    <>
                        {mainArticle ? (
                        <MainArticle article={mainArticle} onReadMore={() => handleReadMore(mainArticle)} />
                        ) : otherItems.length === 0 ? (
                        <p className="text-center py-12 text-gray-500 dark:text-gray-400">{t('noArticlesFound')}</p>
                        ) : null}

                        {otherItems.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {otherItems.map(item => 
                                'isAd' in item ? (
                                    <AdBanner key={item.id} ad={item} viewedAds={viewedAds} />
                                ) : (
                                    <ArticleCard key={item.id} article={item as Article} onReadMore={() => handleReadMore(item as Article)} />
                                )
                            )}
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
        onSearch={() => setIsSearchOpen(true)}
        onSurpriseMe={handleSurpriseMe}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onNavigate={(target) => handleNavigation(target as 'admin' | 'settings')}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {renderView()}
      </main>

      <Footer onTopicChange={handleTopicChange} onArticleSelect={handleSelectTrendingArticle} />
      <BackToTopButton />

      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} />}
    </div>
  );
};

export default App;
