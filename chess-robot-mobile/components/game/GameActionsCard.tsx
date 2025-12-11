import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface GameActionsCardProps {
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    isConnected: boolean;
    isStartingGame: boolean;
    gameStatus: 'waiting' | 'in_progress' | 'finished' | 'paused' | 'ended' | 'starting' | 'idle';
    isLoadingHint?: boolean;
    onConnect: () => void;
    onStartGame: () => void;
    onResign: () => void;
    onPause?: () => void;
    onHint?: () => void;
}

export default function GameActionsCard({
    connectionStatus,
    isConnected,
    isStartingGame,
    gameStatus,
    isLoadingHint = false,
    onConnect,
    onStartGame,
    onResign,
    onPause,
    onHint
}: GameActionsCardProps) {
    return (
        <View style={styles.container}>
            {/* Connect Button */}
            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onConnect}
                disabled={connectionStatus === 'connecting'}
            >
                <Ionicons name="bluetooth" size={20} color="#FFF" />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                    {connectionStatus === 'connecting' ? 'Connecting...' :
                        isConnected ? 'Disconnect Server' : 'Connect to Server'}
                </Text>
            </TouchableOpacity>

            {/* Start Game Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: gameStatus === 'in_progress' ? '#10B981' : '#3B82F6',
                        opacity: !isConnected || isStartingGame || gameStatus === 'in_progress' ? 0.5 : 1
                    }
                ]}
                onPress={onStartGame}
                disabled={!isConnected || isStartingGame || gameStatus === 'in_progress'}
            >
                {isStartingGame ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Ionicons name="play" size={20} color="#FFF" />
                )}
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                    {isStartingGame ? 'Starting...' :
                        gameStatus === 'in_progress' ? 'Game Active' : 'Start Game'}
                </Text>
            </TouchableOpacity>

            {/* Pause/Resume and Hint Row */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.halfButton, {
                        opacity: gameStatus !== 'in_progress' && gameStatus !== 'paused' ? 0.5 : 1
                    }]}
                    onPress={onPause}
                    disabled={gameStatus !== 'in_progress' && gameStatus !== 'paused'}
                >
                    <Ionicons
                        name={gameStatus === 'paused' ? 'play' : 'pause'}
                        size={20}
                        color={Colors.light.text}
                    />
                    <Text style={styles.buttonText}>
                        {gameStatus === 'paused' ? 'Resume' : 'Pause'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.halfButton, {
                        opacity: gameStatus !== 'in_progress' || isLoadingHint ? 0.5 : 1
                    }]}
                    onPress={onHint}
                    disabled={gameStatus !== 'in_progress' || isLoadingHint}
                >
                    {isLoadingHint ? (
                        <ActivityIndicator size="small" color={Colors.light.text} />
                    ) : (
                        <Ionicons name="bulb-outline" size={20} color={Colors.light.text} />
                    )}
                    <Text style={styles.buttonText}>
                        {isLoadingHint ? 'Analyzing...' : 'Hint'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Resign Button */}
            <TouchableOpacity
                style={[styles.button, styles.resignButton, {
                    opacity: gameStatus !== 'in_progress' ? 0.5 : 1
                }]}
                onPress={onResign}
                disabled={gameStatus !== 'in_progress'}
            >
                <Ionicons name="flag" size={20} color="#EF4444" />
                <Text style={[styles.buttonText, styles.resignButtonText]}>Resign Game</Text>
            </TouchableOpacity>
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
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    primaryButton: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfButton: {
        flex: 1,
    },
    resignButton: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FEE2E2',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    primaryButtonText: {
        color: '#FFF',
    },
    resignButtonText: {
        color: '#EF4444',
    },
});
