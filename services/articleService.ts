import { Article, User } from '../types';

const API_URL = '/api/articles'; // In development, this will be proxied to the backend

export const fetchArticles = async (category: string): Promise<Article[]> => {
    const topic = category === 'Top Stories' ? '' : `?category=${encodeURIComponent(category)}`;
    const response = await fetch(`${API_URL}${topic}`);
    if (!response.ok) {
        throw new Error('Failed to fetch articles');
    }
    return response.json();
};

export const createArticle = async (articleData: Omit<Article, 'id'>, token: string): Promise<Article> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
    });
    if (!response.ok) {
        throw new Error('Failed to create article');
    }
    return response.json();
};

export const updateArticle = async (id: string, articleData: Partial<Article>, token: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
    });
     if (!response.ok) {
        throw new Error('Failed to update article');
    }
    return response.json();
};

export const deleteArticle = async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete article');
    }
};
