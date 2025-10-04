import React, { useState, useEffect, useCallback } from 'react';
import { Advertisement } from '../../types.ts';
import { fetchAds, deleteAd } from '../../services/adService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import AdForm from './AdForm.tsx';

const AdvertisementManagement: React.FC = () => {
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
            setError(err instanceof Error ? err.message : 'Failed to load ads.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadAds();
    }, [loadAds]);

    const handleDelete = async (id: string) => {
        if (!user?.token || !window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            await deleteAd(id, user.token);
            setAds(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete ad.');
        }
    };

    const handleOpenForm = (ad?: Advertisement) => {
        setAdToEdit(ad || null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setAdToEdit(null);
        loadAds();
    };
    
    const handleCancel = () => {
        setIsFormOpen(false);
        setAdToEdit(null);
    }

    if (isLoading) return <Spinner />;

    return (
        <div>
            {isFormOpen ? (
                <AdForm
                    adToEdit={adToEdit}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                />
            ) : (
                 <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Advertisements ({ads.length})</h2>
                        <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                            Create New Ad
                        </button>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {ads.map(ad => (
                                <tr key={ad.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{ad.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{ad.adType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{ad.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenForm(ad)} className="text-accent-600 hover:text-accent-900">Edit</button>
                                        <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdvertisementManagement;
