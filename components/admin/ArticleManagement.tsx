import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Article, RealtimeLockInfo, WebSocketMessage } from '../../types.ts';
import { fetchArticlesWithAds, createArticle, updateArticle, deleteArticle } from '../../services/articleService.ts';
import { generateArticleWithAI } from '../../services/geminiService.ts';
import { createOrUpdatePoll } from '../../services/pollService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import Spinner from '../Spinner.tsx';
import ArticleForm from '../ArticleForm.tsx';
import ContentAnalysisModal from './ContentAnalysisModal.tsx';
// FIX: Import SearchFilters type from App.tsx
import { SearchFilters } from '../../App.tsx';

const GenerateArticleModal: React.FC<{onClose: () => void, onGenerate: (topic: string) => void, isLoading: boolean}> = ({onClose, onGenerate, isLoading}) => {
    const [topic, setTopic] = useState('');
    const { t } = useLanguage();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{t('generateWithAI')}</h3>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('enterTopic')}</label>
                    <input id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" />
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border dark:border-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50">
                            {isLoading ? t('generating') : t('generate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const ArticleManagement: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    
    // Real-time and Analysis State
    const [articleLocks, setArticleLocks] = useState<Record<string, RealtimeLockInfo>>({});
    const [analyzingArticleId, setAnalyzingArticleId] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    // --- WebSocket Logic ---
    useEffect(() => {
        if (!user?.token) return;

        // Determine WebSocket protocol based on HTTP protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}?token=${user.token}`;
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onmessage = (event) => {
            const message: WebSocketMessage = JSON.parse(event.data);
            switch (message.type) {
                case 'initial_locks':
                    setArticleLocks(message.payload);
                    break;
                case 'start_editing':
                    setArticleLocks(prev => ({ ...prev, [message.payload.articleId]: { userId: message.payload.userId, userName: message.payload.userName } }));
                    break;
                case 'stop_editing':
                    setArticleLocks(prev => {
                        const newLocks = { ...prev };
                        delete newLocks[message.payload.articleId];
                        return newLocks;
                    });
                    break;
                case 'editing_conflict':
                    if (editingArticle?.id === message.payload.articleId) {
                        alert(`Cannot edit this article. It is currently being edited by ${message.payload.lock.userName}.`);
                        setIsFormOpen(false);
                        setEditingArticle(null);
                    }
                    break;
            }
        };

        ws.current.onclose = () => console.log("WebSocket disconnected");
        ws.current.onerror = (err) => console.error("WebSocket error:", err);

        return () => {
            if (editingArticle?.id) {
                ws.current?.send(JSON.stringify({ type: 'stop_editing', payload: { articleId: editingArticle.id } }));
            }
            ws.current?.close();
        };
    }, [user?.token, editingArticle?.id]);
    // --- End WebSocket Logic ---


    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            const defaultFilters: SearchFilters = { dateRange: 'all', sortBy: 'newest' };
            const { articles } = await fetchArticlesWithAds('Top Stories', defaultFilters, user?.token);
            setArticles(articles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load articles.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleNewArticle = () => {
        setEditingArticle(null);
        setIsGenerateModalOpen(true);
    };

    const handleEdit = (article: Article) => {
        if (articleLocks[article.id] && articleLocks[article.id].userId !== user?.id) {
             alert(`This article is currently locked for editing by ${articleLocks[article.id].userName}.`);
             return;
        }
        setEditingArticle(article);
        setIsFormOpen(true);
        ws.current?.send(JSON.stringify({ type: 'start_editing', payload: { articleId: article.id } }));
    };
    
    const handleCancelEdit = () => {
        if (editingArticle?.id) {
            ws.current?.send(JSON.stringify({ type: 'stop_editing', payload: { articleId: editingArticle.id } }));
        }
        setIsFormOpen(false);
        setEditingArticle(null);
    }

    const handleDelete = async (articleId: string) => {
        if (!user?.token || !window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await deleteArticle(articleId, user.token);
            setArticles(prev => prev.filter(a => a.id !== articleId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete article.');
        }
    };
    
    const handleAiGenerate = async (topic: string) => {
        if(!user?.token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const { title, summary, category } = await generateArticleWithAI(topic, user.token);
            setEditingArticle({ title, content: summary, category });
            setIsGenerateModalOpen(false);
            setIsFormOpen(true);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to generate article.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleFormSubmit = async (formData: FormData, articleId?: string) => {
        if (!user?.token) return;
        setIsSubmitting(true);
        setError(null);

        try {
            let savedArticle: Article;
            if (articleId) {
                savedArticle = await updateArticle(articleId, formData, user.token);
                savedArticle.id = articleId;
                ws.current?.send(JSON.stringify({ type: 'stop_editing', payload: { articleId } }));
            } else {
                savedArticle = await createArticle(formData, user.token);
            }
            
            const pollQuestion = formData.get('pollQuestion') as string;
            const pollOptions = formData.getAll('pollOptions[]') as string[];
            
            if (pollQuestion && pollOptions.every(opt => opt.trim())) {
                 await createOrUpdatePoll({
                    articleId: savedArticle.id,
                    question: pollQuestion,
                    options: pollOptions
                 }, user.token);
            }

            setIsFormOpen(false);
            setEditingArticle(null);
            loadArticles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save article.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) return <Spinner />;

    if (isFormOpen) {
        return (
            <div className="fade-in">
                <h2 className="text-xl font-bold mb-4">{editingArticle?.id ? 'Edit Article' : 'Create New Article'}</h2>
                {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                <ArticleForm
                    articleToEdit={editingArticle}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelEdit}
                    isLoading={isSubmitting}
                />
            </div>
        );
    }

    return (
        <div>
            {isGenerateModalOpen && <GenerateArticleModal onClose={() => setIsGenerateModalOpen(false)} onGenerate={handleAiGenerate} isLoading={isSubmitting} />}
            {analyzingArticleId && <ContentAnalysisModal articleId={analyzingArticleId} onClose={() => setAnalyzingArticleId(null)} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold">Manage Articles ({articles.length})</h2>
                <button onClick={handleNewArticle} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                    + New Article
                </button>
            </div>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
             <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category & Tags</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stats (V/L)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {articles.map(article => {
                            const lockInfo = articleLocks[article.id];
                            const isLockedByOther = lockInfo && lockInfo.userId !== user?.id;
                            return (
                                <tr key={article.id} className={isLockedByOther ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={article.title}>{article.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                          {article.status}
                                        </span>
                                        {isLockedByOther && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                In use by {lockInfo.userName.split(' ')[0]}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                        <div className="font-semibold">{article.category}</div>
                                        <div className="truncate text-xs">{article.tags?.join(', ')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.authorName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.viewCount} / {article.likeCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => setAnalyzingArticleId(article.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={t('analyze')}>Analyze</button>
                                        <button onClick={() => handleEdit(article)} disabled={isLockedByOther} className="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-300 disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                                        <button onClick={() => handleDelete(article.id)} disabled={isLockedByOther} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ArticleManagement;