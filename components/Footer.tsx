import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { subscribeToNewsletter } from '../services/userService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const response = await subscribeToNewsletter(email, user?.token);
            setMessage(response.message);
            setEmail('');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-extrabold text-accent-600 dark:text-accent-400">Mahama News</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">Your source for reliable news and in-depth analysis on technology, science, and world events.</p>
                    </div>
                    {/* Sections */}
                    <div>
                        <h4 className="font-semibold tracking-wider uppercase text-gray-700 dark:text-gray-300">Sections</h4>
                        <ul className="mt-4 space-y-2">
                            {['World', 'Technology', 'Science', 'Politics', 'Sport'].map(cat => (
                                <li key={cat}><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-accent-500">{t(cat as any)}</a></li>
                            ))}
                        </ul>
                    </div>
                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold tracking-wider uppercase text-gray-700 dark:text-gray-300">Newsletter</h4>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Stay updated with our weekly digest.</p>
                        <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Your Email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                className="form-input" 
                            />
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="btn btn-primary w-full"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                        {message && <p className="text-xs mt-2 text-center text-gray-500 dark:text-gray-400">{message}</p>}
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Mahama News TV. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                        <a href="#" className="hover:text-accent-500">Privacy Policy</a>
                        <a href="#" className="hover:text-accent-500">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;