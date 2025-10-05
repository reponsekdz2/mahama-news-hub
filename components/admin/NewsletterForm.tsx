import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { sendCampaign } from '../../services/campaignService.ts';

interface NewsletterFormProps {
    onCampaignSent: () => void;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ onCampaignSent }) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user?.token) return;
        setIsSending(true);
        setMessage('');
        try {
            const response = await sendCampaign({ subject, content }, user.token);
            setMessage(response.message);
            setSubject('');
            setContent('');
            onCampaignSent(); // Notify parent to refresh history
        } catch(err) {
            setMessage(err instanceof Error ? err.message : 'Failed to send campaign');
        } finally {
            setIsSending(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
             <h2 className="text-xl font-bold">Create Newsletter Campaign</h2>
             {message && <p className={`text-sm p-2 rounded ${message.includes('Failed') ? 'bg-red-100 dark:bg-red-900/50 text-red-700' : 'bg-green-100 dark:bg-green-900/50 text-green-700'}`}>{message}</p>}
             <div>
                <label className="block text-sm font-medium">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
             </div>
             <div>
                <label className="block text-sm font-medium">Content (HTML)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={10} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
             </div>
             <button type="submit" disabled={isSending} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                {isSending ? 'Sending...' : 'Send Campaign'}
             </button>
        </form>
    );
};

export default NewsletterForm;