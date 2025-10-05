import React, { useState } from 'react';
import CampaignManagement from './CampaignManagement.tsx';
import AdvertisementManagement from './AdvertisementManagement.tsx';
import NewsletterForm from './NewsletterForm.tsx';
import NewsletterHistory from './NewsletterHistory.tsx';

type MarketingView = 'campaigns' | 'ads' | 'newsletter';

const MarketingManagement: React.FC = () => {
    const [view, setView] = useState<MarketingView>('campaigns');

    const TabButton: React.FC<{ targetView: MarketingView, label: string }> = ({ targetView, label }) => (
        <button
            onClick={() => setView(targetView)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
                view === targetView
                ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {label}
        </button>
    );

    const renderNewsletterView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <NewsletterForm onCampaignSent={() => { /* Could add a refresh mechanism here */ }}/>
            </div>
            <div>
                 <NewsletterHistory />
            </div>
        </div>
    );

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton targetView="campaigns" label="Ad Campaigns" />
                    <TabButton targetView="ads" label="Advertisements" />
                    <TabButton targetView="newsletter" label="Newsletter" />
                </nav>
            </div>
            
            <div>
                {view === 'campaigns' && <CampaignManagement />}
                {view === 'ads' && <AdvertisementManagement />}
                {view === 'newsletter' && renderNewsletterView()}
            </div>
        </div>
    );
};

export default MarketingManagement;
