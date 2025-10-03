import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService.ts';
import Spinner from '../Spinner.tsx';

const SiteSettingsManagement: React.FC = () => {
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const siteSettings = await getSiteSettings();
                setSettings(siteSettings);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setSettings({
            ...settings,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateSiteSettings(settings, user.token);
            setSuccess('Settings saved successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold">Site Settings</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            
            <div className="p-4 border rounded-md dark:border-gray-700">
                <label className="flex items-center">
                    <input type="checkbox" name="maintenance_mode" checked={settings.maintenance_mode || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Enable Maintenance Mode</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">If checked, regular users will see a maintenance page instead of the site.</p>
            </div>
            
            <div className="flex justify-end">
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
};

export default SiteSettingsManagement;
