
const API_URL = '/api/search';

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
