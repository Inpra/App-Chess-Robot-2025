import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getMatchHistoryStyles } from '@/styles/match-history.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ActivityIndicator,
} from 'react-native';
import gameService from '@/services/gameService';
import authService from '@/services/authService';

interface GameData {
    id: string;
    playerId?: string;
    playerName?: string;
    status?: string;
    result?: string;
    difficulty?: string;
    totalMoves?: number;
    startedAt?: string;
    endedAt?: string;
    playerRatingBefore?: number;
    playerRatingAfter?: number;
    ratingChange?: number;
    gameType?: {
        code: string;
        name: string;
    };
}

export default function MatchHistoryScreen() {
    const router = useRouter();
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getMatchHistoryStyles(dimensions), [dimensions]);

    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState<GameData[]>([]);
    const [playerStats, setPlayerStats] = useState({
        totalGames: 0,
        winRate: 0,
        currentElo: 0,
        wins: 0,
        losses: 0,
        draws: 0,
    });

    useEffect(() => {
        loadMatchHistory();
    }, []);

    const loadMatchHistory = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            if (!currentUser?.id) {
                router.replace('/(auth)/login');
                return;
            }

            // Fetch player games
            const gamesData = await gameService.getPlayerGames(currentUser.id);

            // Filter finished games only
            const finishedGames = gamesData.filter(
                (game: GameData) => game.status === 'completed' || game.status === 'finished' || game.status === 'aborted'
            );

            setGames(finishedGames);

            // Calculate statistics
            const wins = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'win').length;
            const losses = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'lose').length;
            const draws = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'draw').length;
            const total = finishedGames.length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

            // Get current Elo from most recent game or user profile
            const latestGame = finishedGames[0];
            const currentElo = latestGame?.playerRatingAfter ?? (currentUser as any)?.eloRating ?? 1200;

            setPlayerStats({
                totalGames: total,
                winRate,
                currentElo,
                wins,
                losses,
                draws,
            });
        } catch (error) {
            console.error('Failed to load match history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResultColor = (result: string) => {
        const lowerResult = result?.toLowerCase();
        switch (lowerResult) {
            case 'win': return '#10B981';
            case 'lose': return '#EF4444';
            case 'draw': return '#F59E0B';
            default: return Colors.light.text;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getDifficultyDisplay = (difficulty?: string) => {
        if (!difficulty) return 'AI';
        return `AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
    };

    const renderItem = ({ item }: { item: GameData }) => (
        <Link href={`/match-history/${item.id}`} asChild>
            <TouchableOpacity style={styles.matchCard}>
                <View style={styles.matchHeader}>
                    <View style={styles.opponentInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="hardware-chip" size={24} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text style={styles.opponentName}>{getDifficultyDisplay(item.difficulty)}</Text>
                            <Text style={styles.matchDate}>{formatDate(item.startedAt)}</Text>
                        </View>
                    </View>
                    <View style={[styles.resultBadge, { backgroundColor: getResultColor(item.result || '') + '20' }]}>
                        <Text style={[styles.resultText, { color: getResultColor(item.result || '') }]}>
                            {item.result ? item.result.charAt(0).toUpperCase() + item.result.slice(1) : 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.matchStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="swap-vertical-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.statText}>{item.totalMoves || 0} Moves</Text>
                    </View>
                    {item.ratingChange !== undefined && item.ratingChange !== 0 && (
                        <View style={styles.statItem}>
                            <Ionicons
                                name={item.ratingChange > 0 ? "trending-up-outline" : "trending-down-outline"}
                                size={18}
                                color={item.ratingChange > 0 ? '#10B981' : '#EF4444'}
                            />
                            <Text style={[styles.statText, { color: item.ratingChange > 0 ? '#10B981' : '#EF4444' }]}>
                                {item.ratingChange > 0 ? '+' : ''}{item.ratingChange} ELO
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title="Match History"
                onBack={() => router.navigate('/(tabs)')}
            />

            <FlatList
                data={games}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <View style={styles.statsSummary}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{loading ? '-' : playerStats.totalGames}</Text>
                                <Text style={styles.summaryLabel}>Total Games</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{loading ? '-' : `${playerStats.winRate}%`}</Text>
                                <Text style={styles.summaryLabel}>Win Rate</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{loading ? '-' : playerStats.currentElo}</Text>
                                <Text style={styles.summaryLabel}>Current ELO</Text>
                            </View>
                        </View>
                        <Text style={styles.sectionTitle}>Recent Matches</Text>
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.light.primary} />
                            <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading history...</Text>
                        </View>
                    ) : (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: Colors.light.textSecondary }}>No matches found</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}
