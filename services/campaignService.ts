import { AdCampaign } from '../types.ts';

const API_URL = '/api/campaigns';

export interface NewsletterCampaign {
    id: number;
    subject: string;
    sentAt: string;
    adminName: string;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    // Check for empty response body for 204 No Content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
};

export const fetchCampaigns = async (token: string): Promise<AdCampaign[]> => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const createCampaign = async (campaignData: Omit<AdCampaign, 'id'>, token: string): Promise<any> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
};

export const updateCampaign = async (id: string, campaignData: Partial<AdCampaign>, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
};

export const deleteCampaign = async (id: string, token: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const sendCampaign = async (campaignData: { subject: string, content: string }, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/send-newsletter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
};

export const fetchNewsletterCampaigns = async (token: string): Promise<NewsletterCampaign[]> => {
    const response = await fetch(`${API_URL}/newsletter-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};