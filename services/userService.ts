import { User, UserPreferences, Article } from '../types.ts';

const API_URL = '/api/users';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
};

// Preferences
export const getPreferences = async (token: string): Promise<UserPreferences> => {
    const response = await fetch(`${API_URL}/me/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updatePreference = async (key: keyof UserPreferences, value: any, token: string): Promise<void> => {
    await fetch(`${API_URL}/me/preferences`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
    });
};

// User Profile
export const updateProfile = async (profileData: { name?: string; email?: string; password?: string }, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
    });
    return handleResponse(response);
}

// Reading History
export const fetchReadingHistory = async (token: string): Promise<Article[]> => {
    const response = await fetch(`${API_URL}/me/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const addToReadingHistory = async (articleId: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/me/history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ articleId })
    });
};


// Account Deletion
export const deleteAccount = async (token: string): Promise<void> => {
    await fetch(`${API_URL}/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}
