import React from 'react';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';

interface FooterProps {
  onTopicChange: (topic: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onTopicChange }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
             <div className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 100 100" className="text-accent-600 dark:text-accent-500">
                  <path fill="currentColor" d="M10 90V10h15l25 40L75 10h15v80H75V30L50 70 25 30v60H10z" />
                </svg>
                <span className="font-bold text-xl text-accent-600">Mahama News TV</span>
              </div>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-xs">Your daily source of reliable news and in-depth analysis.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Categories</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button onClick={() => onTopicChange(cat)} className="hover:underline">{t(cat as any)}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Follow us</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li><a href="#" className="hover:underline">Facebook</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
                <li><a href="#" className="hover:underline">Instagram</a></li>
              </ul>
            </div>
             <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Legal</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Mahama News TV. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
