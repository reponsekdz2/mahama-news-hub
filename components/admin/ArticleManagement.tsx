import React, { useState, useEffect, useCallback } from 'react';
import { Article } from '../../types.ts';
import { fetchArticles, createArticle, updateArticle, deleteArticle } from '../../services/articleService.ts';
import { createOrUpdatePoll } from '../../services/pollService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import ArticleForm from '../ArticleForm.tsx';
import { SearchFilters } from '../../App.tsx';

const ArticleManagement: React.FC = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            const defaultFilters: SearchFilters = { dateRange: 'all', sortBy: 'newest' };
            const articles = await fetchArticles('Top Stories', defaultFilters, user?.token);
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
        setIsFormOpen(true);
    };

    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setIsFormOpen(true);
    };
    
    const handleCancelEdit = () => {
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
    
    const handleFormSubmit = async (formData: FormData, articleId?: string) => {
        if (!user?.token) return;
        setIsSubmitting(true);
        setError(null);

        try {
            let savedArticle: Article;
            if (articleId) {
                savedArticle = await updateArticle(articleId, formData, user.token);
                savedArticle.id = articleId;
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
                        {articles.map(article => (
                            <tr key={article.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={article.title}>{article.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize self-start ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {article.status}
                                        </span>
                                        {article.isPremium && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 self-start">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                    <div className="font-semibold">{article.category}</div>
                                    <div className="truncate text-xs">{article.tags?.join(', ')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.authorName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.viewCount} / {article.likeCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(article)} className="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-300">Edit</button>
                                    <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ArticleManagement;