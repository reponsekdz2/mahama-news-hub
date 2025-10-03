import { Advertisement } from '../types.ts';

const API_URL = '/api/ads';

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

// Public
export const fetchSidebarAds = async (): Promise<Advertisement[]> => {
    const response = await fetch(`${API_URL}/sidebar`);
    return handleResponse(response);
};

export const trackAdImpression = async (adId: string): Promise<void> => {
    await fetch(`${API_URL}/${adId}/impression`, { method: 'POST' });
};

export const trackAdClick = async (adId: string): Promise<void> => {
    await fetch(`${API_URL}/${adId}/click`, { method: 'POST' });
};

// Admin
export const fetchAds = async (token: string): Promise<Advertisement[]> => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const createAd = async (formData: FormData, token: string): Promise<Advertisement> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return handleResponse(response);
};

export const updateAd = async (id: string, formData: FormData, token: string): Promise<Advertisement> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return handleResponse(response);
};

export const deleteAd = async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};
