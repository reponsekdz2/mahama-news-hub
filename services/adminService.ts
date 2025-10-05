import { User, Comment } from '../types.ts';

const API_URL = '/api';

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

// Comment Moderation
export const fetchPendingComments = async (token: string): Promise<Comment[]> => {
    const response = await fetch(`${API_URL}/moderation/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
}

export const updateCommentStatus = async (commentId: string, status: 'approved' | 'rejected', token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/moderation/comments/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    await handleResponse(response);
}