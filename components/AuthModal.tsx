import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { loginUser, registerUser, googleSignIn } from '../services/authService.ts';

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
    
    // This is a mock implementation for demonstration.
    // In a real app, you would use a library like @react-oauth/google
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            // In a real app, you'd get a token from Google's OAuth flow here.
            // We'll simulate it with prompt for simplicity.
            const mockEmail = prompt("Enter a Google email to simulate sign-in:", "test.user@gmail.com");
            const mockName = prompt("Enter your name:", "Test User");

            if(mockEmail && mockName) {
                const data = await googleSignIn(mockEmail, mockName);
                login(data);
                onClose();
            } else {
                 throw new Error("Google sign-in cancelled.");
            }
           
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">
                                {isLoginView ? t('loginToYourAccount') : t('createAnAccount')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {isLoginView ? "Welcome back!" : "Join our community."}
                            </p>
                        </div>
                        <button onClick={onClose} className="btn-icon -mt-2 -mr-2">&times;</button>
                    </div>

                    {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}
                    
                    <div className="space-y-4">
                        <button onClick={handleGoogleSignIn} className="btn-social">
                           <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.222 0-9.641-3.66-11.28-8.591l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.434 36.338 48 30.652 48 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                           <span>{t('signInWithGoogle')}</span>
                        </button>
                        <div className="auth-divider">OR</div>
                    </div>
                    
                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">{t('emailAddress')}</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('password')}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
                            </div>
                            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                                {isLoading ? 'Logging in...' : t('loginCTA')}
                            </button>
                            <p className="text-sm text-center">
                                {t('dontHaveAccount')} <button type="button" onClick={() => setIsLoginView(false)} className="text-accent-600 hover:underline">{t('register')}</button>
                            </p>
                        </form>
                    ) : (
                         <form onSubmit={handleRegister} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">{t('fullName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('emailAddress')}</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('password')}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
                            </div>
                             <div className="form-group">
                                <label className="form-label">{t('confirmPassword')}</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="form-input" />
                            </div>
                            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
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