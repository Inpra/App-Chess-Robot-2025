import AsyncStorage from '@react-native-async-storage/async-storage';
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

            // Save token to AsyncStorage
            if (response.success && response.token) {
                await AsyncStorage.setItem('auth_token', response.token);
                if (response.user) {
                    await AsyncStorage.setItem('user', JSON.stringify(response.user));
                }
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

            // Save token to AsyncStorage
            if (response.success && response.token) {
                await AsyncStorage.setItem('auth_token', response.token);
                if (response.user) {
                    await AsyncStorage.setItem('user', JSON.stringify(response.user));
                }
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
            // Clear storage
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
        }
    }

    /**
     * Get current user from AsyncStorage
     */
    async getCurrentUser(): Promise<UserResponse | null> {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            return !!token;
        } catch {
            return false;
        }
    }

    /**
     * Get auth token
     */
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch {
            return null;
        }
    }

    /**
     * Get current user profile from API
     */
    async getProfile(): Promise<UserResponse | null> {
        try {
            const response = await apiClient.get<{ user: UserResponse }>(
                AUTH_ENDPOINTS.ME
            );

            // Update storage
            if (response && response.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
                return response.user;
            }
            return null;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
