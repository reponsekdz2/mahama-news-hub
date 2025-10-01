import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { getComments, postComment } from '../services/articleService.ts';
import Spinner from './Spinner.tsx';

interface CommentsSectionProps {
  articleId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ articleId }) => {
  const { isLoggedIn, user } = useAuth();
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedComments = await getComments(articleId);
      setComments(fetchedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const postedComment = await postComment(articleId, newComment, user.token);
      setComments(prev => [postedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Comments ({comments.length})</h3>
      
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 bg-white dark:bg-gray-700"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-sm">Please log in to post a comment.</p>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      {isLoading ? <Spinner /> : (
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{comment.userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(comment.createdAt).toLocaleString()}</p>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
