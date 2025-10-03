import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createSubscription } from '../services/subscriptionService.ts';

interface SubscriptionPlanModalProps {
    onClose: () => void;
}

type Plan = 'monthly' | 'yearly';
type View = 'plans' | 'checkout';

const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
    const [view, setView] = useState<View>('plans');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setView('checkout');
    };

    const handlePayment = async () => {
        if (!user?.token) return;
        setIsProcessing(true);
        setError('');
        try {
            await createSubscription(selectedPlan, user.token);
            await refreshUser();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete subscription.');
            setView('plans'); // Go back to plan selection on error
        } finally {
            setIsProcessing(false);
        }
    };
    
    const benefits = ["Read all premium articles", "Enjoy an ad-free experience", "Support quality journalism", "Access exclusive content"];

    const PlanView = () => (
        <>
            <div className="p-8 text-center">
                 <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-4">Unlock Premium Access</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Choose a plan that works for you.</p>
            </div>
            <div className="px-6 pb-6 space-y-4">
                {/* Yearly Plan */}
                <button onClick={() => handleSelectPlan('yearly')} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedPlan === 'yearly' ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-accent-400'}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Yearly</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">$99.99<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/year</span></span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Save 20%</p>
                </button>
                {/* Monthly Plan */}
                 <button onClick={() => handleSelectPlan('monthly')} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedPlan === 'monthly' ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-accent-400'}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Monthly</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">$9.99<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span></span>
                    </div>
                </button>
            </div>
             <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-b-2xl">
                <button onClick={onClose} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:underline">Maybe later</button>
            </div>
        </>
    );

    const CheckoutView = () => (
         <>
            <div className="p-8">
                <button onClick={() => setView('plans')} className="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-4">&larr; Back to plans</button>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">Complete Your Purchase</h2>
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{selectedPlan} Plan</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedPlan === 'yearly' ? '$99.99' : '$9.99'}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan === 'yearly' ? 'Billed once per year' : 'Billed once per month'}</p>
                </div>
                <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">This is a mock payment screen. No real payment will be processed.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-b-2xl">
                 <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 disabled:opacity-50"
                >
                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                </button>
            </div>
        </>
    );


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-fadeIn" onClick={e => e.stopPropagation()}>
                {view === 'plans' ? <PlanView /> : <CheckoutView />}
            </div>
        </div>
    );
};

export default SubscriptionPlanModal;