import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './apiConfig';

// Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

// Request options
interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor(baseURL: string, timeout: number = 30000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    /**
     * Get authorization token from AsyncStorage
     */
    private async getAuthToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Build headers with authentication
     */
    private async buildHeaders(customHeaders?: HeadersInit): Promise<Headers> {
        const headers = new Headers({
            'Content-Type': 'application/json',
        });

        // Add custom headers
        if (customHeaders) {
            if (customHeaders instanceof Headers) {
                customHeaders.forEach((value, key) => headers.set(key, value));
            } else if (Array.isArray(customHeaders)) {
                customHeaders.forEach(([key, value]) => headers.set(key, value));
            } else {
                Object.entries(customHeaders).forEach(([key, value]) => headers.set(key, value));
            }
        }

        // Add auth token
        const token = await this.getAuthToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    /**
     * Build URL with query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseURL}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }

    /**
     * Refresh token handler
     */
    private refreshTokenHandler: (() => Promise<boolean>) | null = null;

    /**
     * Set refresh token handler
     */
    setRefreshTokenHandler(handler: () => Promise<boolean>) {
        this.refreshTokenHandler = handler;
    }

    /**
     * Handle API response
     */
    private async handleResponse<T>(response: Response, originalRequest?: () => Promise<T>): Promise<T> {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        let data: any;
        if (isJson) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log('[ApiClient] Response:', {
            url: response.url,
            status: response.status,
            ok: response.ok,
            data
        });

        if (!response.ok) {
            // Handle 401 Unauthorized - Token expired
            if (response.status === 401) {
                console.log('[ApiClient] 401 Unauthorized - Token might be expired');

                // Check if the failed request was the refresh token request itself
                // Prevents infinite loop
                const isRefreshRequest = response.url.includes('/refresh');

                // Try to refresh token if handler is available and we haven't retried yet
                if (this.refreshTokenHandler && originalRequest && !isRefreshRequest) {
                    console.log('[ApiClient] Attempting to refresh token...');
                    const refreshSuccess = await this.refreshTokenHandler();

                    if (refreshSuccess) {
                        console.log('[ApiClient] Token refresh successful, retrying original request');
                        return originalRequest();
                    } else {
                        console.log('[ApiClient] Token refresh failed');
                    }
                }

                console.log('[ApiClient] Triggering logout');
                // Clear auth data
                await AsyncStorage.removeItem('auth_token');
                await AsyncStorage.removeItem('user');

                // Emit logout event
                this.emitLogout();
            }

            const error: ApiError = {
                message: data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                errors: data?.errors,
            };
            throw error;
        }

        return data as T;
    }

    /**
     * Logout event listeners
     */
    private logoutListeners: Array<() => void> = [];

    /**
     * Subscribe to logout events
     */
    onLogout(callback: () => void): () => void {
        this.logoutListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.logoutListeners = this.logoutListeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Emit logout event to all listeners
     */
    private emitLogout(): void {
        this.logoutListeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('[ApiClient] Error in logout listener:', error);
            }
        });
    }

    /**
     * Make API request with timeout
     */
    private async makeRequest<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { params, ...fetchOptions } = options;
        const url = this.buildURL(endpoint, params);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const headers = await this.buildHeaders(fetchOptions.headers);
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                signal: controller.signal,
            });

            return await this.handleResponse<T>(response, () => this.makeRequest<T>(endpoint, options));
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw {
                    message: 'Request timeout',
                    status: 408,
                } as ApiError;
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        return this.makeRequest<T>(endpoint, {
            method: 'GET',
            params,
        });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.makeRequest<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.makeRequest<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        return this.makeRequest<T>(endpoint, {
            method: 'DELETE',
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: any): Promise<T> {
        return this.makeRequest<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

// Export singleton instance
const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
export default apiClient;
