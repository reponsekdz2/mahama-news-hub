import { Collection } from '../types.ts';

const API_URL = '/api/collections';

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