import { User } from '../types.ts';
import { AccentColor, Theme } from '../contexts/SettingsContext.tsx';

const API_URL = '/api/users';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    return response.json();
}

type PreferenceKey = 'theme' | 'language' | 'accentColor';

export const getPreferences = async (token: string): Promise<{ theme: Theme, language: 'en' | 'fr' | 'rw', accentColor: AccentColor }> => {
    const response = await fetch(`${API_URL}/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const updatePreference = async (key: PreferenceKey, value: string, token: string): Promise<any> => {
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
