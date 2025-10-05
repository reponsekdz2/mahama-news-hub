import { Article, Advertisement, Comment } from '../types.ts';
import { SearchFilters } from '../App.tsx';

const API_URL = '/api/articles';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `API Error: ${response.status}`);
        } catch (e) {
            console.error("Non-JSON error response from API:", errorText);
            throw new Error(`Server returned a non-JSON error (Status: ${response.status}). This could be a proxy issue if the backend is not running.`);
        }
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse successful JSON response:", text);
        throw new Error("Received a malformed JSON response from the server.");
    }
};

export const fetchArticles = async (topic: string, filters: SearchFilters, token?: string, query?: string): Promise<Article[]> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const params = new URLSearchParams({
        topic,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy
    });
    
    if (query) {
        params.append('q', query);
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, { headers });
    const data = await handleResponse(response);
    
    return data.map((article: any) => ({
        ...article,
        tags: article.tags ? article.tags.split(',').map((t:string) => t.trim()) : []
    }));
};

export const searchArticles = async (query: string, token?: string): Promise<Pick<Article, 'id' | 'title'>[]> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_URL}/search-suggestions?${params.toString()}`, { headers });
    return handleResponse(response);
};

export const fetchRandomArticle = async (token?: string): Promise<Article | null> => {
     const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/random`, { headers });
    const article = await handleResponse(response);
    if (article.tags && typeof article.tags === 'string') {
        article.tags = article.tags.split(',').map((t:string) => t.trim());
    } else {
        article.tags = [];
    }
    return article;
};

export const getArticleById = async (id: string, token?: string): Promise<Article> => {
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/${id}`, { headers });
    const article = await handleResponse(response);
    if (article.tags && typeof article.tags === 'string') {
        article.tags = article.tags.split(',').map((t:string) => t.trim());
    } else {
        article.tags = [];
    }
    return article;
}

export const fetchRelatedArticles = async (id: string): Promise<Article[]> => {
    const response = await fetch(`${API_URL}/${id}/related`);
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

export const trackShare = async (articleId: string, platform: string, token: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/${articleId}/share`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ platform })
        });
    } catch (error) {
        console.warn('Failed to track share', error);
    }
};

export const getComments = async (articleId: string): Promise<Comment[]> => {
    const response = await fetch(`${API_URL}/${articleId}/comments`);
    return handleResponse(response);
}

export const postComment = async (articleId: string, content: string, token: string): Promise<{message: string}> => {
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