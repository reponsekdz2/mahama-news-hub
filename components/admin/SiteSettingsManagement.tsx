import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getSiteSettings, updateSiteSettings, uploadSiteAsset } from '../../services/settingsService.ts';
import Spinner from '../Spinner.tsx';

const SiteSettingsManagement: React.FC = () => {
    const [settings, setSettings] = useState<any>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);


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

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setSettings({
            ...settings,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked.toString() : value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'favicon') => {
        if (e.target.files && e.target.files[0]) {
            if (fileType === 'logo') {
                setLogoFile(e.target.files[0]);
            } else {
                setFaviconFile(e.target.files[0]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            // First, upload files if they exist
            if (logoFile) {
                await uploadSiteAsset('logo', logoFile, user.token);
            }
            if (faviconFile) {
                await uploadSiteAsset('favicon', faviconFile, user.token);
            }

            // Then, update text-based settings
            await updateSiteSettings(settings, user.token);
            
            // Refresh settings from server to get new file URLs
            await fetchSettings();
            setLogoFile(null);
            setFaviconFile(null);

            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };
    
    const SettingInput: React.FC<{name: string, label: string}> = ({name, label}) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input type="text" name={name} id={name} value={settings[name] || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm" />
        </div>
    );

    const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <div className="p-6 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
             <div className="space-y-4">
                {children}
             </div>
        </div>
    );

    if (isLoading) return <Spinner />;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Site Settings</h2>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
            {success && <p className="text-green-600 bg-green-100 dark:bg-green-900/50 p-3 rounded-md text-sm">{success}</p>}
            
            <Section title="Branding">
                <SettingInput name="site_title" label="Site Title" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Logo</label>
                        <div className="mt-2 flex items-center space-x-4">
                            {settings.site_logo_url && <img src={settings.site_logo_url} alt="Logo Preview" className="h-10 w-auto bg-gray-200 dark:bg-gray-700 p-1 rounded" />}
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium">
                                {logoFile ? logoFile.name : 'Upload Logo'}
                            </button>
                            <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Favicon</label>
                        <div className="mt-2 flex items-center space-x-4">
                            {settings.site_favicon_url && <img src={settings.site_favicon_url} alt="Favicon Preview" className="h-10 w-10" />}
                            <button type="button" onClick={() => faviconInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium">
                                {faviconFile ? faviconFile.name : 'Upload Favicon'}
                            </button>
                            <input type="file" ref={faviconInputRef} onChange={(e) => handleFileChange(e, 'favicon')} className="hidden" accept="image/x-icon, image/png, image/svg+xml" />
                        </div>
                    </div>
                </div>
            </Section>
            
            <Section title="General">
                <SettingInput name="site_contact_email" label="Contact Email" />
                <div className="flex items-center">
                    <input type="checkbox" name="maintenance_mode" id="maintenance_mode" checked={settings.maintenance_mode === 'true'} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
                    <label htmlFor="maintenance_mode" className="ml-2 text-gray-700 dark:text-gray-300">Enable Maintenance Mode</label>
                </div>
                 <p className="text-xs text-gray-500 -mt-2">If checked, regular users will see a maintenance page instead of the site.</p>
            </Section>

            <Section title="Content & Comments">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Global Comment Status</label>
                    <select name="global_comment_status" value={settings.global_comment_status || 'open'} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm">
                        <option value="open">Open for all articles</option>
                        <option value="closed">Closed for all articles</option>
                    </select>
                </div>
            </Section>
            
             <Section title="Social & API Keys">
                 <SettingInput name="social_twitter_url" label="Twitter URL" />
                 <SettingInput name="social_facebook_url" label="Facebook URL" />
                 <SettingInput name="social_linkedin_url" label="LinkedIn URL" />
                 <hr className="dark:border-gray-600" />
                 <SettingInput name="api_stripe_key" label="Stripe API Key (Mock)" />
                 <SettingInput name="api_analytics_key" label="Analytics API Key (Mock)" />
            </Section>
        </form>
    );
};

export default SiteSettingsManagement;