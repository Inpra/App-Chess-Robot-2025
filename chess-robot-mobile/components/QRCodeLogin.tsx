import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as signalR from '@microsoft/signalr';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '@/services/apiConfig';
import authService from '@/services/authService';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Interface for QR Session Data
interface QRSessionData {
    sessionId: string;
    expiryTime: string;
    qrData: string;
}

export default function QRCodeLogin({ onBack }: { onBack: () => void }) {
    const router = useRouter();
    const [qrData, setQrData] = useState('');
    const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'expired' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const sessionIdRef = useRef('');

    // Derive Hub URL from API Config
    const HUB_URL = API_CONFIG.BASE_URL.replace('/api', '/authHub');

    useEffect(() => {
        initQRSession();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, []);

    const initQRSession = async () => {
        try {
            setStatus('loading');
            setErrorMessage('');

            // Generate QR session
            const response = await fetch(`${API_CONFIG.BASE_URL}/Auth/qr-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate QR session');
            }

            const data: QRSessionData = await response.json();

            setQrData(data.qrData);
            sessionIdRef.current = data.sessionId;
            setStatus('ready');

            // Connect to SignalR
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL)
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

            newConnection.on('NotifyLoginSuccess', async (session: string, token: string, user: any) => {
                console.log('Login success notification received', { session });

                if (session === sessionIdRef.current || session === data.sessionId) {
                    setStatus('success');

                    // Save auth data using authService
                    await authService.setAuthData(token, user);

                    // Redirect to dashboard
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 1500);
                }
            });

            newConnection.onclose(() => {
                console.log('SignalR connection closed');
            });

            await newConnection.start();
            console.log('SignalR connected');
            connectionRef.current = newConnection;

            // Set expiry timer (5 minutes)
            setTimeout(() => {
                if (status !== 'success') {
                    setStatus('expired');
                    if (connectionRef.current) {
                        connectionRef.current.stop();
                    }
                }
            }, 5 * 60 * 1000);

        } catch (error: any) {
            console.error('Failed to init QR session:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to generate QR code');
        }
    };

    const handleRefresh = () => {
        if (connectionRef.current) {
            connectionRef.current.stop();
        }
        initQRSession();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {status === 'loading' && (
                    <View style={styles.statusContainer}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                        <Text style={styles.statusText}>Generating QR code...</Text>
                    </View>
                )}

                {status === 'ready' && (
                    <View style={styles.qrContainer}>
                        <Text style={styles.title}>Scan QR Code to Login</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={qrData}
                                size={250}
                            />
                        </View>

                        <View style={styles.instructions}>
                            <Text style={styles.instructionTitle}>📱 How to scan:</Text>
                            <View style={styles.instructionStep}>
                                <Text style={styles.stepNumber}>1.</Text>
                                <Text style={styles.stepText}>Use another device's camera</Text>
                            </View>
                            <View style={styles.instructionStep}>
                                <Text style={styles.stepNumber}>2.</Text>
                                <Text style={styles.stepText}>Scan the QR code above</Text>
                            </View>
                            <View style={styles.instructionStep}>
                                <Text style={styles.stepNumber}>3.</Text>
                                <Text style={styles.stepText}>Confirm login on that device</Text>
                            </View>
                        </View>

                        <Text style={styles.expiryText}>⏱️ Code expires in 5 minutes</Text>
                    </View>
                )}

                {status === 'success' && (
                    <View style={styles.statusContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={Colors.light.accent} />
                        <Text style={styles.successTitle}>Login Successful!</Text>
                        <Text style={styles.statusText}>Redirecting to dashboard...</Text>
                    </View>
                )}

                {status === 'expired' && (
                    <View style={styles.statusContainer}>
                        <Ionicons name="time-outline" size={60} color={Colors.light.notification} />
                        <Text style={styles.errorTitle}>QR Code Expired</Text>
                        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
                            <Text style={styles.buttonText}>Generate New Code</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {status === 'error' && (
                    <View style={styles.statusContainer}>
                        <Ionicons name="alert-circle-outline" size={60} color={Colors.light.notification} />
                        <Text style={styles.errorTitle}>Error</Text>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    statusContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    qrContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: Colors.light.text,
        textAlign: 'center',
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 30,
    },
    instructions: {
        width: '100%',
        backgroundColor: Colors.light.card,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: Colors.light.text,
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    stepNumber: {
        width: 20,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    stepText: {
        flex: 1,
        color: Colors.light.textSecondary,
    },
    expiryText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.accent,
        marginTop: 16,
        marginBottom: 8,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.notification,
        marginTop: 16,
        marginBottom: 16,
    },
    errorText: {
        textAlign: 'center',
        color: Colors.light.textSecondary,
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
