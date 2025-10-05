import { Poll } from '../types.ts';

const API_URL = '/api/polls';

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

export const createOrUpdatePoll = async (data: { articleId: string; question: string; options: string[] }, token: string): Promise<{ pollId: string }> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const castVote = async (pollId: string, optionId: string, token: string): Promise<Poll> => {
    const response = await fetch(`${API_URL}/${pollId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ optionId }),
    });
    return handleResponse(response);
};