import React, { useState, useEffect } from 'react';
import { Advertisement } from '../types.ts';
import { fetchSidebarAds, trackAdClick, trackAdImpression } from '../services/adService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import TrendingArticles from './TrendingArticles.tsx';
import { fetchTags } from '../services/tagService.ts';

interface Tag { id: number; name: string; }

interface AsideProps {
    category?: string;
    onSubscribeClick: () => void;
    onArticleSelect: (articleId: string) => void;
    onTagSelect: (tag: string) => void;
}

const AdContainer: React.FC<{ad: Advertisement, viewedAds: React.MutableRefObject<Set<string>>}> = ({ ad, viewedAds }) => {
    const adRef = React.useRef<HTMLDivElement>(null);
    
    const trackClick = () => {
        trackAdClick(ad.id).catch(err => console.error("Failed to track ad click", err));
    };

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!viewedAds.current.has(ad.id)) {
                    viewedAds.current.add(ad.id);
                    trackAdImpression(ad.id).catch(err => console.error("Failed to track ad impression", err));
                }
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        
        const currentAdRef = adRef.current;
        if (currentAdRef) observer.observe(currentAdRef);
        return () => {
            if (currentAdRef) {
                observer.unobserve(currentAdRef);
            }
        };
    }, [ad.id, viewedAds]);

    return (
        <div ref={adRef}>
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block group">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-right">Advertisement</p>
                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 group-hover:shadow-lg transition-shadow">
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
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-3 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{ad.title}</h4>
            </a>
        </div>
    );
};

const TagCloud: React.FC<{ onTagSelect: (tag: string) => void }> = ({ onTagSelect }) => {
    const [tags, setTags] = useState<Tag[]>([]);
    useEffect(() => {
        fetchTags().then(fetchedTags => setTags(fetchedTags.slice(0, 15))).catch(console.error);
    }, []);

    if (tags.length === 0) return null;

    return (
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h3 className="pb-3 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">Popular Tags</h3>
            <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                    <button 
                        key={tag.id} 
                        onClick={() => onTagSelect(tag.name)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                    >
                        {tag.name}
                    </button>
                ))}
            </div>
        </div>
    )
}


const Aside: React.FC<AsideProps> = ({ category, onSubscribeClick, onArticleSelect, onTagSelect }) => {
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
                <div className="p-6 text-center bg-gradient-to-br from-accent-50 to-white dark:from-accent-900/30 dark:to-gray-800 border-2 border-accent-400 dark:border-accent-600 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Go Premium!</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Unlock all articles and enjoy an ad-free experience.
                    </p>
                    <button 
                        onClick={onSubscribeClick}
                        className="mt-4 w-full px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 transition-transform hover:scale-105"
                    >
                        Subscribe Now
                    </button>
                </div>
            )}
            
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                 <TrendingArticles onArticleSelect={onArticleSelect} />
            </div>

            <TagCloud onTagSelect={onTagSelect} />

            {!hasActiveSubscription && ads.length > 0 && ads.map(ad => (
                <div key={ad.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-shadow hover:shadow-accent-500/20">
                    <AdContainer ad={ad} viewedAds={viewedAds} />
                </div>
            ))}
        </div>
    );
};

export default Aside;
