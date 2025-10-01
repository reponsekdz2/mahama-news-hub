import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSettings, availableColors, ACCENT_COLORS } from '../contexts/SettingsContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { updateUserProfile, changePassword } from '../services/userService.ts';

interface SettingsPageProps {
  onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateBack }) => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
        const updatedUser = await updateUserProfile(user.id, { name, email }, user.token);
        updateUser(updatedUser); // Update context
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

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{title}</h2>
          {children}
      </div>
  )

  return (
    <div className="my-6 md:my-8 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <button onClick={onNavigateBack} className="text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">
            &larr; Back to News
        </button>
      </div>

      {message && <p className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md">{message}</p>}
      {error && <p className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Section title="Profile Information">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 input-field" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 input-field" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full btn-primary">
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </Section>
            
            <Section title="Change Password">
                 <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 input-field" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 input-field" required minLength={6} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 input-field" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full btn-primary">
                        {isLoading ? 'Saving...' : 'Change Password'}
                    </button>
                </form>
            </Section>
        </div>
        <div className="space-y-8">
            <Section title="Appearance">
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
                 </div>
            </Section>
             <Section title="Language">
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
            </Section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
