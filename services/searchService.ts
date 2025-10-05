

const API_URL = '/api/search';

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

export const getRecentSearches = async (token: string): Promise<string[]> => {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await handleResponse(response);
    // The backend returns an array of objects like [{ query: 'search term' }]
    return data ? data.map((item: { query: string }) => item.query) : [];
};

export const logSearch = async (query: string, token: string): Promise<void> => {
    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
    });
};