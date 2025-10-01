import React, { useState, useEffect } from 'react';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import { useSettings, Theme } from '../contexts/SettingsContext.tsx';
import { subscribeToNewsletter } from '../services/userService.ts';
import { fetchTrendingArticles } from '../services/analyticsService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Article } from '../types.ts';

interface FooterProps {
  onTopicChange: (topic: string) => void;
}

const TrendingArticles: React.FC = () => {
    const [articles, setArticles] = useState<Pick<Article, 'id'|'title'>[]>([]);

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const trending = await fetchTrendingArticles();
                setArticles(trending);
            } catch (error) {
                console.error("Failed to load trending articles:", error);
            }
        };
        loadTrending();
    }, []);

    if (articles.length === 0) return null;

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Trending Articles</h3>
            <ul className="mt-4 space-y-4">
                {articles.map(article => (
                    <li key={article.id}>
                        <a href={`#article-${article.id}`} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{article.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const Footer: React.FC<FooterProps> = ({ onTopicChange }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useSettings();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeMessage(null);
    try {
        const data = await subscribeToNewsletter(email, user?.token);
        setSubscribeMessage({ type: 'success', text: data.message });
        setEmail('');
    } catch (err) {
        setSubscribeMessage({ type: 'error', text: err instanceof Error ? err.message : 'Subscription failed.' });
    } finally {
        setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
                  <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
                </svg>
                <span className="font-bold text-xl text-accent-600">Mahama News TV</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-xs">
              Your daily source of reliable news and in-depth analysis.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 xl:mt-0 xl:col-span-3 md:grid-cols-3">
             <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Quick Links</h3>
                <ul className="mt-4 space-y-4">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button onClick={() => onTopicChange(cat)} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{t(cat as any)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            <TrendingArticles />
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Subscribe</h3>
                <p className="mt-4 text-base text-gray-500 dark:text-gray-400">The latest news, articles, and resources, sent to your inbox weekly.</p>
                <form className="mt-4 sm:flex sm:max-w-md" onSubmit={handleSubscribe}>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} name="email-address" id="email-address" autoComplete="email" required className="appearance-none min-w-0 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-accent-500 focus:border-accent-500" placeholder="Enter your email" />
                  <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button type="submit" disabled={isSubscribing} className="w-full bg-accent-600 flex items-center justify-center rounded-md border border-transparent py-2 px-4 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50">
                      Subscribe
                    </button>
                  </div>
                </form>
                 {subscribeMessage && <p className={`mt-2 text-sm ${subscribeMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{subscribeMessage.text}</p>}
              </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-gray-400 text-center md:text-left">© {new Date().getFullYear()} Mahama News TV. All Rights Reserved.</p>
          <div className="flex space-x-4">
             <select id="footer-lang" value={language} onChange={e => setLanguage(e.target.value as any)} className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md text-sm">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
            </select>
            <select id="footer-theme" value={theme} onChange={e => setTheme(e.target.value as Theme)} className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md text-sm">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;