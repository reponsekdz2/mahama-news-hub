import React, { useState } from 'react';
import ArticleManagement from './admin/ArticleManagement.tsx';
import UserManagement from './admin/UserManagement.tsx';
import Dashboard from './admin/Dashboard.tsx';
import MarketingManagement from './admin/AdManagement.tsx';
import ModerationQueue from './admin/ModerationQueue.tsx';
import SiteSettingsManagement from './admin/SiteSettingsManagement.tsx';
import TagManagement from './admin/TagManagement.tsx';


type AdminView = 'dashboard' | 'articles' | 'users' | 'marketing' | 'moderation' | 'tags' | 'settings';

interface AdminPanelProps {
    onNavigateBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateBack }) => {
    const [view, setView] = useState<AdminView>('dashboard');

    const renderView = () => {
        switch (view) {
            case 'articles':
                return <ArticleManagement />;
            case 'users':
                return <UserManagement />;
            case 'marketing':
                return <MarketingManagement />;
            case 'moderation':
                return <ModerationQueue />;
            case 'tags':
                return <TagManagement />;
            case 'settings':
                return <SiteSettingsManagement />;
            case 'dashboard':
            default:
                return <Dashboard />;
        }
    };

    const NavButton: React.FC<{ currentView: AdminView, targetView: AdminView, label: string }> = ({ currentView, targetView, label }) => (
         <button
            onClick={() => setView(targetView)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
                currentView === targetView 
                ? 'bg-accent-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    )

    return (
        <div className="card p-6 md:p-8 my-6 md:my-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">Admin Panel</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your application's content and users.</p>
                </div>
                <button onClick={onNavigateBack} className="mt-4 sm:mt-0 text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">
                    &larr; Back to News
                </button>
            </div>
            
            <nav className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto admin-nav-scroll pb-2">
                    <div className="flex space-x-2">
                        <NavButton currentView={view} targetView="dashboard" label="Dashboard" />
                        <NavButton currentView={view} targetView="articles" label="Articles" />
                        <NavButton currentView={view} targetView="users" label="Users" />
                        <NavButton currentView={view} targetView="marketing" label="Marketing" />
                        <NavButton currentView={view} targetView="moderation" label="Moderation" />
                        <NavButton currentView={view} targetView="tags" label="Tags" />
                        <NavButton currentView={view} targetView="settings" label="Site Settings" />
                    </div>
                </div>
            </nav>

            <div className="mt-4">
                {renderView()}
            </div>
        </div>
    );
};

export default AdminPanel;