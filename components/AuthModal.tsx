import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { loginUser, registerUser } from '../services/authService.ts';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login } = useAuth();
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await loginUser(email, password);
            login(data);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const data = await registerUser(name, email, password);
            login(data);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {isLoginView ? t('loginToYourAccount') : t('createAnAccount')}
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                    </div>

                    {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
                    
                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t('emailAddress')}</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('password')}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-accent-600 text-white py-2 rounded-md hover:bg-accent-700 disabled:opacity-50">
                                {isLoading ? 'Logging in...' : t('loginCTA')}
                            </button>
                            <p className="text-sm text-center">
                                {t('dontHaveAccount')} <button type="button" onClick={() => setIsLoginView(false)} className="text-accent-600 hover:underline">{t('register')}</button>
                            </p>
                        </form>
                    ) : (
                         <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t('fullName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('emailAddress')}</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('password')}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                             <div>
                                <label className="text-sm font-medium">{t('confirmPassword')}</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-accent-600 text-white py-2 rounded-md hover:bg-accent-700 disabled:opacity-50">
                                {isLoading ? 'Creating account...' : t('registerCTA')}
                            </button>
                             <p className="text-sm text-center">
                                {t('alreadyHaveAccount')} <button type="button" onClick={() => setIsLoginView(true)} className="text-accent-600 hover:underline">{t('login')}</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
