import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchAnalytics } from '../../services/adminService.ts';
import Spinner from '../Spinner.tsx';
import LineChart from './LineChart.tsx';
import PieChart from './PieChart.tsx';

type DateRange = '7d' | '30d' | 'all';

interface AnalyticsData {
    dau: number;
    mau: number;
    newUsers: number;
    totalActions: number;
    engagementTrends: { date: string; views: number; likes: number; comments: number }[];
    topArticles: { id: string; title: string; total_actions: number }[];
    topCategories: { category: string; total_actions: number }[];
    topAuthors: { authorName: string; total_actions: number }[];
}

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({title, value, icon}) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-accent-100 dark:bg-accent-900/50 p-3 rounded-full text-accent-600 dark:text-accent-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const Leaderboard: React.FC<{title: string, items: {name: string, value: number}[]}> = ({title, items}) => (
     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                    <span className="text-gray-600 dark:text-gray-300 truncate pr-4" title={item.name}>{index + 1}. {item.name}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{item.value.toLocaleString()}</span>
                </li>
            ))}
        </ul>
    </div>
)

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<DateRange>('30d');

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!user?.token) return;
            setIsLoading(true);
            try {
                const analyticsData = await fetchAnalytics(range, user.token);
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load analytics.');
            } finally {
                setIsLoading(false);
            }
        };
        loadAnalytics();
    }, [user?.token, range]);

    const engagementChartData = {
        labels: data?.engagementTrends.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [
            { label: 'Views', data: data?.engagementTrends.map(d => d.views) || [], color: 'rgba(59, 130, 246, 0.7)' },
            { label: 'Likes', data: data?.engagementTrends.map(d => d.likes) || [], color: 'rgba(239, 68, 68, 0.7)'},
            { label: 'Comments', data: data?.engagementTrends.map(d => d.comments) || [], color: 'rgba(34, 197, 94, 0.7)' },
        ]
    };
    
    const categoryChartData = {
        labels: data?.topCategories.map(c => c.category) || [],
        datasets: [{
            data: data?.topCategories.map(c => c.total_actions) || [],
        }]
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <select value={range} onChange={(e) => setRange(e.target.value as DateRange)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-500 focus:border-accent-500 text-sm">
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                </select>
            </div>
            
            {isLoading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : !data ? <p>No data found.</p> : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Daily Active Users" value={data.dau.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                        <StatCard title="Monthly Active Users" value={data.mau.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        <StatCard title="New Users" value={data.newUsers.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} />
                        <StatCard title="Total Actions" value={data.totalActions.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>} />
                    </div>

                    <LineChart title="Engagement Trends" data={engagementChartData} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Leaderboard title="Top Articles" items={data.topArticles.map(a => ({ name: a.title, value: a.total_actions }))} />
                        <Leaderboard title="Top Authors" items={data.topAuthors.map(a => ({ name: a.authorName, value: a.total_actions }))} />
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                             <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Category Breakdown</h3>
                            <PieChart data={categoryChartData} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;