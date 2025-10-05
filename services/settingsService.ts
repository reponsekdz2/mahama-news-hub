const API_URL = '/api/settings';

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