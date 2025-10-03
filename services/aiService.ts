import { ArticleAnalysis } from '../types.ts';

const API_URL = '/api/ai';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An AI API error occurred');
    }
    return response.json();
};

export const improveWriting = async (text: string, token: string): Promise<string> => {
    const response = await fetch(`${API_URL}/improve-writing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    });
    const data = await handleResponse(response);
    return data.improvedText;
};

export const generateImageIdea = async (title: string, token: string): Promise<string> => {
    const response = await fetch(`${API_URL}/generate-image-idea`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
    });
    const data = await handleResponse(response);
    return data.idea;
};

export const fetchArticleAnalysis = async (articleId: string, token: string): Promise<ArticleAnalysis> => {
    const response = await fetch(`${API_URL}/analyze-article`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
    });
    return handleResponse(response);
};