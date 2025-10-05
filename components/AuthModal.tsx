import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { loginUser, registerUser, googleSignIn } from '../services/authService.ts';

// Add type definitions for Google Identity Services to avoid TypeScript errors.
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: object) => void;
                    renderButton: (parent: HTMLElement, options: object) => void;
                    prompt: () => void;
                }
            }
        }
    }
}


interface AuthModalProps {
    onClose: () => void;
}

// Simple JWT decoder
const decodeJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
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

    const handleGoogleCallback = async (response: any) => {
        setIsLoading(true);
        setError('');
        const decoded = decodeJwt(response.credential);
        if (decoded) {
             try {
                const data = await googleSignIn(decoded.email, decoded.name);
                login(data);
                onClose();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Google sign-in failed');
            } finally {
                setIsLoading(false);
            }
        } else {
             setError('Failed to process Google sign-in. Please try again.');
             setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Initialize Google Sign-In button
        if (window.google) {
            window.google.accounts.id.initialize({
                // IMPORTANT: You must replace this with your actual Google Client ID
                client_id: document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]')?.content || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                callback: handleGoogleCallback
            });
            const googleButton = document.getElementById('google-signin-button');
            if (googleButton) {
                window.google.accounts.id.renderButton(
                    googleButton,
                    { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', width: '300' }
                );
            }
        }
    }, []);

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

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    }

    const renderFormContent = () => {
        const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

        if (isLoginView) {
            return (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className={labelClasses}>{t('emailAddress')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>{t('password')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClasses} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50">
                        {isLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white"></span> : t('loginCTA')}
                    </button>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        {t('dontHaveAccount')} <button type="button" onClick={toggleView} className="font-semibold text-accent-600 hover:underline">{t('register')}</button>
                    </p>
                </form>
            )
        }
        return (
            <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                    <label className={labelClasses}>{t('fullName')}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>{t('emailAddress')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>{t('password')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClasses} />
                </div>
                 <div>
                    <label className={labelClasses}>{t('confirmPassword')}</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClasses} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50">
                    {isLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white"></span> : t('registerCTA')}
                </button>
                 <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    {t('alreadyHaveAccount')} <button type="button" onClick={toggleView} className="font-semibold text-accent-600 hover:underline">{t('login')}</button>
                </p>
            </form>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden grid md:grid-cols-2" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 z-10">&times;</button>

                <div className="hidden md:flex flex-col justify-center p-12 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">
                        {isLoginView ? "Welcome Back" : "Join Us Today"}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isLoginView 
                            ? "Sign in to access your personalized feed, saved articles, and more." 
                            : "Create an account to unlock all features and start your journey with us."
                        }
                    </p>
                </div>
                
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                        {isLoginView ? t('loginToYourAccount') : t('createAnAccount')}
                    </h3>

                    {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm my-4">{error}</p>}
                    
                    <div className="mt-6 space-y-4">
                        <div id="google-signin-button" className="flex justify-center"></div>
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-sm text-gray-500 dark:text-gray-400">Or continue with email</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        {renderFormContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;