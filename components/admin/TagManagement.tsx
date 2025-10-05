import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchTags, createTag, deleteTag } from '../../services/tagService.ts';
import Spinner from '../Spinner.tsx';

interface Tag {
    id: number;
    name: string;
}

const TagManagement: React.FC = () => {
    const { user } = useAuth();
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTags = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTags = await fetchTags();
            setTags(fetchedTags);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tags.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !newTagName.trim()) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const newTag = await createTag(newTagName, user.token);
            setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
            setNewTagName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tag.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!user?.token || !window.confirm('Are you sure you want to delete this tag?')) return;
        
        const originalTags = tags;
        setTags(prev => prev.filter(t => t.id !== id));
        
        try {
            await deleteTag(id, user.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tag.');
            setTags(originalTags); // Revert on error
        }
    };
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Manage Tags ({tags.length})</h2>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleCreate} className="mb-6 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="New tag name..."
                    className="flex-grow block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"
                />
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Create Tag'}
                </button>
            </form>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tags.map(tag => (
                        <li key={tag.id} className="px-6 py-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{tag.name}</span>
                            <button
                                onClick={() => handleDelete(tag.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
                {tags.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No tags found.</p>}
            </div>
        </div>
    );
};

export default TagManagement;
