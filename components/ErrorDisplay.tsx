import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  const { t } = useLanguage();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(''), 2000);
    }, () => {
        setCopyStatus('Failed to copy.');
        setTimeout(() => setCopyStatus(''), 2000);
    });
  };
  
  const handleReport = () => {
    const subject = "Mahama News TV - Content Loading Error Report";
    const body = `Hello Support Team,\n\nI encountered an error while trying to load content. Please find the details below:\n\nError Details:\n----------------\n${message}\n----------------\n\nThank you.`;
    window.location.href = `mailto:support@mahamanews.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const userFriendlyMessage = "We're having trouble loading this content right now. Please check your connection and try again.";

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-6 rounded-r-lg shadow-md my-8 text-center" role="alert">
      <div className="flex flex-col items-center">
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-2xl font-extrabold mt-4">{t('errorOccurred')}</h3>
        <p className="mt-2 text-base">{userFriendlyMessage}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              {t('retry')}
            </button>
            <button
              onClick={handleReport}
              className="px-6 py-2 bg-transparent border border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              {t('reportIssue')}
            </button>
        </div>

        <div className="mt-6 w-full text-left">
          <button onClick={() => setDetailsVisible(!detailsVisible)} className="text-sm text-red-700 dark:text-red-300 hover:underline">
            {detailsVisible ? `Hide ${t('technicalDetails')}` : `Show ${t('technicalDetails')}`}
          </button>
          {detailsVisible && (
            <div className="relative mt-2">
                <pre className="p-3 bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-200 text-xs rounded-md whitespace-pre-wrap break-all">
                  <code>{message}</code>
                </pre>
                <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                    {copyStatus || t('copyDetails')}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;