import React, { useState, useEffect } from 'react';
import { Advertisement } from '../types.ts';
import { fetchSidebarAds, trackAdClick, trackAdImpression } from '../services/adService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import TrendingArticles from './TrendingArticles.tsx';

interface AsideProps {
    category?: string;
    onSubscribeClick: () => void;
    onArticleSelect: (articleId: string) => void;
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
        
        const currentAdRef = adRef.current;
        if (currentAdRef) observer.observe(currentAdRef);
        return () => {
            if (currentAdRef) {
                observer.unobserve(currentAdRef);
            }
        };
    }, [ad.id, viewedAds]);

    return (
        <div ref={adRef} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-500 ease-in-out">
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block group">
                <p className="text-xs text-gray-400 mb-2 text-right">Advertisement</p>
                <div className="overflow-hidden rounded-md">
                    {ad.adType === 'video' ? (
                        <video 
                            src={ad.assetUrl} 
                            className="w-full h-auto bg-black" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                         />
                    ) : (
                        <img src={ad.assetUrl} alt={ad.title} className="w-full h-auto transition-transform duration-300 group-hover:scale-105" />
                    )}
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-3 group-hover:text-accent-600 dark:group-hover:text-accent-400">{ad.title}</h4>
            </a>
        </div>
    );
};


const Aside: React.FC<AsideProps> = ({ category, onSubscribeClick, onArticleSelect }) => {
    const { hasActiveSubscription } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const viewedAds = React.useRef(new Set<string>());

    useEffect(() => {
        if (!hasActiveSubscription) {
            fetchSidebarAds(category)
                .then(setAds)
                .catch(err => console.error("Failed to fetch sidebar ads", err));
        }
    }, [hasActiveSubscription, category]);
    
    return (
        <div className="space-y-8">
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
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <TrendingArticles onArticleSelect={onArticleSelect} />
            </div>

            {!hasActiveSubscription && ads.length > 0 && ads.map(ad => (
                <AdContainer key={ad.id} ad={ad} viewedAds={viewedAds} />
            ))}
        </div>
    );
};

export default Aside;