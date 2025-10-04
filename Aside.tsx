import React, { useState, useEffect } from 'react';
import { Advertisement } from './types.ts';
import { fetchSidebarAds } from './services/adService.ts';
import { useAuth } from './contexts/AuthContext.tsx';

interface AsideProps {
    category?: string;
    onSubscribeClick: () => void;
}

const AdContainer: React.FC<{ad: Advertisement}> = ({ ad }) => {
    const [impressionTracked, setImpressionTracked] = useState(false);
    const adRef = React.useRef<HTMLDivElement>(null);
    
    // In a real app, you would also track clicks
    // const trackClick = () => trackAdClick(ad.id);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !impressionTracked) {
                // trackAdImpression(ad.id);
                setImpressionTracked(true);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        
        if (adRef.current) observer.observe(adRef.current);
        return () => observer.disconnect();
    }, [ad.id, impressionTracked]);

    return (
        <div ref={adRef} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-500 ease-in-out">
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
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
    const { hasActiveSubscription } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

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

    const currentAd = ads[currentAdIndex];

    return (
        <>
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
                <AdContainer key={currentAd.id} ad={currentAd} />
            )}
        </>
    );
};

export default Aside;