import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  const { t } = useLanguage();
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  const userFriendlyMessage = "We're having trouble loading this content right now. Please check your connection and try again.";

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-6 rounded-r-lg shadow-md my-8 text-center" role="alert">
      <div className="flex flex-col items-center">
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-2xl font-extrabold mt-4">{t('errorOccurred')}</h3>
        <p className="mt-2 text-base">{userFriendlyMessage}</p>

        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          {t('retry')}
        </button>

        <div className="mt-6 w-full text-left">
          <button onClick={() => setDetailsVisible(!detailsVisible)} className="text-sm text-red-700 dark:text-red-300 hover:underline">
            {detailsVisible ? `Hide ${t('technicalDetails')}` : `Show ${t('technicalDetails')}`}
          </button>
          {detailsVisible && (
            <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-200 text-xs rounded-md whitespace-pre-wrap break-all">
              <code>{message}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;