import React, { useState, useEffect, useCallback } from 'react';
import { Advertisement } from '../../types.ts';
import { fetchAds, createAd, updateAd, deleteAd } from '../../services/adService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import AdForm from './AdForm.tsx';

const AdManagement: React.FC = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleNewAd = () => {
        setEditingAd(null);
        setIsFormOpen(true);
    };

    const handleEdit = (ad: Advertisement) => {
        setEditingAd(ad);
        setIsFormOpen(true);
    };

    const handleDelete = async (adId: string) => {
        if (!user?.token || !window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            await deleteAd(adId, user.token);
            setAds(prev => prev.filter(a => a.id !== adId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete ad.');
        }
    };
    
    const handleFormSubmit = async (formData: FormData) => {
        if (!user?.token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingAd) {
                await updateAd(editingAd.id, formData, user.token);
            } else {
                await createAd(formData, user.token);
            }
            setIsFormOpen(false);
            setEditingAd(null);
            loadAds(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save ad.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            {isFormOpen && (
                <AdForm
                    adToEdit={editingAd}
                    onFormSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold">Manage Advertisements ({ads.length})</h2>
                <button onClick={handleNewAd} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                    + New Ad
                </button>
            </div>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
             <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions / Clicks</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {ads.map(ad => (
                            <tr key={ad.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={ad.title}>{ad.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {ad.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{ad.impressions} / {ad.clicks}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => handleEdit(ad)} className="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-300">Edit</button>
                                    <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdManagement;
