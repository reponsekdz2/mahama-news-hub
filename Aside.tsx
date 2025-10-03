import React, { useState, useEffect } from 'react';
import { Advertisement } from './types.ts';
import { fetchSidebarAds } from './services/adService.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import AdBanner from './components/AdBanner.tsx';

interface AsideProps {
    onSubscribeClick: () => void;
}

const Aside: React.FC<AsideProps> = ({ onSubscribeClick }) => {
    const { hasActiveSubscription } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const viewedAds = React.useRef(new Set<string>());
    const [email, setEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');

    useEffect(() => {
        if (!hasActiveSubscription) {
            fetchSidebarAds()
                .then(setAds)
                .catch(err => console.error("Failed to fetch sidebar ads", err));
        }
    }, [hasActiveSubscription]);
    
    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call a service here.
        setNewsletterMessage(`Thanks for subscribing, ${email}!`);
        setEmail('');
    }

    return (
        <div className="space-y-6">
            {!hasActiveSubscription && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-accent-500 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Go Premium!</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Unlock all articles and enjoy an ad-free experience.
                    </p>
                    <button 
                        onClick={onSubscribeClick}
                        className="mt-4 w-full bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors"
                    >
                        Subscribe Now
                    </button>
                </div>
            )}
            
            {!hasActiveSubscription && ads.map(ad => (
                <AdBanner key={ad.id} ad={ad} viewedAds={viewedAds} />
            ))}

             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Newsletter</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get the latest news delivered to your inbox.</p>
                <form onSubmit={handleNewsletterSubmit}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your.email@example.com" className="mt-3 w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 bg-white dark:bg-gray-700" />
                    <button type="submit" className="mt-2 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors">
                        Sign Up
                    </button>
                </form>
                {newsletterMessage && <p className="text-xs text-green-600 mt-2 text-center">{newsletterMessage}</p>}
            </div>
        </div>
    );
};

export default Aside;
