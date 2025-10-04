import React, { useEffect, useRef } from 'react';
import { Advertisement } from '../types.ts';
import { trackAdClick, trackAdImpression } from '../services/adService.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface AdBannerProps {
  ad: Advertisement;
  viewedAds: React.MutableRefObject<Set<string>>;
}

const AdBanner: React.FC<AdBannerProps> = ({ ad, viewedAds }) => {
  const { t } = useLanguage();
  const adRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    trackAdClick(ad.id).catch(err => console.error("Failed to track ad click", err));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedAds.current.has(ad.id)) {
          viewedAds.current.add(ad.id);
          trackAdImpression(ad.id).catch(err => console.error("Failed to track ad impression", err));
          observer.disconnect(); // Track only once per page load
        }
      },
      { threshold: 0.5 } // 50% of the ad must be visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [ad.id, viewedAds]);

  return (
    <div ref={adRef} className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl relative">
      <span className="absolute top-2 right-2 text-xs bg-gray-900 bg-opacity-60 text-white px-2 py-0.5 rounded-full">
        {t('advertisement')}
      </span>
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {/* FIX: Use `assetUrl` instead of `imageUrl` to match the Advertisement type. */}
        <img className="h-48 w-full object-cover" src={ad.assetUrl} alt={ad.title} />
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight truncate">{ad.title}</h3>
        </div>
      </a>
    </div>
  );
};

export default AdBanner;
