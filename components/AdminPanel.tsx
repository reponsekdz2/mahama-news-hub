import React, { useState, useEffect, useCallback } from 'react';
import { Article } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { fetchArticles, createArticle, updateArticle, deleteArticle } from '../services/articleService';
import ArticleForm from './ArticleForm';
import Spinner from './Spinner';

const AdminPanel: React.FC<{ onNavigateBack: () => void }> = ({ onNavigateBack }) => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all articles, regardless of category
            const allArticles = await fetchArticles('Top Stories');
            setArticles(allArticles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load articles');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleFormSave = async (articleData: Omit<Article, 'id'> | Article) => {
        if (!user?.token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        try {
            if ('id' in articleData) { // Editing existing article
                await updateArticle(articleData.id, articleData, user.token);
            } else { // Creating new article
                await createArticle(articleData, user.token);
            }
            await loadArticles(); // Refresh list
            handleFormClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save article');
        }
    };
    
    const handleDelete = async (articleId: string) => {
        if (!user?.token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteArticle(articleId, user.token);
                await loadArticles(); // Refresh list
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to delete article');
            }
        }
    };

    const handleFormOpen = (article: Article | null = null) => {
        setEditingArticle(article);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingArticle(null);
    };

    const renderContent = () => {
        if (isLoading) return <Spinner />;
        if (error) return <p className="text-red-500 text-center">{error}</p>;

        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200">{article.category}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleFormOpen(article)} className="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-200">Edit</button>
                                    <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">Admin Panel</h1>
                <div>
                     <button
                        onClick={() => handleFormOpen(null)}
                        className="mr-4 px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                        + New Article
                    </button>
                    <button
                        onClick={onNavigateBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Back to News
                    </button>
                </div>
            </div>
            {renderContent()}
            {isFormOpen && <ArticleForm article={editingArticle} onSave={handleFormSave} onClose={handleFormClose} />}
        </div>
    );
};

export default AdminPanel;
