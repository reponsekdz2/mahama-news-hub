import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../../types.ts';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';

const SiteSettingsManagement: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentSettings = await getSiteSettings();
            setSettings(currentSettings);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load site settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [name]: value,
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !settings) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage('');
        try {
            await updateSiteSettings(settings as SiteSettings, user.token);
            setSuccessMessage('Settings updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            {successMessage && <p className="text-green-600 mb-4 bg-green-100 dark:bg-green-900/50 p-3 rounded-md">{successMessage}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Title</label>
                        <input type="text" name="site_title" value={settings.site_title || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                        <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Media Links</h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Facebook URL</label>
                            <input type="url" name="facebook" value={settings.social_links?.facebook || ''} onChange={handleSocialChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Twitter URL</label>
                            <input type="url" name="twitter" value={settings.social_links?.twitter || ''} onChange={handleSocialChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">LinkedIn URL</label>
                            <input type="url" name="linkedin" value={settings.social_links?.linkedin || ''} onChange={handleSocialChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="allow_registration" name="allow_registration" type="checkbox" checked={!!settings.allow_registration} onChange={handleChange} className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="allow_registration" className="font-medium text-gray-700 dark:text-gray-300">Allow New User Registration</label>
                        <p className="text-gray-500 dark:text-gray-400">If unchecked, the register tab will be hidden from the login modal.</p>
                    </div>
                </div>

                 <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsManagement;