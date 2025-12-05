import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { puzzleListStyles as styles } from '@/styles/puzzles.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import puzzleService, { type TrainingPuzzle } from '@/services/puzzleService';

export default function PuzzleListScreen() {
    const router = useRouter();
    const [puzzles, setPuzzles] = useState<TrainingPuzzle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadPuzzles();
    }, [filter]);

    const loadPuzzles = async () => {
        try {
            setLoading(true);
            let data: TrainingPuzzle[];

            if (filter === 'all') {
                data = await puzzleService.getAllPuzzles();
            } else {
                data = await puzzleService.getPuzzlesByDifficulty(filter);
            }

            setPuzzles(data);
        } catch (error: any) {
            console.error('[PuzzleList] Error loading puzzles:', error);
            Alert.alert('Error', 'Failed to load puzzles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyRating = (difficulty?: string): number => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 800;
            case 'easy': return 1000;
            case 'medium': return 1400;
            case 'hard': return 1800;
            case 'expert': return 2200;
            default: return 1200;
        }
    };

    const renderPuzzleItem = ({ item }: { item: TrainingPuzzle }) => (
        <Link href={`/puzzles/${item.id}`} asChild>
            <TouchableOpacity style={styles.puzzleCard}>
                <View style={[styles.iconContainer]}>
                    <Ionicons
                        name="extension-puzzle"
                        size={24}
                        color={Colors.light.primary}
                    />
                </View>
                <View style={styles.puzzleInfo}>
                    <Text style={styles.puzzleTitle}>{item.name}</Text>
                    <View style={styles.puzzleMeta}>
                        <Text style={styles.puzzleRating}>
                            Rating: {getDifficultyRating(item.difficulty)}
                        </Text>
                        {item.difficulty && (
                            <>
                                <View style={styles.dot} />
                                <Text style={styles.puzzleTheme}>
                                    {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                                </Text>
                            </>
                        )}
                    </View>
                    {item.description && (
                        <Text style={styles.puzzleDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </Link>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <NavigationHeader
                    title="Chess Puzzles"
                    onBack={() => router.navigate('/(tabs)')}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={{ marginTop: 16, color: Colors.light.textSecondary }}>
                        Loading puzzles...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title="Chess Puzzles"
                onBack={() => router.navigate('/(tabs)')}
            />

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'easy' && styles.filterTabActive]}
                    onPress={() => setFilter('easy')}
                >
                    <Text style={[styles.filterText, filter === 'easy' && styles.filterTextActive]}>
                        Easy
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'medium' && styles.filterTabActive]}
                    onPress={() => setFilter('medium')}
                >
                    <Text style={[styles.filterText, filter === 'medium' && styles.filterTextActive]}>
                        Medium
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'hard' && styles.filterTabActive]}
                    onPress={() => setFilter('hard')}
                >
                    <Text style={[styles.filterText, filter === 'hard' && styles.filterTextActive]}>
                        Hard
                    </Text>
                </TouchableOpacity>
            </View>

            {puzzles.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="extension-puzzle-outline" size={64} color={Colors.light.textSecondary} />
                    <Text style={{ marginTop: 16, fontSize: 16, color: Colors.light.textSecondary }}>
                        No puzzles found
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center' }}>
                        Try selecting a different difficulty level
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={puzzles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPuzzleItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
