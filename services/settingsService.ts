const API_URL = '/api/settings';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    return response.json();
};

// Publicly fetch site settings (e.g., to check for maintenance mode)
export const getSiteSettings = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/site`);
    return handleResponse(response);
};

// Admin-only route to update settings
export const updateSiteSettings = async (settings: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/site`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
    });
    return handleResponse(response);
};

// Admin-only route to upload logo/favicon
export const uploadSiteAsset = async (assetType: 'logo' | 'favicon', file: File, token: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('asset', file);
    formData.append('assetType', assetType);

    const response = await fetch(`${API_URL}/site/asset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return handleResponse(response);
};