import React, { useState, useEffect } from 'react';
import { Advertisement } from '../types.ts';
import { fetchSidebarAds, trackAdClick, trackAdImpression } from '../services/adService.ts';
import { subscribeToNewsletter } from '../services/userService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface AsideProps {
    category?: string;
    onSubscribeClick: () => void;
}

const AdContainer: React.FC<{ad: Advertisement, viewedAds: React.MutableRefObject<Set<string>>}> = ({ ad, viewedAds }) => {
    const adRef = React.useRef<HTMLDivElement>(null);
    
    const trackClick = () => {
        trackAdClick(ad.id).catch(err => console.error("Failed to track ad click", err));
    };

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !viewedAds.current.has(ad.id)) {
                viewedAds.current.add(ad.id);
                trackAdImpression(ad.id).catch(err => console.error("Failed to track ad impression", err));
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        
        if (adRef.current) observer.observe(adRef.current);
        return () => {
            if (adRef.current) {
                // Ensure adRef.current is not null before trying to unobserve
                observer.unobserve(adRef.current);
            }
        };
    }, [ad.id, viewedAds]);

    return (
        <div ref={adRef} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-500 ease-in-out">
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick}>
                <p className="text-xs text-gray-400 mb-2 text-right">Advertisement</p>
                {ad.adType === 'video' ? (
                     <video 
                        src={ad.assetUrl} 
                        className="w-full h-auto rounded-md bg-black" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                     />
                ) : (
                    <img src={ad.assetUrl} alt={ad.title} className="w-full h-auto rounded-md" />
                )}
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-3">{ad.title}</h4>
            </a>
        </div>
    );
};


const Aside: React.FC<AsideProps> = ({ category, onSubscribeClick }) => {
    const { user, hasActiveSubscription } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const viewedAds = React.useRef(new Set<string>());
    
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        if (!hasActiveSubscription) {
            fetchSidebarAds(category)
                .then(setAds)
                .catch(err => console.error("Failed to fetch sidebar ads", err));
        }
    }, [hasActiveSubscription, category]);
    
    useEffect(() => {
        if (ads.length > 1) {
            const timer = setInterval(() => {
                setCurrentAdIndex(prevIndex => (prevIndex + 1) % ads.length);
            }, 15000); // Rotate every 15 seconds
            return () => clearInterval(timer);
        }
    }, [ads.length]);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setIsSubscribing(true);
        setNewsletterMessage('Subscribing...');
        try {
            const response = await subscribeToNewsletter(newsletterEmail, user?.token);
            setNewsletterMessage(response.message);
            setNewsletterEmail('');
        } catch (err) {
            setNewsletterMessage(err instanceof Error ? err.message : 'Subscription failed.');
        } finally {
            setIsSubscribing(false);
            setTimeout(() => setNewsletterMessage(''), 5000);
        }
    };
    
    const currentAd = ads[currentAdIndex];

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
            
            {!hasActiveSubscription && currentAd && (
                <AdContainer key={currentAd.id} ad={currentAd} viewedAds={viewedAds} />
            )}

             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Newsletter</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get the latest news delivered to your inbox.</p>
                <form onSubmit={handleNewsletterSubmit}>
                    <input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        className="mt-3 w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 bg-white dark:bg-gray-700" 
                    />
                    <button type="submit" disabled={isSubscribing} className="mt-2 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors disabled:opacity-50">
                        {isSubscribing ? 'Submitting...' : 'Sign Up'}
                    </button>
                </form>
                {newsletterMessage && <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">{newsletterMessage}</p>}
            </div>
        </div>
    );
};

export default Aside;