const API_URL = '/api/subscriptions';

interface SubscriptionStatus {
    subscriptionStatus: 'free' | 'premium' | 'trial';
    subscriptionEndDate: string | null;
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


export const getSubscriptionStatus = async (token: string): Promise<SubscriptionStatus> => {
    const response = await fetch(`${API_URL}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};


export const createSubscription = async (planType: 'monthly' | 'yearly', token: string): Promise<{ message: string }> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ planType }),
    });
    return handleResponse(response);
};

export const updateUserSubscription = async (userId: string, data: { status: 'free' | 'premium' | 'trial'; endDate: string | null }, token: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};