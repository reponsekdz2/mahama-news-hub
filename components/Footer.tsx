import React, { useState } from 'react';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import { useSettings, Theme } from '../contexts/SettingsContext.tsx';
import { subscribeToNewsletter } from '../services/userService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import TrendingArticles from './TrendingArticles.tsx';
import AboutAIModal from './AboutAIModal.tsx';

interface FooterProps {
  onTopicChange: (topic: string) => void;
  onArticleSelect: (articleId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onTopicChange, onArticleSelect }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useSettings();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
    <>
    {isAiModalOpen && <AboutAIModal onClose={() => setIsAiModalOpen(false)} />}
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          <div className="space-y-8 xl:col-span-2">
            <div className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
                  <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
                </svg>
                <span className="font-bold text-xl text-accent-600">Mahama News TV</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-xs">
              Your daily source of reliable news and in-depth analysis.
            </p>
            <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
                <a href="#" className="text-gray-400 hover:text-gray-500"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                <a href="#" className="text-gray-400 hover:text-gray-500"><span className="sr-only">LinkedIn</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg></a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 xl:mt-0 xl:col-span-3 md:grid-cols-3">
             <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Categories</h3>
                <ul className="mt-4 space-y-4">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button onClick={() => onTopicChange(cat)} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{t(cat as any)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                    <li><button onClick={() => setIsAiModalOpen(true)} className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{t('aboutAI')}</button></li>
                    <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">About</a></li>
                    <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Contact Us</a></li>
                    <li><a href="/rss.xml" target="_blank" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">RSS Feed</a></li>
                    <li><a href="/sitemap.xml" target="_blank" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sitemap</a></li>
                </ul>
            </div>
             <div>
                <TrendingArticles onArticleSelect={onArticleSelect} />
                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Subscribe</h4>
                    <p className="mt-4 text-base text-gray-500 dark:text-gray-400">The latest news, sent to your inbox weekly.</p>
                    <form className="mt-4" onSubmit={handleSubscribe}>
                      <label htmlFor="email-address" className="sr-only">Email address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} name="email-address" id="email-address" autoComplete="email" required className="appearance-none min-w-0 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-accent-500 focus:border-accent-500" placeholder="Enter your email" />
                       <button type="submit" disabled={isSubscribing} className="mt-3 w-full bg-accent-600 flex items-center justify-center rounded-md border border-transparent py-2 px-4 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50">
                          Subscribe
                        </button>
                    </form>
                     {subscribeMessage && <p className={`mt-2 text-sm ${subscribeMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{subscribeMessage.text}</p>}
                </div>
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
    </>
  );
};

export default Footer;