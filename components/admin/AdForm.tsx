import React, { useState, useEffect, useRef } from 'react';
import { Advertisement, AdCampaign } from '../../types.ts';
import { createAd, updateAd } from '../../services/adService.ts';
import { fetchCampaigns } from '../../services/campaignService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface AdFormProps {
    adToEdit?: Advertisement | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

const AdForm: React.FC<AdFormProps> = ({ adToEdit, onFormSubmit, onCancel }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [status, setStatus] = useState<'active' | 'paused'>('active');
    const [campaignId, setCampaignId] = useState('');
    const [adType, setAdType] = useState<'image' | 'video'>('image');
    const [asset, setAsset] = useState<File | null>(null);
    const [assetPreview, setAssetPreview] = useState<string | null>(null);
    
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const assetInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.token) {
            fetchCampaigns(user.token).then(setCampaigns).catch(console.error);
        }
    }, [user?.token]);

    useEffect(() => {
        if (adToEdit) {
            setTitle(adToEdit.title);
            setLinkUrl(adToEdit.linkUrl);
            setStatus(adToEdit.status);
            setCampaignId(adToEdit.campaignId);
            setAdType(adToEdit.adType);
            setAssetPreview(adToEdit.assetUrl);
        }
    }, [adToEdit]);

    const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAsset(file);
            setAssetPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user?.token) return;

        const formPayload = new FormData();
        formPayload.append('title', title);
        formPayload.append('linkUrl', linkUrl);
        formPayload.append('status', status);
        formPayload.append('campaignId', campaignId);
        formPayload.append('adType', adType);
        
        if (asset) {
            formPayload.append('asset', asset);
        } else if (adToEdit?.assetUrl) {
            formPayload.append('assetUrl', adToEdit.assetUrl);
        }
        
        setIsLoading(true);
        setError('');
        try {
            if (adToEdit?.id) {
                await updateAd(adToEdit.id, formPayload, user.token);
            } else {
                await createAd(formPayload, user.token);
            }
            onFormSubmit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save ad.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h2 className="text-xl font-bold">{adToEdit ? 'Edit' : 'Create'} Advertisement</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium">Campaign</label>
                    <select value={campaignId} onChange={e => setCampaignId(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="">Select a Campaign</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Link URL</label>
                    <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Ad Type</label>
                    <select value={adType} onChange={e => setAdType(e.target.value as any)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Creative Asset</label>
                <div className="mt-2 flex items-center space-x-4">
                    {assetPreview && adType === 'image' && <img src={assetPreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />}
                    {assetPreview && adType === 'video' && <video src={assetPreview} className="w-32 h-20 bg-black object-cover rounded-md" />}
                    <button type="button" onClick={() => assetInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium">
                        Upload Asset
                    </button>
                    <input type="file" accept={adType === 'image' ? 'image/*' : 'video/*'} ref={assetInputRef} onChange={handleAssetChange} className="hidden" />
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Ad'}
                </button>
            </div>
        </form>
    );
};

export default AdForm;