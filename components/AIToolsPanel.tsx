import React, { useState } from 'react';
import { Article } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { translateArticleContent, summarizeContent, answerQuestionAboutArticle } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';

interface AIToolsPanelProps {
  article: Article;
}

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({ article }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState<null | 'summary' | 'translation' | 'answer'>(null);
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState('');
    const [translatedContent, setTranslatedContent] = useState<{title: string, content: string} | null>(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleSummarize = async () => {
        if (!user?.token) return;
        setIsLoading('summary');
        setError(null);
        try {
            const result = await summarizeContent({ title: article.title, summary: article.content });
            setSummary(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get summary.');
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleTranslate = async (targetLanguage: string) => {
        if (!user?.token) return;
        setIsLoading('translation');
        setError(null);
        try {
            const result = await translateArticleContent({ title: article.title, summary: article.content }, targetLanguage);
            // Fix: Map the `summary` property from the result to the `content` property of the state.
            setTranslatedContent({ title: result.title, content: result.summary });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to translate.');
        } finally {
            setIsLoading(null);
        }
    };

    const handleQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !question.trim()) return;
        setIsLoading('answer');
        setError(null);
        try {
            const result = await answerQuestionAboutArticle({ title: article.title, summary: article.content }, question);
            setAnswer(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get answer.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t('aiTools')}</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="space-y-6">
                {/* Summarize */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t('summarize')}</h4>
                    {isLoading === 'summary' ? <Spinner /> : (
                        summary ? <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary.replace(/\* /g, '<br/>- ') }}></div> : <button onClick={handleSummarize} className="mt-2 px-3 py-1 text-sm bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 rounded-md hover:bg-accent-200">{t('getSummary')}</button>
                    )}
                </div>

                {/* Translate */}
                <div>
                     <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t('translateTo')}</h4>
                     {isLoading === 'translation' && <Spinner />}
                     <div className="flex space-x-2 mt-2">
                        <button onClick={() => handleTranslate('French')} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">French</button>
                        <button onClick={() => handleTranslate('Kinyarwanda')} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Kinyarwanda</button>
                     </div>
                     {translatedContent && (
                        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                            <h5 className="font-bold">{translatedContent.title}</h5>
                            <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: translatedContent.content }}/>
                            <button onClick={() => setTranslatedContent(null)} className="text-xs text-accent-500 mt-2">{t('showOriginal')}</button>
                        </div>
                     )}
                </div>

                {/* Ask a Question */}
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t('askQuestion')}</h4>
                    <form onSubmit={handleQuestion} className="flex items-center space-x-2 mt-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={t('questionPlaceholder')}
                            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700"
                        />
                        <button type="submit" disabled={isLoading === 'answer'} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                            {isLoading === 'answer' ? t('generating') : t('getAnswer')}
                        </button>
                    </form>
                    {isLoading === 'answer' ? <Spinner /> : (
                        answer && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">{answer}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIToolsPanel;