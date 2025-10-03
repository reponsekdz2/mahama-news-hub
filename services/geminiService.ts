const API_URL = '/api/gemini';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An AI service error occurred');
    }
    return response.json();
};

export const summarizeContent = async (article: { title: string, content: string }): Promise<string> => {
    const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: article.title,
            content: article.content
        }),
    });
    const data = await handleResponse(response);
    return data.summary;
};
