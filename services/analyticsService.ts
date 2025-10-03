import { Article } from '../types.ts';

const API_URL = '/api/analytics';

export interface TrendingArticle extends Pick<Article, 'id' | 'title'> {
    views: number;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        try {
            // Assume error is JSON, as per our errorHandler
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'An API error occurred.');
        } catch (e) {
            // If not JSON, log the raw text and throw a generic error.
            console.error("Non-JSON error response from API:", errorText);
            throw new Error('An API error occurred and the response was not valid JSON.');
        }
    }
    
    // This part is for successful responses
    const text = await response.text();
    if (!text) {
        return [];
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse successful JSON response:", text);
        throw new Error("Failed to parse server response.");
    }
};


export const fetchTrendingArticles = async (): Promise<TrendingArticle[]> => {
    const response = await fetch(`${API_URL}/trending`);
    return handleResponse(response);
};