import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface AboutAIModalProps {
    onClose: () => void;
}

const AboutAIModal: React.FC<AboutAIModalProps> = ({ onClose }) => {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('aiTransparency')}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-4">
                        <p>
                            At Mahama News TV, we harness the power of Google's Gemini API to enhance your news experience and provide powerful tools for our content creators. Here's how we use AI:
                        </p>
                        <ul>
                            <li><strong>Personalized "For You" Feed:</strong> Our AI analyzes your reading history to understand your interests and recommends articles you'll find engaging and relevant.</li>
                            <li><strong>AI-Powered Tools:</strong> Inside each article, you'll find tools to summarize long texts, translate content into different languages, and even ask specific questions about the article's content.</li>
                            <li><strong>Content Generation (Admin):</strong> Our administrators use AI to assist in brainstorming and generating initial drafts for new articles, ensuring we can bring you timely news on a wide range of topics.</li>
                            <li><strong>Content Analysis (Admin):</strong> We use AI to analyze articles for sentiment, identify key topics, and suggest SEO keywords, helping us improve the quality and reach of our content.</li>
                        </ul>
                        <p>
                            Our goal is to use AI responsibly to augment human creativity and provide you with a richer, more personalized, and accessible news platform.
                        </p>
                    </div>

                     <div className="mt-6 flex justify-end">
                        <button onClick={onClose} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutAIModal;