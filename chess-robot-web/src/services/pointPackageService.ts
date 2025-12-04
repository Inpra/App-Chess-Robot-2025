import apiClient from './apiClient';

// API Response format - C# JSON serializer uses camelCase by default
export interface PointPackage {
    id: number;
    name: string;
    points: number;
    price: number;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}

/**
 * Get all active point packages (Public endpoint - no auth required)
 */
export const getActivePointPackages = async (): Promise<PointPackage[]> => {
    try {
        // Note: API returns data directly, not wrapped in ApiResponse
        const response = await apiClient.get<PointPackage[]>('/PointPackages');
        console.log('API Response:', response); // Debug log
        return response;
    } catch (error) {
        console.error('Error fetching point packages:', error);
        throw error;
    }
};

/**
 * Get point package by ID (Public endpoint - no auth required)
 */
export const getPointPackageById = async (id: number): Promise<PointPackage> => {
    try {
        const response = await apiClient.get<PointPackage>(`/PointPackages/${id}`);
        return response;
    } catch (error) {
        console.error(`Error fetching point package ${id}:`, error);
        throw error;
    }
};

/**
 * Format price to VND currency
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

/**
 * Format points with thousand separator
 */
export const formatPoints = (points: number): string => {
    return new Intl.NumberFormat('vi-VN').format(points);
};
