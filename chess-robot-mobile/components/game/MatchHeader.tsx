import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface MatchHeaderProps {
    userElo?: number;
    robotElo?: number;
    difficultyName?: string;
    timer?: string;
}

export default function MatchHeader({
    userElo = 1200,
    robotElo = 800,
    difficultyName = 'Easy',
    timer = '10:00'
}: MatchHeaderProps) {
    return (
        <View style={styles.container}>
            {/* You (Left) */}
            <View style={styles.playerSide}>
                <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                </View>
                <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>You</Text>
                    <Text style={styles.playerElo}>{userElo}</Text>
                </View>
            </View>

            {/* Timer (Center) */}
            <View style={styles.scoreContainer}>
                <View style={styles.timerPill}>
                    <Text style={styles.timerText}>{timer}</Text>
                </View>
            </View>

            {/* Robot (Right) */}
            <View style={styles.playerSideRight}>
                <View style={styles.playerDetailsRight}>
                    <Text style={styles.playerNameRight}>Robot ({difficultyName})</Text>
                    <Text style={styles.playerEloRight}>{robotElo}</Text>
                </View>
                <View style={styles.avatar}>
                    <Ionicons name="hardware-chip-outline" size={20} color={Colors.textSecondary} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.cardBackground,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    playerSide: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    playerSideRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerDetails: {
        alignItems: 'flex-start',
    },
    playerDetailsRight: {
        alignItems: 'flex-end',
    },
    playerName: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    playerNameRight: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
        textAlign: 'right',
    },
    playerElo: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    playerEloRight: {
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: 'right',
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    timerPill: {
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timerText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
});
