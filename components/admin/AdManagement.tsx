import React, { useState } from 'react';
import CampaignManagement from './CampaignManagement.tsx';
import AdvertisementManagement from './AdvertisementManagement.tsx';

type AdView = 'campaigns' | 'ads';

const AdManagement: React.FC = () => {
    const [view, setView] = useState<AdView>('campaigns');

    const TabButton: React.FC<{ targetView: AdView, label: string }> = ({ targetView, label }) => (
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

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton targetView="campaigns" label="Campaigns" />
                    <TabButton targetView="ads" label="Advertisements" />
                </nav>
            </div>
            
            <div>
                {view === 'campaigns' ? <CampaignManagement /> : <AdvertisementManagement />}
            </div>
        </div>
    );
};

export default AdManagement;