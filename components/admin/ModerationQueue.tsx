import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../../types.ts';
import { fetchPendingComments, updateCommentStatus } from '../../services/adminService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';

const ModerationQueue: React.FC = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPendingComments = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const pendingComments = await fetchPendingComments(user.token);
            setComments(pendingComments);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load comments.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadPendingComments();
    }, [loadPendingComments]);

    const handleUpdateStatus = async (commentId: string, status: 'approved' | 'rejected') => {
        if (!user?.token) return;
        
        // Optimistic update
        const originalComments = comments;
        setComments(prev => prev.filter(c => c.id !== commentId));
        
        try {
            await updateCommentStatus(commentId, status, user.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${status} comment.`);
            setComments(originalComments); // Revert on error
        }
    };
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Comment Moderation Queue ({comments.length})</h2>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            {comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <strong>{comment.userName}</strong> on article: <em>{comment.articleTitle}</em>
                                    </p>
                                    <p className="mt-2 text-gray-800 dark:text-gray-200">{comment.content}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleUpdateStatus(comment.id, 'approved')}
                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">The moderation queue is empty.</p>
            )}
        </div>
    );
};

export default ModerationQueue;
