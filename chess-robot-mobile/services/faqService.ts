import apiClient from './apiClient';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
  isPublished: boolean;

  createdAt: string;
  updatedAt?: string;
}

class FaqService {
  /**
   * Get all published FAQs for players
   */
  async getAllFaqs(): Promise<Faq[]> {
    try {
      const response = await apiClient.get<any>('/Faqs');
      console.log('FAQ API Response:', response);
      
      // Handle different response structures
      if (response.data) {
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
      }
      
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('Error fetching FAQs:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch FAQs');
    }
  }

  /**
   * Get FAQs by category
   */
  async getFaqsByCategory(category: string): Promise<Faq[]> {
    try {
      const response = await apiClient.get<any>(`/Faqs?category=${category}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching FAQs by category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch FAQs by category');
    }
  }

  /**
   * Search FAQs
   */
  async searchFaqs(query: string): Promise<Faq[]> {
    try {
      const response = await apiClient.get<any>(`/Faqs?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching FAQs:', error);
      throw new Error(error.response?.data?.message || 'Failed to search FAQs');
    }
  }
}

const faqService = new FaqService();
export default faqService;
