import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchNewsletterCampaigns, NewsletterCampaign } from '../../services/campaignService.ts';
import Spinner from '../Spinner.tsx';

const NewsletterHistory: React.FC = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadHistory = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const history = await fetchNewsletterCampaigns(user.token);
            setCampaigns(history);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <div className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4">Newsletter History</h2>
            {isLoading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {campaigns.length > 0 ? campaigns.map(c => (
                        <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{c.subject}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sent by {c.adminName} on {new Date(c.sentAt).toLocaleString()}
                            </p>
                        </div>
                    )) : (
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No campaigns have been sent yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsletterHistory;
