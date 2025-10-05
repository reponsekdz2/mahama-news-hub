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

    const SocialLink: React.FC<{ href: string, children: React.ReactNode, label: string }> = ({ href, children, label }) => (
        <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-400 transition-colors">
            {children}
        </a>
    );

    return (
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand & Newsletter Section */}
                    <div className="md:col-span-2 lg:col-span-2">
                         <a href="#" className="flex items-center gap-3 font-extrabold text-gray-900 dark:text-white">
                             <svg className="h-10 w-10 text-accent-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                            </svg>
                            <span className="text-xl">Mahama News</span>
                        </a>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">Your source for reliable news and in-depth analysis on technology, science, and world events.</p>
                        
                        <h4 className="mt-8 font-semibold text-gray-900 dark:text-white">Stay updated</h4>
                        <form onSubmit={handleSubscribe} className="mt-2 flex rounded-md shadow-sm">
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                className="relative block w-full rounded-none rounded-l-md border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 focus:border-accent-500 focus:z-10 focus:outline-none focus:ring-accent-500 dark:bg-gray-800 dark:border-gray-600" 
                            />
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50"
                                aria-label="Subscribe to newsletter"
                            >
                                {isSubmitting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925a.75.75 0 0 0 .93.502l4.212-1.285a.75.75 0 0 1 .516.936l-2.036 5.43a.75.75 0 0 0 .401.916l4.212 1.53a.75.75 0 0 0 .93-.502l1.414-4.925a.75.75 0 0 0-.826-.95L3.105 2.289Z" /></svg>
                                )}
                            </button>
                        </form>
                        {message && <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{message}</p>}
                    </div>

                    {/* Links Sections */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Sections</h4>
                        <ul className="mt-4 space-y-3">
                            {['World', 'Technology', 'Science', 'Politics', 'Sport'].map(cat => (
                                <li key={cat}><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">{t(cat as any)}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Company</h4>
                         <ul className="mt-4 space-y-3">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Advertise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Legal</h4>
                        <ul className="mt-4 space-y-3">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Mahama News TV. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <SocialLink href="https://twitter.com" label="Twitter">
                           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialLink>
                        <SocialLink href="https://facebook.com" label="Facebook">
                           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                        </SocialLink>
                        <SocialLink href="https://linkedin.com" label="LinkedIn">
                           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </SocialLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;