import React, { useState, useEffect, useCallback } from 'react';
import { AdCampaign } from '../../types.ts';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../../services/campaignService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import AdCampaignForm from './AdCampaignForm.tsx';

const CampaignManagement: React.FC = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<AdCampaign | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadCampaigns = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const allCampaigns = await fetchCampaigns(user.token);
            setCampaigns(allCampaigns);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load campaigns.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const handleDelete = async (id: string) => {
        if (!user?.token || !window.confirm('Are you sure? This will also delete all ads in this campaign.')) return;
        try {
            await deleteCampaign(id, user.token);
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete campaign.');
        }
    };

    const handleOpenForm = (campaign?: AdCampaign) => {
        setCampaignToEdit(campaign || null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: Omit<AdCampaign, 'id'>, id?: string) => {
        if (!user?.token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (id) {
                await updateCampaign(id, data, user.token);
            } else {
                await createCampaign(data, user.token);
            }
            setIsFormOpen(false);
            loadCampaigns();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save campaign.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div>
            {isFormOpen ? (
                <AdCampaignForm
                    campaignToEdit={campaignToEdit}
                    onFormSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Ad Campaigns ({campaigns.length})</h2>
                        <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                            Create New Campaign
                        </button>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{c.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">${c.budget.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{c.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenForm(c)} className="text-accent-600 hover:text-accent-900">Edit</button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default CampaignManagement;