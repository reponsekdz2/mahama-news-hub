import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translateArticleContent, summarizeContent, answerQuestionAboutArticle } from '../services/geminiService';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { t } = useLanguage();
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{title: string, summary: string} | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  // AI Assistant state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);


  // Reset state when article changes or modal closes
  useEffect(() => {
    if (article) {
        setIsTranslating(false);
        setTranslatedContent(null);
        setTranslationError(null);
        setIsSummarizing(false);
        setSummaryResult(null);
        setSummaryError(null);
        setIsAnswering(false);
        setQuestion('');
        setAnswer(null);
        setAnswerError(null);
    }
  }, [article]);

  if (!article) return null;
  
  const shareUrl = article.sources.length > 0 ? article.sources[0].uri : window.location.href;
  const shareText = encodeURIComponent(`Check out this article: ${article.title}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  const handleTranslate = async (targetLanguage: 'English' | 'French' | 'Kinyarwanda') => {
    if (translatedContent) {
        setTranslatedContent(null);
        return;
    }
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const result = await translateArticleContent({ title: article.title, summary: article.summary }, targetLanguage);
      setTranslatedContent(result);
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummaryError(null);
    setSummaryResult(null);
    try {
        const result = await summarizeContent({ title: article.title, summary: article.summary });
        setSummaryResult(result);
    } catch (error) {
        setSummaryError(error instanceof Error ? error.message : "Summarization failed");
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsAnswering(true);
    setAnswerError(null);
    setAnswer(null);
    try {
        const result = await answerQuestionAboutArticle({ title: article.title, summary: article.summary }, question);
        setAnswer(result);
    } catch (error) {
        setAnswerError(error instanceof Error ? error.message : "Failed to get answer");
    } finally {
        setIsAnswering(false);
    }
  };


  const displayTitle = translatedContent?.title || article.title;
  const displaySummary = translatedContent?.summary || article.summary;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img className="h-64 w-full object-cover rounded-t-lg" src={article.imageUrl} alt={displayTitle} />
          <button onClick={onClose} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <span className="uppercase tracking-wide text-sm text-accent-500 font-semibold">{article.category}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{displayTitle}</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap min-h-[6em]">
            {isTranslating ? `${t('translating')}...` : displaySummary}
            {translationError && <span className="text-red-500 block mt-2">{translationError}</span>}
          </p>

          {/* AI Assistant Section */}
           <div className="mt-6 border-t pt-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('aiAssistant')}</h3>
                <div className="space-y-4 mt-2">
                    {/* Quick Summary */}
                    <div>
                        <button onClick={handleSummarize} disabled={isSummarizing} className="px-3 py-1 text-sm rounded-md bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200 hover:bg-accent-200 dark:hover:bg-accent-800 disabled:opacity-50 disabled:cursor-wait transition-colors">{t('quickSummary')}</button>
                        {isSummarizing && <p className="text-sm text-gray-500 mt-2">{t('summarizing')}...</p>}
                        {summaryError && <p className="text-sm text-red-500 mt-2">{summaryError}</p>}
                        {summaryResult && <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: summaryResult.replace(/\* (.*)/g, '<li>$1</li>').replace(/\n/g, '') }} />}
                    </div>
                     {/* Ask a Question */}
                    <div>
                        <form onSubmit={handleAskQuestion}>
                            <label htmlFor="ai-question" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('askAQuestion')}</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="text" id="ai-question" value={question} onChange={e => setQuestion(e.target.value)} placeholder={t('askPlaceholder')} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-gray-300 dark:border-gray-600 focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                                <button type="submit" disabled={isAnswering} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">{t('ask')}</button>
                            </div>
                        </form>
                        {isAnswering && <p className="text-sm text-gray-500 mt-2">{t('gettingAnswer')}...</p>}
                        {answerError && <p className="text-sm text-red-500 mt-2">{answerError}</p>}
                        {answer && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{answer}</p>}
                    </div>
                </div>
           </div>

          <div className="mt-6 border-t pt-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('translate')}</h3>
            <div className="flex items-center space-x-2 mt-2">
              <button onClick={() => handleTranslate('English')} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900 transition-colors">EN</button>
              <button onClick={() => handleTranslate('French')} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900 transition-colors">FR</button>
              <button onClick={() => handleTranslate('Kinyarwanda')} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-accent-100 dark:hover:bg-accent-900 transition-colors">RW</button>
              {translatedContent && (
                  <button onClick={() => setTranslatedContent(null)} className="px-3 py-1 text-sm rounded-md bg-accent-500 text-white hover:bg-accent-600 transition-colors">{t('showOriginal')}</button>
              )}
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('sources')}</h3>
             <div className="flex flex-col space-y-2 mt-2">
              {(article.sources && article.sources.length > 0) ? article.sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-600 dark:text-accent-400 hover:underline truncate" title={source.uri}>
                  {source.title || new URL(source.uri).hostname}
                </a>
              )) : <span className="text-sm text-gray-500 dark:text-gray-400">{t('noSources')}</span>}
             </div>
          </div>

          <div className="mt-6 border-t pt-4 dark:border-gray-700 flex items-center justify-end space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('share')}</span>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z"></path></svg>
            </a>
            <button onClick={handleCopyLink} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
