import { Colors } from '@/constants/theme';
import { getDifficultySelectStyles } from '@/styles/difficulty-select.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

interface GameModeModalProps {
    visible: boolean;
    onClose: () => void;
}

const difficulties = [
    {
        id: 'easy',
        title: 'Easy',
        subtitle: 'Beginner Friendly',
        elo: 800,
        color: '#23b249', // Green
        icon: 'leaf' as const,
        description: 'Perfect for learning the basics. The AI will make occasional mistakes.',
    },
    {
        id: 'medium',
        title: 'Medium',
        subtitle: 'Casual Player',
        elo: 1500,
        color: '#f16f23', // Orange
        icon: 'flame' as const,
        description: 'A balanced challenge. Good for practicing tactics and strategy.',
    },
    {
        id: 'hard',
        title: 'Hard',
        subtitle: 'Grandmaster Challenge',
        elo: 2400,
        color: '#EF4444', // Red
        icon: 'skull' as const,
        description: 'Test your skills against a powerful engine. Expect no mercy.',
    },
];

export default function GameModeModal({ visible, onClose }: GameModeModalProps) {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getDifficultySelectStyles(dimensions), [dimensions]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Game Mode</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        contentContainerStyle={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.subtitle}>Choose a difficulty level to start the match.</Text>

                        <View style={styles.cardsContainer}>
                            {difficulties.map((level) => (
                                <Link
                                    key={level.id}
                                    href={{
                                        pathname: "/game/vs-bot",
                                        params: { difficulty: level.id, elo: level.elo }
                                    } as any}
                                    asChild
                                >
                                    <TouchableOpacity
                                        style={styles.card}
                                        activeOpacity={0.8}
                                        onPress={onClose}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: level.color }]}>
                                            <Ionicons name={level.icon} size={32} color="white" />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>{level.title}</Text>
                                                <View style={[styles.eloTag, { backgroundColor: level.color + '20' }]}>
                                                    <Text style={[styles.eloText, { color: level.color }]}>ELO {level.elo}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardSubtitle}>{level.subtitle}</Text>
                                            <Text style={styles.cardDescription}>{level.description}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
                                    </TouchableOpacity>
                                </Link>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
