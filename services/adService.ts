import { Advertisement, AdCampaign } from '../types.ts';

const API_URL = '/api/ads';

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

// Public
export const fetchSidebarAds = async (category?: string): Promise<Advertisement[]> => {
    const url = category ? `${API_URL}/sidebar?category=${encodeURIComponent(category)}` : `${API_URL}/sidebar`;
    const response = await fetch(url);
    return handleResponse(response);
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

export const trackAdImpression = async (adId: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/${adId}/impression`, { method: 'POST' });
    } catch (error) {
        console.error('Failed to track ad impression', error);
    }
};

export const trackAdClick = async (adId: string): Promise<void> => {
    try {
        await fetch(`${API_URL}/${adId}/click`, { method: 'POST' });
    } catch (error) {
        console.error('Failed to track ad click', error);
    }
};