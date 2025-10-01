import React, { useState } from 'react';
import { useSettings, availableColors, ACCENT_COLORS } from '../contexts/SettingsContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { updateProfile } from '../services/userService.ts';
import DeleteAccountModal from './DeleteAccountModal.tsx';

interface SettingsPageProps {
  onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateBack }) => {
  const { theme, setTheme, accentColor, setAccentColor } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const { user, updateUser, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    if (password && password !== confirmPassword) {
      setUpdateMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      const payload: { name?: string; email?: string; password?: string } = {};
      if (name !== user.name) payload.name = name;
      if (email !== user.email) payload.email = email;
      if (password) payload.password = password;

      if (Object.keys(payload).length > 0) {
        const updatedUser = await updateProfile(payload, user.token);
        updateUser(updatedUser);
      }
      setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="border-t dark:border-gray-700 pt-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      {children}
    </div>
  )

  return (
    <>
    {isDeleteModalOpen && <DeleteAccountModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={logout} />}
    <div className="my-6 md:my-8 fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{t('settings')}</h1>
        <button onClick={onNavigateBack} className="text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">&larr; {t('backToNews')}</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        {/* Appearance Settings */}
        <h2 className="text-xl font-bold mb-4">Appearance</h2>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{t('darkMode')}</span>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-accent-600' : 'bg-gray-200'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t('accentColor')}</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableColors.map(color => (
                  <button key={color} onClick={() => setAccentColor(color)} className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${accentColor === color ? 'border-accent-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: `rgb(${ACCENT_COLORS[color]['500']})` }} aria-label={`Set accent color to ${color}`} />
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t('language')}</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="mt-2 block w-full max-w-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>
        </div>

        {/* Profile Settings */}
        <Section title="Profile">
           <form onSubmit={handleProfileUpdate} className="space-y-4">
               {updateMessage && <p className={`text-sm p-3 rounded-md ${updateMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700' : 'bg-red-100 dark:bg-red-900/50 text-red-700'}`}>{updateMessage.text}</p>}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                 </div>
               </div>
               <div className="flex justify-end">
                <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
               </div>
           </form>
        </Section>
        
        {/* Danger Zone */}
        <Section title="Danger Zone">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Delete Account</h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete My Account</button>
            </div>
        </Section>

      </div>
    </div>
    </>
  );
};

export default SettingsPage;
