import { Collection } from '../types.ts';

const API_URL = '/api/collections';

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

export const getCollections = async (token: string): Promise<Collection[]> => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const createCollection = async (name: string, token: string): Promise<Collection> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
};

export const updateCollection = async (id: string, name: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
};

export const deleteCollection = async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

export const addArticleToCollection = async (collectionId: string, articleId: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${collectionId}/articles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
    });
};

export const removeArticleFromCollection = async (collectionId: string, articleId: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${collectionId}/articles/${articleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
};
