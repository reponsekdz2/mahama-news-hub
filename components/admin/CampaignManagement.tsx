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
                        <button onClick={() => handleOpenForm()} className="btn btn-primary">
                            Create New Campaign
                        </button>
                    </div>
                    {error && <p className="admin-error-box">{error}</p>}
                    <div className="overflow-x-auto card">
                         <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Dates</th>
                                    <th>Budget</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                             <tbody>
                                {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td className="font-medium text-gray-900 dark:text-white">{c.name}</td>
                                    <td>{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</td>
                                    <td>${c.budget.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge capitalize ${
                                            c.status === 'active' ? 'badge-published' : 
                                            c.status === 'paused' ? 'badge-draft' : 
                                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="text-right font-medium space-x-4">
                                        <button onClick={() => handleOpenForm(c)} className="btn-text-accent">Edit</button>
                                        <button onClick={() => handleDelete(c.id)} className="btn-text-danger">Delete</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        {campaigns.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No campaigns found. Create one to get started.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CampaignManagement;
