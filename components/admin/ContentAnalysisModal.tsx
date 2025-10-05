import React from 'react';
import { AnalysisResult } from '../../services/geminiService.ts';

interface ContentAnalysisModalProps {
    analysisData: AnalysisResult;
    onClose: () => void;
    onApply: (data: AnalysisResult) => void;
}

const SuggestionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
        {children}
    </div>
);


const ContentAnalysisModal: React.FC<ContentAnalysisModalProps> = ({ analysisData, onClose, onApply }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V3a1 1 0 00-1-1H5zM3 8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zM5 14a1 1 0 00-1 1v1.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V15a1 1 0 00-1-1H5zM8.5 2a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1zM10 3.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zM8.5 14a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1zM14 15a1 1 0 100-2 1 1 0 000 2zm-1.5-5.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z" clipRule="evenodd" /></svg>
                        AI Content Analysis
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                </header>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <SuggestionCard title="Suggested Meta Title">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{analysisData.suggestedTitle}</p>
                    </SuggestionCard>

                     <SuggestionCard title="Suggested Meta Description">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{analysisData.suggestedDescription}</p>
                    </SuggestionCard>
                    
                    <SuggestionCard title="Suggested Tags">
                        <div className="flex flex-wrap gap-2">
                            {analysisData.suggestedTags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">{tag}</span>
                            ))}
                        </div>
                    </SuggestionCard>

                    <SuggestionCard title="SEO Feedback">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{analysisData.seoFeedback}</p>
                    </SuggestionCard>
                </div>
                 <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Close</button>
                    <button type="button" onClick={() => onApply(analysisData)} className="btn-primary">Apply Suggestions</button>
                </footer>
            </div>
        </div>
    );
};

export default ContentAnalysisModal;