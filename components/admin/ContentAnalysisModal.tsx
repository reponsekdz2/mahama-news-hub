import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import { fetchArticleAnalysis } from '../../services/aiService.ts';
import { ArticleAnalysis } from '../../types.ts';
import Spinner from '../Spinner.tsx';

interface ContentAnalysisModalProps {
    articleId: string;
    onClose: () => void;
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg flex items-center space-x-3">
        <div className="flex-shrink-0 text-accent-500">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const ContentAnalysisModal: React.FC<ContentAnalysisModalProps> = ({ articleId, onClose }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.token) return;
        const getAnalysis = async () => {
            try {
                const data = await fetchArticleAnalysis(articleId, user.token);
                setAnalysis(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
            } finally {
                setIsLoading(false);
            }
        };
        getAnalysis();
    }, [articleId, user?.token]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('contentAnalysis')}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {isLoading ? <Spinner /> : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : analysis ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard title={t('sentiment')} value={analysis.sentiment} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                                <StatCard title={t('readability')} value={analysis.readabilityScore} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('keyTopics')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keyTopics.map((topic, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm rounded-full">{topic}</span>)}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('seoKeywords')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.seoKeywords.map((keyword, i) => <span key={i} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm rounded-full">{keyword}</span>)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No analysis data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentAnalysisModal;