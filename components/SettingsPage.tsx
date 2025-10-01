import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSettings, availableColors, ACCENT_COLORS } from '../contexts/SettingsContext.tsx';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
// Fix: Renamed 'getUserPreferences' to 'getPreferences' to match the exported function name.
import { updateUserProfile, changePassword, getPreferences, updatePreference } from '../services/userService.ts';
import { UserPreferences } from '../types.ts';

interface SettingsPageProps {
  onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateBack }) => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [newsletter, setNewsletter] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (user?.token) {
        // Fix: Call 'getPreferences' instead of the non-existent 'getUserPreferences'.
        const prefs = await getPreferences(user.token);
        setContentPreferences(prefs.contentPreferences || []);
        setNewsletter(prefs.newsletter || false);
      }
    };
    fetchPrefs();
  }, [user?.token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
        const updatedUser = await updateUserProfile(user.id, { name, email }, user.token);
        updateUser(updatedUser);
        setMessage('Profile updated successfully!');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
        setIsLoading(false);
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        return;
    }
    if (!user?.token) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
        const response = await changePassword(user.id, { currentPassword, newPassword }, user.token);
        setMessage(response.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
        setIsLoading(false);
    }
  }
  
   const handlePreferenceChange = async (key: keyof UserPreferences, value: any) => {
    if (!user?.token) return;
    try {
      await updatePreference(key, value, user.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${key}.`);
    }
  };
  
  const handleContentPrefToggle = (category: string) => {
      const newPrefs = contentPreferences.includes(category)
          ? contentPreferences.filter(c => c !== category)
          : [...contentPreferences, category];
      setContentPreferences(newPrefs);
      handlePreferenceChange('contentPreferences', newPrefs);
  }
  
  const handleNewsletterToggle = () => {
      const newValue = !newsletter;
      setNewsletter(newValue);
      handlePreferenceChange('newsletter', newValue);
  }

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{title}</h2>
          {children}
      </div>
  )

  return (
    <div className="my-6 md:my-8 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{t('settings')}</h1>
        <button onClick={onNavigateBack} className="text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">
            &larr; {t('backToNews')}
        </button>
      </div>

      {message && <p className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md">{message}</p>}
      {error && <p className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Section title={t('profileInformation')}>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50 flex items-center justify-center">
                        {isLoading ? 'Saving...' : t('saveProfile')}
                    </button>
                </form>
            </Section>
            
            <Section title={t('changePassword')}>
                 <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('currentPassword')}</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('newPassword')}</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" required minLength={6} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirmNewPassword')}</label>
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50 flex items-center justify-center">
                        {isLoading ? 'Saving...' : t('changePassword')}
                    </button>
                </form>
            </Section>
        </div>
        <div className="space-y-8">
            <Section title={t('appearance')}>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{t('darkMode')}</span>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-accent-600' : 'bg-gray-300'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div>
                        <span className="text-gray-700 dark:text-gray-300">{t('accentColor')}</span>
                        <div className="flex flex-wrap gap-3 mt-2">
                            {availableColors.map(color => (
                            <button
                                key={color}
                                onClick={() => setAccentColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${accentColor === color ? 'border-accent-500 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: `rgb(${ACCENT_COLORS[color]['500']})` }}
                                aria-label={`Set accent color to ${color}`}
                            />
                            ))}
                        </div>
                    </div>
                     <div>
                        <span className="text-gray-700 dark:text-gray-300">{t('language')}</span>
                         <div className="flex items-center space-x-2 mt-2">
                            {(['en', 'fr', 'rw'] as const).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === lang ? 'bg-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                            >
                                {lang.toUpperCase()}
                            </button>
                            ))}
                        </div>
                    </div>
                 </div>
            </Section>
             <Section title={t('contentPreferences')}>
                  <div className="flex flex-wrap gap-2">
                      {CATEGORIES.filter(c => c !== 'Top Stories').map(cat => (
                          <button key={cat} onClick={() => handleContentPrefToggle(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${contentPreferences.includes(cat) ? 'bg-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                              {t(cat as any)}
                          </button>
                      ))}
                  </div>
            </Section>
            <Section title={t('notifications')}>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{t('emailNewsletter')}</span>
                    <button onClick={handleNewsletterToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${newsletter ? 'bg-accent-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${newsletter ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;