import { API_CONFIG } from './apiConfig';

export interface FeedbackDto {
    id: string;
    userId?: string;
    userEmail?: string;
    userFullName?: string;
    message?: string;
    createdAt?: string;
}

export interface CreateFeedbackDto {
    message: string;
}

class FeedbackService {
    private baseUrl = API_CONFIG.BASE_URL;

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    /**
     * Create new feedback
     */
    async createFeedback(message: string): Promise<FeedbackDto> {
        try {
            const response = await fetch(`${this.baseUrl}/Feedbacks`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('[FeedbackService] Create feedback error:', error);
            throw error;
        }
    }

    /**
     * Get current user's feedbacks
     */
    async getMyFeedbacks(): Promise<FeedbackDto[]> {
        try {
            const response = await fetch(`${this.baseUrl}/Feedbacks/my-feedbacks`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get feedbacks');
            }

            return await response.json();
        } catch (error) {
            console.error('[FeedbackService] Get my feedbacks error:', error);
            throw error;
        }
    }
}

const feedbackService = new FeedbackService();
export default feedbackService;
