import React, { useState, useEffect, useCallback } from 'react';
import { Article } from '../../types.ts';
import { fetchArticles, deleteArticle, createArticle, updateArticle } from '../../services/articleService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import ArticleForm from '../ArticleForm.tsx';

const ArticleManagement: React.FC = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState<Partial<Article> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadArticles = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            // Fetch all articles, regardless of topic, for management
            const allArticles = await fetchArticles('all', {dateRange: 'all', sortBy: 'newest'}, user.token);
            setArticles(allArticles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load articles.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleDelete = async (articleId: string) => {
        if (!user?.token || !window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await deleteArticle(articleId, user.token);
            setArticles(prev => prev.filter(a => a.id !== articleId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete article.');
        }
    };
    
    const handleOpenForm = (article?: Article) => {
        setArticleToEdit(article || null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (formData: FormData, articleId?: string) => {
        if (!user?.token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (articleId) {
                await updateArticle(articleId, formData, user.token);
            } else {
                await createArticle(formData, user.token);
            }
            setIsFormOpen(false);
            setArticleToEdit(null);
            loadArticles(); // Reload articles to see changes
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save article.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div>
            {isFormOpen ? (
                <ArticleForm 
                    articleToEdit={articleToEdit} 
                    onFormSubmit={handleFormSubmit} 
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Articles ({articles.length})</h2>
                        <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                            Create New Article
                        </button>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {articles.map(article => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{article.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{article.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenForm(article)} className="text-accent-600 hover:text-accent-900">Edit</button>
                                        <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ArticleManagement;
