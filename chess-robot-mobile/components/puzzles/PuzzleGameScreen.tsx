import { Chess } from 'chess.js';
import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, useWindowDimensions, View, ActivityIndicator, Alert } from 'react-native';
import ChessBoard from '../game/ChessBoard';
import CameraView from '../camera/CameraView';
import { CAMERA_CONFIG } from '@/services/apiConfig';
import puzzleService, { type TrainingPuzzle } from '@/services/puzzleService';

export default function PuzzleGameScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Puzzle Data
    const [puzzle, setPuzzle] = useState<TrainingPuzzle | null>(null);
    const [loading, setLoading] = useState(true);

    // Game State
    const [game, setGame] = useState<Chess>(new Chess());
    const [fen, setFen] = useState('');
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ row: number, col: number }[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // Load puzzle from API
    useEffect(() => {
        loadPuzzle();
    }, [id]);

    const loadPuzzle = async () => {
        try {
            setLoading(true);
            const puzzleData = await puzzleService.getPuzzleById(id as string);
            setPuzzle(puzzleData);

            // Initialize chess game with puzzle FEN
            const newGame = new Chess(puzzleData.fenStr);
            setGame(newGame);
            setFen(puzzleData.fenStr);
        } catch (error: any) {
            console.error('[PuzzleGame] Error loading puzzle:', error);
            Alert.alert('Error', 'Failed to load puzzle. Please try again.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Logic helpers
    const getSquareName = (row: number, col: number): string => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return `${files[col]}${ranks[row]}`;
    };

    const handleSquareClick = (row: number, col: number) => {
        const squareName = getSquareName(row, col);
        const piece = game.get(squareName as any);

        // If a square is already selected
        if (selectedSquare) {
            const sourceSquare = getSquareName(selectedSquare.row, selectedSquare.col);

            // If clicking the same square, deselect
            if (selectedSquare.row === row && selectedSquare.col === col) {
                setSelectedSquare(null);
                setPossibleMoves([]);
                return;
            }

            try {
                // Try to make move
                const move = game.move({
                    from: sourceSquare,
                    to: squareName,
                    promotion: 'q' // always promote to queen for simplicity
                });

                if (move) {
                    setFen(game.fen());
                    setSelectedSquare(null);
                    setPossibleMoves([]);

                    // Check if puzzle solved by comparing with solution move
                    if (puzzle && move.san === puzzle.solutionMove) {
                        setMessage('✓ Correct! Well done!');
                    } else if (game.isCheckmate()) {
                        setMessage('✓ Checkmate! Puzzle solved.');
                    } else {
                        setMessage('✗ Incorrect move. Try again.');
                        // Reset board after delay
                        setTimeout(() => {
                            if (puzzle) {
                                game.load(puzzle.fenStr);
                                setFen(puzzle.fenStr);
                                setMessage(null);
                            }
                        }, 1500);
                    }

                } else {
                    // Invalid move
                    if (piece && piece.color === game.turn()) {
                        setSelectedSquare({ row, col });
                        const moves = game.moves({ square: squareName as any, verbose: true });
                        setPossibleMoves(moves.map(m => {
                            const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                            const rank = 8 - parseInt(m.to[1]);
                            return { row: rank, col: file };
                        }));
                    } else {
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                    }
                }
            } catch (e) {
                // Invalid move
                if (piece && piece.color === game.turn()) {
                    setSelectedSquare({ row, col });
                    const moves = game.moves({ square: squareName as any, verbose: true });
                    setPossibleMoves(moves.map(m => {
                        const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                        const rank = 8 - parseInt(m.to[1]);
                        return { row: rank, col: file };
                    }));
                } else {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        } else {
            // Select piece
            if (piece && piece.color === game.turn()) {
                setSelectedSquare({ row, col });
                const moves = game.moves({ square: squareName as any, verbose: true });
                setPossibleMoves(moves.map(m => {
                    const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                    const rank = 8 - parseInt(m.to[1]);
                    return { row: rank, col: file };
                }));
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <NavigationHeader
                    title={`Puzzle #${id}`}
                    onBack={() => router.navigate('/puzzles')}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={{ marginTop: 16, color: Colors.light.textSecondary }}>
                        Loading puzzle...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!puzzle) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title={puzzle.name || `Puzzle #${id}`}
                onBack={() => router.navigate('/puzzles')}
            />

            <View style={styles.contentContainer}>
                {/* Board Section: Match Header + Board */}
                <View style={styles.boardSection}>
                    {/* Puzzle Info Card */}
                    <View style={styles.matchHeader}>
                        <View style={styles.playerSide}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="extension-puzzle" size={20} color={Colors.light.primary} />
                            </View>
                            <View style={styles.playerDetails}>
                                <Text style={styles.playerName}>{puzzle.name}</Text>
                                <Text style={styles.playerElo}>
                                    {puzzle.difficulty 
                                        ? puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)
                                        : 'Puzzle'}
                                </Text>
                            </View>
                        </View>

                        {/* Score/Status (Center) */}
                        <View style={styles.scoreContainer}>
                            <View style={styles.timerPill}>
                                <Text style={styles.timerText}>--:--</Text>
                            </View>
                        </View>

                        {/* You (Right) */}
                        <View style={styles.playerSideRight}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={20} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetailsRight}>
                                <Text style={styles.playerName}>You</Text>
                                <Text style={styles.playerElo}>1200</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chess Board Area */}
                    <ChessBoard
                        fen={fen}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        possibleMoves={possibleMoves}
                        styles={styles}
                    />
                </View>

                {/* Sidebar: Controls & Info */}
                <View style={styles.sidebar}>
                    {/* Puzzle Description */}
                    {puzzle.description && (
                        <View style={{
                            padding: 16,
                            backgroundColor: Colors.light.card,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: Colors.light.border,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                color: Colors.light.text,
                                lineHeight: 20,
                            }}>
                                {puzzle.description}
                            </Text>
                        </View>
                    )}

                    {/* Feedback Message */}
                    {message && (
                        <View style={{
                            padding: 16,
                            backgroundColor: message.includes('✓') ? '#D1FAE5' : '#FEE2E2',
                            borderRadius: 16,
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                color: message.includes('✓') ? '#065F46' : '#991B1B',
                                fontWeight: '600',
                                fontSize: 16
                            }}>
                                {message}
                            </Text>
                        </View>
                    )}

                    {/* Game Actions */}
                    <View style={styles.actionsCard}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => {
                                if (puzzle) {
                                    game.load(puzzle.fenStr);
                                    setFen(puzzle.fenStr);
                                    setSelectedSquare(null);
                                    setPossibleMoves([]);
                                    setMessage(null);
                                }
                            }}
                        >
                            <Ionicons name="refresh" size={20} color="#FFF" />
                            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton]}
                            onPress={() => {
                                Alert.alert(
                                    'Solution',
                                    `The solution move is: ${puzzle?.solutionMove || 'N/A'}`,
                                    [{ text: 'OK' }]
                                );
                            }}
                        >
                            <Ionicons name="bulb-outline" size={20} color={Colors.light.text} />
                            <Text style={styles.actionButtonText}>Show Solution</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Robot Camera (Embedded) */}
                    <CameraView
                        mode="embedded"
                        isConnected={isConnected}
                        onExpand={() => setShowCamera(true)}
                        streamUrl={CAMERA_CONFIG.STREAM_URL}
                    />
                </View>
            </View>

            <CameraView
                mode="modal"
                visible={showCamera}
                onClose={() => setShowCamera(false)}
                isConnected={isConnected}
                streamUrl={CAMERA_CONFIG.STREAM_URL}
                title="Robot Camera"
            />
        </SafeAreaView>
    );
}
