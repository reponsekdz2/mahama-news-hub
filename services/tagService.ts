const API_URL = '/api/tags';

interface Tag {
    id: number;
    name: string;
}

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

export const fetchTags = async (): Promise<Tag[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const createTag = async (name: string, token: string): Promise<Tag> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    });
    return handleResponse(response);
};

export const deleteTag = async (id: number, token: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};