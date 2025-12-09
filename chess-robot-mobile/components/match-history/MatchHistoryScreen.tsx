import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getMatchHistoryStyles } from '@/styles/match-history.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
    const [statsLoading, setStatsLoading] = useState(true);
    const [games, setGames] = useState<GameData[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'win' | 'lose' | 'draw' | 'paused'>('all');
    const [playerStats, setPlayerStats] = useState({
        totalGames: 0,
        winRate: 0,
        currentElo: 0,
        wins: 0,
        losses: 0,
        draws: 0,
    });

    useEffect(() => {
        // Load stats only once on mount
        loadPlayerStats();
    }, []);

    useEffect(() => {
        // Load games whenever filter changes
        loadFilteredGames(selectedFilter);
    }, [selectedFilter]);

    const loadPlayerStats = async () => {
        try {
            setStatsLoading(true);
            const currentUser = await authService.getCurrentUser();
            if (!currentUser?.id) {
                router.replace('/(auth)/login');
                return;
            }

            // Fetch fresh user profile to get stats from database (accurate source of truth)
            const userProfile = await authService.getProfile();
            
            // Use stats from user profile (from database) - most accurate
            const totalGames = (userProfile as any)?.totalGamesPlayed || 0;
            const wins = (userProfile as any)?.wins || 0;
            const losses = (userProfile as any)?.losses || 0;
            const draws = (userProfile as any)?.draws || 0;
            const currentElo = (userProfile as any)?.eloRating || 1200;
            const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

            setPlayerStats({
                totalGames,
                winRate,
                currentElo,
                wins,
                losses,
                draws,
            });
        } catch (error) {
            console.error('Failed to load player stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadFilteredGames = async (filter: 'all' | 'win' | 'lose' | 'draw' | 'paused') => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            if (!currentUser?.id) {
                router.replace('/(auth)/login');
                return;
            }

            // Build filter parameters for API
            const filters: { status?: string; result?: string } = {};
            
            if (filter === 'all') {
                // Get all displayable games (finished, aborted, paused)
                // No API filter, will filter client-side
            } else if (filter === 'paused') {
                filters.status = 'paused';
            } else {
                // win, lose, draw filters
                filters.status = 'finished';
                filters.result = filter;
            }

            // Fetch player games with filters
            const gamesData = await gameService.getPlayerGames(currentUser.id);

            // Additional client-side filter for 'all' case
            let displayGames = gamesData;
            if (filter === 'all') {
                displayGames = gamesData.filter(
                    (game: GameData) => game.status === 'finished' || game.status === 'aborted' || game.status === 'paused'
                );
            }

            setGames(displayGames);
        } catch (error) {
            console.error('Failed to load filtered games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filter: 'all' | 'win' | 'lose' | 'draw' | 'paused') => {
        setSelectedFilter(filter);
    };

    const getResultColor = (result: string, status?: string) => {
        // If game is paused, show purple
        if (status === 'paused') return '#8B5CF6';
        
        const lowerResult = result?.toLowerCase();
        switch (lowerResult) {
            case 'win': return '#23b249';
            case 'lose': return '#EF4444';
            case 'draw': return '#1567b1';
            default: return Colors.light.text;
        }
    };

    const handleGameClick = (game: GameData) => {
        // If game is paused, navigate to VsBot to resume
        if (game.status === 'paused') {
            router.push({
                pathname: '/game/vs-bot',
                params: {
                    resumeGameId: game.id,
                    difficulty: game.difficulty || 'medium',
                    difficultyName: game.difficulty ? game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1) : 'Medium',
                    elo: '1500'
                }
            });
        } else {
            // Otherwise, show match detail
            router.push(`/match-history/${game.id}`);
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
        <TouchableOpacity style={styles.matchCard} onPress={() => handleGameClick(item)}>
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
                <View style={[styles.resultBadge, { backgroundColor: getResultColor(item.result || '', item.status) + '20', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    {item.status === 'paused' ? (
                        <>
                            <Ionicons name="pause" size={14} color="#8B5CF6" />
                            <Text style={[styles.resultText, { color: '#8B5CF6' }]}>Paused</Text>
                        </>
                    ) : (
                        <Text style={[styles.resultText, { color: getResultColor(item.result || '', item.status) }]}>
                            {item.result ? item.result.charAt(0).toUpperCase() + item.result.slice(1) : 'N/A'}
                        </Text>
                    )}
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
                            color={item.ratingChange > 0 ? '#23b249' : '#EF4444'}
                        />
                        <Text style={[styles.statText, { color: item.ratingChange > 0 ? '#23b249' : '#EF4444' }]}>
                            {item.ratingChange > 0 ? '+' : ''}{item.ratingChange} ELO
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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
                                <Text style={styles.summaryValue}>{statsLoading ? '-' : playerStats.totalGames}</Text>
                                <Text style={styles.summaryLabel}>Total Games</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{statsLoading ? '-' : `${playerStats.winRate}%`}</Text>
                                <Text style={styles.summaryLabel}>Win Rate</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{statsLoading ? '-' : playerStats.currentElo}</Text>
                                <Text style={styles.summaryLabel}>Current ELO</Text>
                            </View>
                        </View>
                        <Text style={styles.sectionTitle}>Recent Matches</Text>
                        
                        {/* Filter Tabs */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                onPress={() => handleFilterChange('all')}
                                style={[
                                    styles.filterButton,
                                    { backgroundColor: selectedFilter === 'all' ? Colors.light.primary : '#F3F4F6' }
                                ]}
                            >
                                <Ionicons name="list" size={16} color={selectedFilter === 'all' ? 'white' : Colors.light.text} />
                                <Text style={[styles.filterText, { color: selectedFilter === 'all' ? 'white' : Colors.light.text }]}>All</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('win')}
                                style={[
                                    styles.filterButton,
                                    { backgroundColor: selectedFilter === 'win' ? '#23b249' : '#F3F4F6' }
                                ]}
                            >
                                <Ionicons name="trophy" size={16} color={selectedFilter === 'win' ? 'white' : '#23b249'} />
                                <Text style={[styles.filterText, { color: selectedFilter === 'win' ? 'white' : Colors.light.text }]}>Win</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('lose')}
                                style={[
                                    styles.filterButton,
                                    { backgroundColor: selectedFilter === 'lose' ? '#EF4444' : '#F3F4F6' }
                                ]}
                            >
                                <Ionicons name="close" size={16} color={selectedFilter === 'lose' ? 'white' : '#EF4444'} />
                                <Text style={[styles.filterText, { color: selectedFilter === 'lose' ? 'white' : Colors.light.text }]}>Lose</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('draw')}
                                style={[
                                    styles.filterButton,
                                    { backgroundColor: selectedFilter === 'draw' ? '#1567b1' : '#F3F4F6' }
                                ]}
                            >
                                <Ionicons name="remove" size={16} color={selectedFilter === 'draw' ? 'white' : '#1567b1'} />
                                <Text style={[styles.filterText, { color: selectedFilter === 'draw' ? 'white' : Colors.light.text }]}>Draw</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleFilterChange('paused')}
                                style={[
                                    styles.filterButton,
                                    { backgroundColor: selectedFilter === 'paused' ? '#8B5CF6' : '#F3F4F6' }
                                ]}
                            >
                                <Ionicons name="pause" size={16} color={selectedFilter === 'paused' ? 'white' : '#8B5CF6'} />
                                <Text style={[styles.filterText, { color: selectedFilter === 'paused' ? 'white' : Colors.light.text }]}>Paused</Text>
                            </TouchableOpacity>
                        </View>
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
