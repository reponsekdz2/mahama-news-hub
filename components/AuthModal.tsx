import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveTab = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      setError(null);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleApiResponse = (data: any) => {
      if (data.user && data.token) {
        login({ ...data.user, token: data.token });
        onClose();
      } else {
        setError(data.message || 'An unknown error occurred.');
      }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        handleApiResponse(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        handleApiResponse(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
        setIsLoading(false);
    }
  };

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-1/2 pb-2 font-semibold text-sm focus:outline-none transition-all duration-300 ${activeTab === tab ? 'border-b-2 border-accent-500 text-accent-600 dark:text-accent-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-end">
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -mt-2 -mr-2 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24/24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex border-b dark:border-gray-700 mb-6">
            <TabButton tab="login" label={t('login')} />
            <TabButton tab="register" label={t('register')} />
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

          {activeTab === 'login' ? (
            <div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">{t('loginToYourAccount')}</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800 disabled:opacity-50">{isLoading ? 'Logging in...' : t('loginCTA')}</button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {t('dontHaveAccount')}{' '}
                <button onClick={() => setActiveTab('register')} className="font-medium text-accent-600 hover:text-accent-500">{t('register')}</button>
              </p>
            </div>
          ) : (
             <div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">{t('createAnAccount')}</h2>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirmPassword')}</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800 disabled:opacity-50">{isLoading ? 'Creating Account...' : t('registerCTA')}</button>
              </form>
               <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {t('alreadyHaveAccount')}{' '}
                <button onClick={() => setActiveTab('login')} className="font-medium text-accent-600 hover:text-accent-500">{t('login')}</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
