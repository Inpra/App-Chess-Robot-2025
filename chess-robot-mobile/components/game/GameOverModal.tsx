    import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface GameOverModalProps {
    isOpen: boolean;
    result: 'win' | 'lose' | 'draw';
    reason: string;
    message: string;
    onClose: () => void;
}

export function GameOverModal({ isOpen, result, reason, message, onClose }: GameOverModalProps) {
    const router = useRouter();

    const getResultIcon = () => {
        switch (result) {
            case 'win':
                return 'trophy';
            case 'lose':
                return 'flag';
            case 'draw':
                return 'handshake-outline';
        }
    };

    const getResultTitle = () => {
        switch (result) {
            case 'win':
                return 'Victory!';
            case 'lose':
                return 'Defeat';
            case 'draw':
                return 'Draw';
        }
    };

    const getResultColor = () => {
        switch (result) {
            case 'win':
                return '#10B981';
            case 'lose':
                return '#EF4444';
            case 'draw':
                return '#F59E0B';
        }
    };

    const handleBackToMenu = () => {
        onClose();
        router.navigate('/(tabs)');
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={getResultIcon() as any}
                            size={64}
                            color={getResultColor()}
                        />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: getResultColor() }]}>
                        {getResultTitle()}
                    </Text>

                    {/* Reason */}
                    <Text style={styles.reason}>{reason}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: getResultColor() }]}
                            onPress={handleBackToMenu}
                        >
                            <Text style={styles.buttonText}>Back to Menu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 24,
        marginTop: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    reason: {
        fontSize: 18,
        color: '#D1D5DB',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 32,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
