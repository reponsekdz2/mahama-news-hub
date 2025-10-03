import { SiteSettings } from '../types.ts';

const API_URL = '/api/settings';

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

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const response = await fetch(`${API_URL}/site`);
    return handleResponse(response);
};

export const updateSiteSettings = async (settings: SiteSettings, token: string): Promise<void> => {
    await fetch(`${API_URL}/site`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
    });
};