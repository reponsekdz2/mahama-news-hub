import React, { useState, useEffect, useCallback } from 'react';
import { Advertisement } from '../../types.ts';
import { fetchAds, deleteAd } from '../../services/adService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import AdForm from './AdForm.tsx';

const AdManagement: React.FC = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [adToEdit, setAdToEdit] = useState<Advertisement | null>(null);

    const loadAds = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const allAds = await fetchAds(user.token);
            setAds(allAds);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load advertisements.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadAds();
    }, [loadAds]);
    
    const handleOpenForm = (ad?: Advertisement) => {
        setAdToEdit(ad || null);
        setIsFormOpen(true);
    };

    const handleDelete = async (adId: string) => {
        if(!user?.token || !window.confirm('Delete this ad?')) return;
        try {
            await deleteAd(adId, user.token);
            setAds(prev => prev.filter(ad => ad.id !== adId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete ad.');
        }
    };
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            {isFormOpen ? (
                <AdForm 
                    adToEdit={adToEdit}
                    onFormSubmit={() => { setIsFormOpen(false); loadAds(); }}
                    onCancel={() => setIsFormOpen(false)}
                />
            ) : (
                 <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Ads ({ads.length})</h2>
                        <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                            Create New Ad
                        </button>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                         {/* Table of ads will be rendered here */}
                         <p className="p-4 text-center">Advertisement list display is not implemented yet.</p>
                    </div>
                 </>
            )}
        </div>
    );
};

export default AdManagement;
