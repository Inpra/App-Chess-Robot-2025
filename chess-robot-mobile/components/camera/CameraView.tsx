import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface CameraViewProps {
    streamUrl: string;
    title?: string;
    visible: boolean;
    onClose: () => void;
}

export default function CameraView({ streamUrl, title = 'Camera Feed', visible, onClose }: CameraViewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (visible) {
            setIsLoading(true);
            setError(null);
        }
    }, [visible, streamUrl, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.contentContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Ionicons name="videocam" size={20} color={Colors.light.text} />
                            <Text style={styles.title}>{title}</Text>
                        </View>
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={handleRefresh} style={styles.iconButton}>
                                <Ionicons name="refresh" size={20} color={Colors.light.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                                <Ionicons name="close" size={24} color={Colors.light.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Camera Feed */}
                    <View style={styles.feedContainer}>
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.light.primary} />
                                <Text style={styles.loadingText}>Connecting to camera...</Text>
                            </View>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                                    <Text style={styles.retryText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <Image
                            key={refreshKey} // Force reload on refresh
                            source={{ uri: streamUrl }}
                            style={styles.feed}
                            resizeMode="contain"
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError('Failed to connect to camera stream');
                            }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        maxWidth: 600,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 8,
    },
    feedContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    feed: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        color: 'white',
        marginTop: 8,
    },
    errorContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        padding: 20,
    },
    errorText: {
        color: 'white',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
    },
});
