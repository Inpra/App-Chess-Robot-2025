import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MatchHeaderProps {
    userElo?: number;
    robotElo?: number;
    difficultyName?: string;
    timer?: string;
    styles: any; // Styles passed from parent
}

export default function MatchHeader({
    userElo = 1200,
    robotElo = 800,
    difficultyName = 'Easy',
    timer = '10:00',
    styles
}: MatchHeaderProps) {
    return (
        <View style={styles.matchHeader}>
            {/* You (Left) */}
            <View style={styles.playerSide}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={20} color="#667eea" />
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
                    <Text style={styles.playerName}>Robot ({difficultyName})</Text>
                    <Text style={styles.playerElo}>{robotElo}</Text>
                </View>
                <View style={styles.avatarContainer}>
                    <Ionicons name="hardware-chip" size={20} color="#EF4444" />
                </View>
            </View>
        </View>
    );
}

// Styles are now provided by parent component (game.styles.ts)
