import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface CameraViewProps {
    streamUrl: string;
    title?: string;
    visible?: boolean; // For modal mode
    onClose?: () => void; // For modal mode
    mode?: 'modal' | 'embedded';
    isConnected?: boolean;
    onExpand?: () => void;
}

export default function CameraView({
    streamUrl,
    title = 'Robot Camera',
    visible,
    onClose,
    mode = 'modal',
    isConnected = false,
    onExpand
}: CameraViewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (visible || mode === 'embedded') {
            setIsLoading(true);
            setError(null);
        }
    }, [visible, streamUrl, refreshKey, mode]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        setIsLoading(true);
        setError(null);
    };

    const renderContent = () => (
        <View style={[styles.container, mode === 'embedded' && styles.embeddedContainer]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="videocam-off-outline" size={18} color="#EF4444" />
                    <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.headerRight}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, isConnected ? styles.statusConnected : styles.statusOffline]}>
                        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
                        <Text style={[styles.statusText, { color: isConnected ? '#065F46' : '#991B1B' }]}>
                            {isConnected ? 'Online' : 'Offline'}
                        </Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={handleRefresh} style={styles.iconButton}>
                            <Ionicons name="refresh" size={18} color={Colors.light.icon} />
                        </TouchableOpacity>
                        {mode === 'embedded' && onExpand && (
                            <TouchableOpacity onPress={onExpand} style={styles.iconButton}>
                                <Ionicons name="expand" size={18} color={Colors.light.icon} />
                            </TouchableOpacity>
                        )}
                        {mode === 'modal' && onClose && (
                            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                                <Ionicons name="close" size={20} color={Colors.light.icon} />
                            </TouchableOpacity>
                        )}
                    </View>
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
                        <Ionicons name="alert-circle" size={32} color="#EF4444" />
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
                        setError('Failed to connect');
                    }}
                />
            </View>
        </View>
    );

    if (mode === 'modal') {
        return (
            <Modal
                visible={visible}
                animationType="fade"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {renderContent()}
                    </View>
                </View>
            </Modal>
        );
    }

    return renderContent();
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 600,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    embeddedContainer: {
        // Specific styles for embedded mode if needed
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusConnected: {
        backgroundColor: '#D1FAE5',
    },
    statusOffline: {
        backgroundColor: '#FEE2E2',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        padding: 4,
    },
    feedContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
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
        color: '#9CA3AF',
        marginTop: 8,
        fontSize: 12,
    },
    errorContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        padding: 20,
    },
    errorText: {
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 12,
    },
    retryButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
});
