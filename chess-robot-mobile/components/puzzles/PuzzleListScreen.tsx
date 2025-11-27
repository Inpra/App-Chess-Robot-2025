import { Colors } from '@/constants/theme';
import { puzzleListStyles as styles } from '@/styles/puzzles.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock Data
const puzzles = [
    { id: '1', title: 'Mate in 1', rating: 800, solved: true, theme: 'Checkmate' },
    { id: '2', title: 'Fork the Queen', rating: 1000, solved: false, theme: 'Tactics' },
    { id: '3', title: 'Back Rank Mate', rating: 1200, solved: false, theme: 'Checkmate' },
    { id: '4', title: 'Pin to Win', rating: 1400, solved: false, theme: 'Tactics' },
    { id: '5', title: 'Discovered Attack', rating: 1600, solved: false, theme: 'Tactics' },
    { id: '6', title: 'Endgame Magic', rating: 1800, solved: false, theme: 'Endgame' },
    { id: '7', title: 'Queen Sacrifice', rating: 2000, solved: false, theme: 'Sacrifice' },
    { id: '8', title: 'Complex Mate in 3', rating: 2200, solved: false, theme: 'Checkmate' },
];

export default function PuzzleListScreen() {
    const router = useRouter();

    const renderPuzzleItem = ({ item }: { item: any }) => (
        <Link href={`/puzzles/${item.id}`} asChild>
            <TouchableOpacity style={styles.puzzleCard}>
                <View style={[styles.iconContainer, item.solved && styles.iconContainerSolved]}>
                    <Ionicons
                        name={item.solved ? "checkmark-circle" : "extension-puzzle"}
                        size={24}
                        color={item.solved ? "#10B981" : Colors.light.primary}
                    />
                </View>
                <View style={styles.puzzleInfo}>
                    <Text style={styles.puzzleTitle}>{item.title}</Text>
                    <View style={styles.puzzleMeta}>
                        <Text style={styles.puzzleRating}>Rating: {item.rating}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.puzzleTheme}>{item.theme}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chess Puzzles</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={puzzles}
                keyExtractor={(item) => item.id}
                renderItem={renderPuzzleItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
