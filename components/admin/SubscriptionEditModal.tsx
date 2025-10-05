import React, { useState } from 'react';
import { User } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { updateUserSubscription } from '../../services/subscriptionService.ts';

interface SubscriptionEditModalProps {
    user: User;
    onClose: () => void;
    onSubscriptionUpdate: () => void;
}

const SubscriptionEditModal: React.FC<SubscriptionEditModalProps> = ({ user, onClose, onSubscriptionUpdate }) => {
    const { user: adminUser } = useAuth();
    const [status, setStatus] = useState(user.subscriptionStatus || 'free');
    const [endDate, setEndDate] = useState(user.subscriptionEndDate ? user.subscriptionEndDate.split('T')[0] : '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUser?.token) return;
        
        setIsLoading(true);
        setError('');
        try {
            await updateUserSubscription(user.id, { status, endDate: endDate || null }, adminUser.token);
            onSubscriptionUpdate();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update subscription.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">Manage Subscription for {user.name}</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div>
                    <label className="block text-sm font-medium">Subscription Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="free">Free</option>
                        <option value="trial">Trial</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium">End Date (optional)</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubscriptionEditModal;
