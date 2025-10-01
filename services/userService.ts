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
}

type PreferenceKey = keyof UserPreferences;

export const getPreferences = async (token: string): Promise<UserPreferences> => {
    const response = await fetch(`${API_URL}/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const updatePreference = async (key: PreferenceKey, value: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/preferences`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
    });
    return handleResponse(response);
};

export const updateUserProfile = async (userId: string, data: { name?: string, email?: string }, token: string): Promise<User> => {
     const response = await fetch(`${API_URL}/${userId}/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export const changePassword = async (userId: string, data: { currentPassword?: string, newPassword?: string }, token: string): Promise<{message: string}> => {
     const response = await fetch(`${API_URL}/${userId}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export const fetchReadingHistory = async (token: string): Promise<Article[]> => {
    const response = await fetch(`${API_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
}