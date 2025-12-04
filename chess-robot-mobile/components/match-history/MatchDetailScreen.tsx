import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getMatchDetailStyles } from '@/styles/match-detail.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ActivityIndicator,
} from 'react-native';
import ChessBoard from '../game/ChessBoard';
import gameService from '@/services/gameService';
import type { GameReplayResponse } from '@/services/gameService';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getMatchDetailStyles(dimensions), [dimensions]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replayData, setReplayData] = useState<GameReplayResponse | null>(null);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [fen, setFen] = useState(INITIAL_FEN);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const playInterval = useRef<any>(null);

    // Load replay data
    useEffect(() => {
        if (!id) {
            setError('Game ID is required');
            setLoading(false);
            return;
        }

        loadReplayData();
    }, [id]);

    const loadReplayData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await gameService.getGameReplay(id as string);
            setReplayData(data);

            // Initialize board with starting FEN
            const startFen = data.fenStart || INITIAL_FEN;
            setFen(startFen);
        } catch (err: any) {
            console.error('Failed to load replay data:', err);
            setError(err.message || 'Failed to load game replay');
        } finally {
            setLoading(false);
        }
    };

    // Apply move to board
    const applyMove = useCallback((moveIndex: number) => {
        if (!replayData || moveIndex < 0 || moveIndex > replayData.moves.length) return;

        setCurrentMoveIndex(moveIndex);

        // Apply move based on index
        if (moveIndex === 0) {
            // Reset to starting position
            const startFen = replayData.fenStart || INITIAL_FEN;
            setFen(startFen);
        } else if (moveIndex > 0 && replayData.moves[moveIndex - 1]?.fenStr) {
            // Parse FEN from move and update board
            const moveFen = replayData.moves[moveIndex - 1].fenStr;
            setFen(moveFen);
        }
    }, [replayData]);

    // Auto-play functionality
    useEffect(() => {
        if (isPlaying && replayData) {
            // Clear existing interval if speed changes
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }

            const intervalTime = 1000 / playbackSpeed;

            playInterval.current = setInterval(() => {
                setCurrentMoveIndex(prev => {
                    if (prev >= replayData.moves.length) {
                        setIsPlaying(false);
                        return prev;
                    }
                    applyMove(prev + 1);
                    return prev + 1;
                });
            }, intervalTime);
        } else {
            if (playInterval.current) {
                clearInterval(playInterval.current);
                playInterval.current = null;
            }
        }

        return () => {
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }
        };
    }, [isPlaying, replayData, applyMove, playbackSpeed]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNextMove = () => {
        setIsPlaying(false);
        if (replayData && currentMoveIndex < replayData.moves.length) {
            applyMove(currentMoveIndex + 1);
        }
    };

    const handlePrevMove = () => {
        setIsPlaying(false);
        if (currentMoveIndex > 0) {
            applyMove(currentMoveIndex - 1);
        }
    };

    const handleFirstMove = () => {
        setIsPlaying(false);
        applyMove(0);
    };

    const handleLastMove = () => {
        setIsPlaying(false);
        if (replayData) {
            applyMove(replayData.moves.length);
        }
    };

    const getResultIcon = () => {
        if (!replayData?.result) return null;
        switch (replayData.result.toLowerCase()) {
            case 'win':
                return 'trophy';
            case 'lose':
                return 'trending-down';
            case 'draw':
                return 'remove';
            default:
                return null;
        }
    };

    const getResultColor = () => {
        if (!replayData?.result) return '#6B7280';
        switch (replayData.result.toLowerCase()) {
            case 'win':
                return '#10B981';
            case 'lose':
                return '#EF4444';
            case 'draw':
                return '#6B7280';
            default:
                return '#6B7280';
        }
    };

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <NavigationHeader title="Match Replay" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: Colors.light.textSecondary, marginBottom: 20 }}>{error}</Text>
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.light.primary, padding: 12, borderRadius: 8 }}
                        onPress={() => router.back()}
                    >
                        <Text style={{ color: '#FFF' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Calculate progress for progress bar
    const progress = replayData?.moves.length ? (currentMoveIndex / replayData.moves.length) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title="Match Replay"
                rightComponent={
                    <TouchableOpacity>
                        <Ionicons name="share-outline" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Match Info */}
                <View style={styles.matchInfoCard}>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={20} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text style={styles.playerName}>{loading ? 'Loading...' : (replayData?.playerName || 'You')}</Text>
                            <Text style={styles.playerElo}>
                                {loading ? '-' : (replayData?.playerRatingBefore || 0)}
                                {!loading && replayData?.ratingChange !== undefined && replayData.ratingChange !== 0 && (
                                    <Text style={{ color: replayData.ratingChange > 0 ? '#10B981' : '#EF4444', fontSize: 12 }}>
                                        {' '}({replayData.ratingChange > 0 ? '+' : ''}{replayData.ratingChange})
                                    </Text>
                                )}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.scoreContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                        ) : (
                            <>
                                {getResultIcon() && <Ionicons name={getResultIcon() as any} size={20} color={getResultColor()} />}
                                <Text style={[styles.resultText, { color: getResultColor() }]}>
                                    {replayData?.result?.toUpperCase() || 'N/A'}
                                </Text>
                            </>
                        )}
                    </View>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="hardware-chip" size={20} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text style={styles.playerName}>{loading ? 'Loading...' : `AI (${replayData?.difficulty || 'Medium'})`}</Text>
                            <Text style={styles.playerElo}>
                                {loading ? '-' : (replayData?.difficulty === 'easy' ? '1200' :
                                    replayData?.difficulty === 'hard' ? '2600' : '2000')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Two Column Layout: Board + Controls (Left) | Move List (Right) */}
                <View style={styles.mainLayout}>
                    {/* Left Column - Board + Controls */}
                    <View style={styles.leftColumn}>
                        {/* Chess Board */}
                        <ChessBoard
                            fen={fen}
                            styles={styles}
                            interactive={false}
                            showPossibleMoves={false}
                        />

                        {/* Replay Controls */}
                        <View style={styles.replayControlsCard}>
                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={styles.progressBarTrack}>
                                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                                </View>
                                <View style={[styles.progressBarThumb, { left: `${progress}%`, marginLeft: -8 }]} />
                            </View>

                            {/* Move Counter */}
                            <Text style={styles.moveCounterText}>
                                Move {currentMoveIndex} / {replayData?.moves.length || 0}
                            </Text>

                            {/* Playback Buttons */}
                            <View style={styles.mainControls}>
                                <TouchableOpacity style={styles.controlButton} onPress={handleFirstMove}>
                                    <Ionicons name="play-skip-back" size={20} color={Colors.light.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.controlButton} onPress={handlePrevMove}>
                                    <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.controlButton} onPress={handleNextMove}>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.controlButton} onPress={handleLastMove}>
                                    <Ionicons name="play-skip-forward" size={20} color={Colors.light.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Speed Controls */}
                            <View style={styles.speedControls}>
                                <Text style={styles.speedLabel}>Speed:</Text>
                                {[0.5, 1, 1.5, 2].map((speed) => (
                                    <TouchableOpacity
                                        key={speed}
                                        style={[styles.speedButton, playbackSpeed === speed && styles.speedButtonActive]}
                                        onPress={() => setPlaybackSpeed(speed)}
                                    >
                                        <Text style={[styles.speedButtonText, playbackSpeed === speed && styles.speedButtonTextActive]}>
                                            {speed}x
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Right Column - Move List */}
                    <View style={styles.rightColumn}>
                        {loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={Colors.light.primary} />
                                <Text style={{ marginTop: 12, color: Colors.light.textSecondary }}>Loading game data...</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.moveListContainer}>
                                    <Text style={styles.moveListTitle}>Move History</Text>
                                    <View style={styles.moveListHeader}>
                                        <Text style={[styles.moveListHeaderLabel, { width: 40 }]}>#</Text>
                                        <Text style={styles.moveListHeaderLabel}>White</Text>
                                        <Text style={styles.moveListHeaderLabel}>Black</Text>
                                    </View>
                                    <ScrollView
                                        style={styles.moveListScroll}
                                        contentContainerStyle={{ paddingBottom: 8 }}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={true}
                                    >
                                        <View style={styles.moveGrid}>
                                            {Array.from({ length: Math.ceil((replayData?.moves.length || 0) / 2) }).map((_, i) => {
                                                const moveNum = i + 1;
                                                const whiteMoveIndex = i * 2;
                                                const blackMoveIndex = i * 2 + 1;
                                                const whiteMove = replayData?.moves[whiteMoveIndex];
                                                const blackMove = replayData?.moves[blackMoveIndex];

                                                return (
                                                    <View key={i} style={styles.moveRow}>
                                                        <Text style={styles.moveNumber}>{moveNum}.</Text>

                                                        <TouchableOpacity
                                                            style={[
                                                                styles.moveItem,
                                                                currentMoveIndex === whiteMoveIndex + 1 && styles.activeMove
                                                            ]}
                                                            onPress={() => {
                                                                setIsPlaying(false);
                                                                applyMove(whiteMoveIndex + 1);
                                                            }}
                                                        >
                                                            <Text style={[
                                                                styles.moveItemText,
                                                                currentMoveIndex === whiteMoveIndex + 1 && styles.activeMoveText
                                                            ]}>
                                                                {whiteMove?.notation}
                                                            </Text>
                                                        </TouchableOpacity>

                                                        {blackMove ? (
                                                            <TouchableOpacity
                                                                style={[
                                                                    styles.moveItem,
                                                                    currentMoveIndex === blackMoveIndex + 1 && styles.activeMove
                                                                ]}
                                                                onPress={() => {
                                                                    setIsPlaying(false);
                                                                    applyMove(blackMoveIndex + 1);
                                                                }}
                                                            >
                                                                <Text style={[
                                                                    styles.moveItemText,
                                                                    currentMoveIndex === blackMoveIndex + 1 && styles.activeMoveText
                                                                ]}>
                                                                    {blackMove?.notation}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <View style={styles.moveItemPlaceholder} />
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>

                                {/* Game Statistics Section */}
                                <View style={styles.gameStatsContainer}>
                                    <Text style={styles.gameStatsTitle}>Game Statistics</Text>
                                    <View style={styles.statsGrid}>
                                        {/* Total Moves */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
                                                <Ionicons name="swap-vertical" size={20} color="#2563EB" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>{replayData?.moves.length || 0}</Text>
                                                <Text style={styles.statLabel}>Total Moves</Text>
                                            </View>
                                        </View>

                                        {/* Captures */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                                                <Ionicons name="contract" size={20} color="#DC2626" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>
                                                    {replayData?.moves.filter(m => m.toPiece).length || 0}
                                                </Text>
                                                <Text style={styles.statLabel}>Captures</Text>
                                            </View>
                                        </View>

                                        {/* Checks */}
                                        <View style={styles.statCard}>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                                                <Ionicons name="flash" size={20} color="#D97706" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>
                                                    {replayData?.moves.filter(m => m.resultsInCheck).length || 0}
                                                </Text>
                                                <Text style={styles.statLabel}>Checks</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
