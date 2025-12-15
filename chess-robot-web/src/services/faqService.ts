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
      const response = await apiClient.get('/Faqs');
      console.log('FAQ API Response:', response);
      
      // Handle different response structures
      if (response.data) {
        // If response has a data property, use it
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
      }
      
      // If response itself is an array
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
      const response = await apiClient.get(`/Faqs?category=${category}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching FAQs by category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch FAQs by category');
    }
  }

  /**
   * Get a specific FAQ by ID
   */
  async getFaqById(id: string): Promise<Faq> {
    try {
      const response = await apiClient.get(`/Faqs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching FAQ:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch FAQ');
    }
  }

  /**
   * Search FAQs by query
   */
  async searchFaqs(query: string): Promise<Faq[]> {
    try {
      const response = await apiClient.get(`/Faqs/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching FAQs:', error);
      // If search endpoint doesn't exist, fallback to getting all and filtering client-side
      const allFaqs = await this.getAllFaqs();
      const lowerQuery = query.toLowerCase();
      return allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery)
      );
    }
  }
}

export default new FaqService();
