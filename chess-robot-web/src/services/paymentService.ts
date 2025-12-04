import apiClient from './apiClient';

// Backend returns PascalCase, but we'll handle both cases
export interface PaymentResponse {
    paymentUrl?: string;
    transactionId?: string;
    amount?: number;
    qrCodeUrl?: string;
    // Backend might use PascalCase
    PaymentUrl?: string;
    TransactionId?: string;
    Amount?: number;
    QrCodeUrl?: string;
}

export interface PaymentStatus {
    transactionId?: string;
    status?: 'pending' | 'success' | 'failed';
    amount?: number;
    completedAt?: string | null;
    // Backend might use PascalCase
    TransactionId?: string;
    Status?: string;
    Amount?: number;
    CompletedAt?: string | null;
}

/**
 * Create payment link for point package
 */
export const createPayment = async (packageId: number): Promise<PaymentResponse> => {
    try {
        console.log('=== createPayment called ===');
        console.log('Package ID:', packageId);
        console.log('Request body:', { packageId });
        
        const response = await apiClient.post<PaymentResponse>('/Payments/create', {
            packageId
        });
        
        console.log('=== Payment API Response ===');
        console.log('Response:', response);
        console.log('Response keys:', Object.keys(response));
        
        return response;
    } catch (error: any) {
        console.error('=== Payment API Error ===');
        console.error('Error:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        throw error;
    }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (transactionId: string): Promise<PaymentStatus> => {
    try {
        const response = await apiClient.get<PaymentStatus>(`/Payments/status/${transactionId}`);
        return response;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
};
