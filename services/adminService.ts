import { User } from '../types.ts';

const API_URL = '/api';

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

// Analytics
export const fetchAnalytics = async (range: '7d' | '30d' | 'all', token: string) => {
    const response = await fetch(`${API_URL}/analytics/advanced?range=${range}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

// User Management
export const fetchUsers = async (token: string): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin', token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
    });
    return handleResponse(response);
};

export const deleteUser = async (userId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(response);
};