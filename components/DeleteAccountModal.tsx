import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { deleteAccount } from '../services/userService.ts';

interface DeleteAccountModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onConfirm }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!user?.token) return;
        setIsLoading(true);
        setError('');
        try {
            await deleteAccount(user.token);
            onConfirm(); // This will trigger logout and page reload
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete account.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Delete Account</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including saved articles and preferences, will be lost.
                </p>
                {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                        {isLoading ? 'Deleting...' : 'Delete My Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
