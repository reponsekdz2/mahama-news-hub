const API_URL = '/api/subscriptions';

interface SubscriptionStatus {
    subscriptionStatus: 'free' | 'premium' | 'trial';
    subscriptionEndDate: string | null;
}

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
