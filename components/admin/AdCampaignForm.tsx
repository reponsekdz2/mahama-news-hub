import React, { useState, useEffect } from 'react';
import { AdCampaign } from '../../types.ts';
import { useLanguage, CATEGORIES } from '../../contexts/LanguageContext.tsx';

interface AdCampaignFormProps {
    campaignToEdit?: AdCampaign | null;
    onFormSubmit: (campaignData: Omit<AdCampaign, 'id'>, campaignId?: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const AdCampaignForm: React.FC<AdCampaignFormProps> = ({ campaignToEdit, onFormSubmit, onCancel, isLoading }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState(0);
    const [status, setStatus] = useState<'active' | 'paused' | 'completed'>('active');
    const [targetCategories, setTargetCategories] = useState<string[]>([]);
    
    const availableCategories = CATEGORIES.filter(c => c !== 'Top Stories');

    useEffect(() => {
        if (campaignToEdit) {
            setName(campaignToEdit.name);
            setStartDate(campaignToEdit.startDate.split('T')[0]);
            setEndDate(campaignToEdit.endDate.split('T')[0]);
            setBudget(campaignToEdit.budget);
            setStatus(campaignToEdit.status);
            setTargetCategories(campaignToEdit.targetCategories);
        } else {
            setName('');
            setStartDate('');
            setEndDate('');
            setBudget(0);
            setStatus('active');
            setTargetCategories([]);
        }
    }, [campaignToEdit]);

    const handleCategoryToggle = (category: string) => {
        setTargetCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFormSubmit({ name, startDate, endDate, budget, status, targetCategories }, campaignToEdit?.id);
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h2 className="text-xl font-bold">{campaignToEdit ? 'Edit' : 'Create'} Ad Campaign</h2>
            <div>
                <label className="block text-sm font-medium">Campaign Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium">Budget ($)</label>
                    <input type="number" step="0.01" value={budget} onChange={e => setBudget(parseFloat(e.target.value) || 0)} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Target Categories (Optional)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {availableCategories.map(cat => (
                        <button type="button" key={cat} onClick={() => handleCategoryToggle(cat)} className={`px-3 py-1 text-sm rounded-full border ${targetCategories.includes(cat) ? 'bg-accent-500 text-white border-accent-500' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                            {t(cat as any)}
                        </button>
                    ))}
                </div>
            </div>
             <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Campaign'}
                </button>
            </div>
        </form>
    );
};
export default AdCampaignForm;