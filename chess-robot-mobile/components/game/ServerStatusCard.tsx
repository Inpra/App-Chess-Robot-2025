import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface ServerStatusCardProps {
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export default function ServerStatusCard({ connectionStatus }: ServerStatusCardProps) {
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#10B981';
            case 'connecting': return '#F59E0B';
            case 'error': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'error': return 'Connection Error';
            default: return 'Disconnected';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Server Status</Text>
            <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 12,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
});
