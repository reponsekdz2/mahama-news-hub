import { AuthenticatedUser, User } from '../types.ts';

const API_URL = '/api/auth';

const handleResponse = async (response: Response): Promise<{ user: User, token: string }> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'An API error occurred');
    }
    return response.json();
};

/**
 * Logs in a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an AuthenticatedUser object.
 */
export const loginUser = async (email: string, password: string): Promise<AuthenticatedUser> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const { user, token } = await handleResponse(response);
    return { ...user, token };
};

/**
 * Registers a new user.
 * @param name The user's full name.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an AuthenticatedUser object.
 */
export const registerUser = async (name: string, email: string, password: string): Promise<AuthenticatedUser> => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
    const { user, token } = await handleResponse(response);
    return { ...user, token };
};

/**
 * Authenticates or registers a user via Google.
 * @param email The user's email from Google.
 * @param name The user's name from Google.
 * @returns A promise that resolves to an AuthenticatedUser object.
 */
export const googleSignIn = async (email: string, name: string): Promise<AuthenticatedUser> => {
    const response = await fetch(`${API_URL}/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
    });
    const { user, token } = await handleResponse(response);
    return { ...user, token };
};