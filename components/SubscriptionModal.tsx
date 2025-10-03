import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { createSubscription } from '../services/subscriptionService.ts';

interface SubscriptionModalProps {
    onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async () => {
        if (!user?.token) return;
        setIsSubscribing(true);
        setError('');
        try {
            // FIX: Pass the 'monthly' plan type to createSubscription as required by its signature.
            await createSubscription('monthly', user.token);
            await refreshUser(); // Refresh user context to get new subscription status
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete subscription.');
        } finally {
            setIsSubscribing(false);
        }
    };
    
    const benefits = [
        "Read all premium articles",
        "Enjoy an ad-free experience",
        "Support quality journalism",
        "Access exclusive content"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-4">Unlock Premium Access</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Join our community of subscribers to get the full story.
                    </p>

                    <ul className="mt-6 text-left space-y-3">
                        {benefits.map((benefit, i) => (
                             <li key={i} className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{benefit}</p>
                            </li>
                        ))}
                    </ul>

                    {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-b-2xl">
                     <button
                        onClick={handleSubscribe}
                        disabled={isSubscribing}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    >
                        {isSubscribing ? 'Processing...' : 'Subscribe for $9.99/month'}
                    </button>
                    <button onClick={onClose} className="mt-3 w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:underline">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;