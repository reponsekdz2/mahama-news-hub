import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { CATEGORIES } from '../contexts/LanguageContext';

interface ArticleFormProps {
    article: Article | null;
    onSave: (articleData: Omit<Article, 'id'> | Article) => void;
    onClose: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        category: CATEGORIES[0],
        imageUrl: '',
        sourceTitle: '',
        sourceUri: ''
    });

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title,
                summary: article.summary,
                category: article.category,
                imageUrl: article.imageUrl,
                sourceTitle: article.sources?.[0]?.title || '',
                sourceUri: article.sources?.[0]?.uri || ''
            });
        }
    }, [article]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { title, summary, category, imageUrl, sourceTitle, sourceUri } = formData;
        
        const sources = sourceUri ? [{ title: sourceTitle || new URL(sourceUri).hostname, uri: sourceUri }] : [];

        const articleData = { title, summary, category, imageUrl, sources };
        
        if (article?.id) {
            onSave({ ...articleData, id: article.id });
        } else {
            onSave(articleData);
        }
    };

    const formCategories = CATEGORIES.filter(c => c !== 'topStories');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {article ? 'Edit Article' : 'Create New Article'}
                            </h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
                                <textarea name="summary" value={formData.summary} onChange={handleChange} required rows={4} className="mt-1 block w-full input-style"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full input-style">
                                        {formCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Optional, auto-generated if blank" className="mt-1 block w-full input-style" />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Title</label>
                                    <input type="text" name="sourceTitle" value={formData.sourceTitle} onChange={handleChange} placeholder="e.g., Tech Chronicle" className="mt-1 block w-full input-style" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</label>
                                    <input type="text" name="sourceUri" value={formData.sourceUri} onChange={handleChange} placeholder="https://example.com/story" className="mt-1 block w-full input-style" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-right space-x-2">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700">Save Article</button>
                    </div>
                </form>
            </div>
             <style>{`
                .input-style {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    outline: none;
                }
                .input-style:focus {
                    --tw-ring-color: rgb(var(--accent-color-500));
                    border-color: rgb(var(--accent-color-500));
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                }
                .dark .input-style {
                    background-color: #374151; /* gray-700 */
                    border-color: #4b5563; /* gray-600 */
                }
             `}</style>
        </div>
    );
};

export default ArticleForm;
