import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchAnalytics } from '../../services/adminService.ts';
import Spinner from '../Spinner.tsx';
import BarChart from './BarChart.tsx';

interface AnalyticsData {
    totalUsers: number;
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    topViewed: { id: string; title: string; views: number }[];
    topLiked: { id: string; title: string; likes: number }[];
    viewsLast30Days: { date: string, views: number }[];
}

const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode}> = ({title, value, icon}) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-accent-100 dark:bg-accent-900/50 p-3 rounded-full text-accent-600 dark:text-accent-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const TopArticlesList: React.FC<{title: string, articles: {title: string, views?: number, likes?: number}[]}> = ({title, articles}) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <ul className="space-y-2">
            {articles.map((article, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate pr-4" title={article.title}>{article.title}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{article.views ?? article.likes}</span>
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

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!user?.token) return;
            try {
                const analyticsData = await fetchAnalytics(user.token);
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load analytics.');
            } finally {
                setIsLoading(false);
            }
        };
        loadAnalytics();
    }, [user?.token]);

    if (isLoading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data) return <p>No analytics data found.</p>;

    const chartData = data.viewsLast30Days.map(d => ({
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.views
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Users" value={data.totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                 <StatCard title="Total Articles" value={data.totalArticles} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>} />
                 <StatCard title="Total Views" value={data.totalViews} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
                 <StatCard title="Total Likes" value={data.totalLikes} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
            </div>

            <BarChart title="Views in Last 30 Days" data={chartData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopArticlesList title="Most Viewed Articles" articles={data.topViewed} />
                <TopArticlesList title="Most Liked Articles" articles={data.topLiked} />
            </div>
        </div>
    );
};

export default Dashboard;
