import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createSubscription } from '../services/subscriptionService.ts';

interface SubscriptionPlanModalProps {
    onClose: () => void;
}

const PlanCard: React.FC<{ title: string, price: string, features: string[], onSelect: () => void, isSelected: boolean }> = 
({ title, price, features, onSelect, isSelected }) => (
    <div 
        onClick={onSelect}
        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'border-accent-500 scale-105 bg-accent-50 dark:bg-accent-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-accent-400'}`}
    >
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-3xl font-extrabold">{price}<span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span></p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {features.map(f => <li key={f} className="flex items-center"><svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>{f}</li>)}
        </ul>
    </div>
);

const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({ onClose }) => {
    const { user, refreshUser, isLoggedIn } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubscribe = async () => {
        if (!user?.token) {
            setMessage('Please log in to subscribe.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        try {
            await createSubscription(selectedPlan, user.token);
            await refreshUser();
            setMessage('Subscription successful! Thank you.');
            setTimeout(onClose, 2000);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Subscription failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold">Upgrade to Premium</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Choose the plan that's right for you.</p>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PlanCard 
                        title="Monthly"
                        price="$9.99"
                        features={['Ad-free experience', 'Unlimited articles', 'Offline reading', 'Exclusive content']}
                        onSelect={() => setSelectedPlan('monthly')}
                        isSelected={selectedPlan === 'monthly'}
                    />
                    <PlanCard 
                        title="Yearly"
                        price="$8.33"
                        features={['Save 16%', 'All monthly features', 'Priority support', 'Early access to new features']}
                        onSelect={() => setSelectedPlan('yearly')}
                        isSelected={selectedPlan === 'yearly'}
                    />
                </div>
                <div className="mt-8 text-center">
                    {!isLoggedIn ? (
                        <p className="text-red-500">Please log in or register to subscribe.</p>
                    ) : (
                        <button onClick={handleSubscribe} disabled={isLoading} className="w-full max-w-xs bg-accent-600 text-white py-3 rounded-lg font-semibold hover:bg-accent-700 disabled:opacity-50">
                            {isLoading ? 'Processing...' : 'Subscribe Now'}
                        </button>
                    )}
                    {message && <p className="mt-4 text-sm">{message}</p>}
                </div>
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
            </div>
        </div>
    );
};

export default SubscriptionPlanModal;
