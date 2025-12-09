import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import apiClient from '@/services/apiClient';

/**
 * Hook to handle automatic logout when token expires
 * This should be used in the root layout or main app component
 */
export function useAutoLogout() {
    const router = useRouter();

    useEffect(() => {
        console.log('[useAutoLogout] Setting up auto-logout listener');

        // Subscribe to logout events from apiClient
        const unsubscribe = apiClient.onLogout(() => {
            console.log('[useAutoLogout] Token expired, logging out user');

            // Show alert to user
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to login screen
                            router.replace('/login');
                        }
                    }
                ],
                { cancelable: false }
            );
        });

        // Cleanup on unmount
        return () => {
            console.log('[useAutoLogout] Cleaning up auto-logout listener');
            unsubscribe();
        };
    }, [router]);
}
