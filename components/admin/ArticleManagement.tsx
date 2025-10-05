import React, { useState, useEffect, useCallback } from 'react';
import { Article } from '../../types.ts';
import { fetchArticles, deleteArticle, createArticle, updateArticle } from '../../services/articleService.ts';
import { createOrUpdatePoll } from '../../services/pollService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import ArticleForm from './ArticleForm.tsx';

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
            let submittedArticle;
            if (articleId) {
                submittedArticle = await updateArticle(articleId, formData, user.token);
            } else {
                submittedArticle = await createArticle(formData, user.token);
            }
            
            const pollQuestion = formData.get('pollQuestion') as string;
            if (submittedArticle?.id && pollQuestion) {
                 await createOrUpdatePoll({
                    articleId: submittedArticle.id,
                    question: pollQuestion,
                    options: formData.getAll('pollOptions[]') as string[],
                }, user.token);
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
                        <button onClick={() => handleOpenForm()} className="btn btn-primary">
                            Create New Article
                        </button>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="overflow-x-auto card">
                         <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Premium</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                             <tbody>
                                {articles.map(article => (
                                <tr key={article.id}>
                                    <td>
                                        {article.imageUrl ? (
                                            <img src={article.imageUrl} alt={article.title} className="w-16 h-10 object-cover rounded shadow" />
                                        ) : (
                                            <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                                        )}
                                    </td>
                                    <td className="font-medium text-gray-900 dark:text-white max-w-xs truncate">{article.title}</td>
                                    <td>{article.category}</td>
                                    <td>
                                        <span className={`badge ${article.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                                            {article.status}
                                        </span>
                                    </td>
                                     <td>
                                        {article.isPremium ? 'Yes' : 'No'}
                                    </td>
                                    <td className="text-right font-medium space-x-4">
                                        <button onClick={() => handleOpenForm(article)} className="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-200">Edit</button>
                                        <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
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
