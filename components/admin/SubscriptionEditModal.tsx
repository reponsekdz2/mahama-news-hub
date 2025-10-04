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
    const [status, setStatus] = useState<'free' | 'premium' | 'trial'>(user.subscriptionStatus || 'free');
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
            setError(err instanceof Error ? err.message : 'Failed to update subscription');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Manage Subscription for {user.name}</h3>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm">
                                <option value="free">Free</option>
                                <option value="trial">Trial</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date (Optional)</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm" />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border dark:border-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionEditModal;
