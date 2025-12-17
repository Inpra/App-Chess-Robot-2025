import apiClient from './apiClient';

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
    /**
     * Create new feedback
     */
    async createFeedback(message: string): Promise<FeedbackDto> {
        try {
            return await apiClient.post<FeedbackDto>('/Feedbacks', { message });
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
            return await apiClient.get<FeedbackDto[]>('/Feedbacks/my-feedbacks');
        } catch (error) {
            console.error('[FeedbackService] Get my feedbacks error:', error);
            throw error;
        }
    }
}

const feedbackService = new FeedbackService();
export default feedbackService;
