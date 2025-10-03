const API_URL = '/api/push';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    return response.json();
};

export const subscribeToPushNotifications = async (subscription: PushSubscription, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription),
    });
    return handleResponse(response);
};