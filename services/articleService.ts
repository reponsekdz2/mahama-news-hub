import { Article } from '../types.ts';

const API_URL = '/api/articles';

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

export const fetchArticles = async (topic: string, token?: string): Promise<Article[]> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Fix: The controller expects topic in query params, not as a path segment
    const response = await fetch(`${API_URL}?topic=${encodeURIComponent(topic)}`, { headers });
    return handleResponse(response);
};

export const getArticleById = async (id: string, token?: string): Promise<Article> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/${id}`, { headers });
    return handleResponse(response);
}

export const createArticle = async (formData: FormData, token: string): Promise<Article> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return handleResponse(response);
};

export const updateArticle = async (id: string, formData: FormData, token: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return handleResponse(response);
};

export const deleteArticle = async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(response);
};

export const likeArticle = async (articleId: string, token: string): Promise<{ likeCount: number }> => {
    const response = await fetch(`${API_URL}/${articleId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const unlikeArticle = async (articleId: string, token: string): Promise<{ likeCount: number }> => {
    const response = await fetch(`${API_URL}/${articleId}/like`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const recordView = async (articleId: string, token?: string): Promise<void> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        await fetch(`${API_URL}/${articleId}/view`, {
            method: 'POST',
            headers,
        });
    } catch (error) {
        console.warn('Failed to record view', error);
    }
};

export const getComments = async (articleId: string) => {
    const response = await fetch(`${API_URL}/${articleId}/comments`);
    return handleResponse(response);
}

export const postComment = async (articleId: string, content: string, token: string) => {
    const response = await fetch(`${API_URL}/${articleId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });
    return handleResponse(response);
}
