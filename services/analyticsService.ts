import { Article } from '../types.ts';

const API_URL = '/api/analytics';

export interface TrendingArticle extends Pick<Article, 'id' | 'title'> {
    views: number;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        // Try to get a meaningful error message from JSON, but have a fallback.
        try {
            const error = await response.json();
            throw new Error(error.message || 'An API error occurred');
        } catch (e) {
            throw new Error('An API error occurred and the response was not valid JSON.');
        }
    }
    
    const text = await response.text();

    if (!text) {
        // The component expects an array, so return an empty one for empty responses.
        return [];
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Failed to parse server response.");
    }
};

export const fetchTrendingArticles = async (): Promise<TrendingArticle[]> => {
    const response = await fetch(`${API_URL}/trending`);
    return handleResponse(response);
};
