import { Poll } from '../types.ts';

const API_URL = '/api/polls';

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
