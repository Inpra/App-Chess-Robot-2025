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

export interface PaymentHistory {
    id: string;
    userId?: string;
    transactionId?: string;
    orderCode?: string;
    amount: number;
    status?: string;
    createdAt?: string;
    packageId?: number;
    package?: {
        id: number;
        name: string;
        points: number;
        price: number;
    };
}

export interface PointTransaction {
    id: string;
    userId: string;
    amount: number;
    transactionType: string; // 'deposit', 'service_usage', 'adjustment', 'ai_suggestion'
    description?: string;
    relatedPaymentId?: string;
    createdAt: string;
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

/**
 * Get current user's payment history
 */
export const getMyPaymentHistory = async (): Promise<PaymentHistory[]> => {
    try {
        const response = await apiClient.get<PaymentHistory[]>('/Payments/my-history');
        return response;
    } catch (error) {
        console.error('Error getting payment history:', error);
        throw error;
    }
};

/**
 * Get current user's point transactions
 */
export const getMyTransactions = async (): Promise<PointTransaction[]> => {
    try {
        const response = await apiClient.get<PointTransaction[]>('/PointTransactions/my-transactions');
        return response;
    } catch (error) {
        console.error('Error getting point transactions:', error);
        throw error;
    }
};
