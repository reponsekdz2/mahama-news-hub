import { Article } from '../types.ts';

const API_URL = '/api/analytics';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
}

export const fetchTrendingArticles = async (): Promise<Pick<Article, 'id' | 'title'>[]> => {
    const response = await fetch(`${API_URL}/trending`);
    return handleResponse(response);
};