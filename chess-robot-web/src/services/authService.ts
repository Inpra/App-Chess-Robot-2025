import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from './apiConfig';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    username: string;
    fullName?: string;
    phoneNumber?: string;
}

export interface UserResponse {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: UserResponse;
    error?: string;
}

class AuthService {
    /**
     * Login user
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>(
                AUTH_ENDPOINTS.LOGIN,
                { email, password }
            );

            // Save token to localStorage
            if (response.success && response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Login failed',
            };
        }
    }

    /**
     * Sign up new user
     */
    async signUp(data: SignUpRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>(
                AUTH_ENDPOINTS.SIGNUP,
                data
            );

            // Save token to localStorage
            if (response.success && response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Sign up failed',
            };
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): UserResponse | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Get current user profile from API
     */
    async getProfile(): Promise<UserResponse | null> {
        try {
            const response = await apiClient.get<{ user: UserResponse }>(
                AUTH_ENDPOINTS.ME
            );
            
            // Update local storage
            localStorage.setItem('user', JSON.stringify(response.user));
            
            return response.user;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
