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
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  useEffect(() => {
    // Reset forms when modal opens or tab changes
    if (isOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email: loginEmail, password: loginPassword });
    login({ name: 'User', email: loginEmail }); // Simulate login
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    console.log("Registration attempt:", { name: registerName, email: registerEmail, password: registerPassword });
    login({ name: registerName, email: registerEmail }); // Simulate registration and login
    onClose();
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex border-b dark:border-gray-700 mb-6">
            <TabButton tab="login" label={t('login')} />
            <TabButton tab="register" label={t('register')} />
          </div>

          {activeTab === 'login' ? (
            <div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">{t('loginToYourAccount')}</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')}</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800">{t('loginCTA')}</button>
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
                  <input type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailAddress')}</label>
                  <input type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                  <input type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirmPassword')}</label>
                  <input type="password" value={registerConfirmPassword} onChange={e => setRegisterConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm bg-white dark:bg-gray-700" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-800">{t('registerCTA')}</button>
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
