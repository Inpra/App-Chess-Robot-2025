import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ChessBoard from '../game/ChessBoard';

// Mock Board State for Puzzle (Example: Mate in 1)
const puzzleBoard = [
    null, null, null, null, null, null, null, { type: 'k', color: 'b' },
    null, null, null, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' },
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    { type: 'q', color: 'w' }, null, null, null, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' },
    null, null, null, null, null, null, { type: 'k', color: 'w' }, null,
];

export default function PuzzleGameScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Game State
    const [board, setBoard] = useState(puzzleBoard);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ row: number, col: number }[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Logic helpers
    const handleSquareClick = (row: number, col: number) => {
        const index = row * 8 + col;
        const piece = board[index];

        // If a square is already selected
        if (selectedSquare) {
            const selectedIndex = selectedSquare.row * 8 + selectedSquare.col;
            const selectedPiece = board[selectedIndex];

            // If clicking the same square, deselect
            if (selectedSquare.row === row && selectedSquare.col === col) {
                setSelectedSquare(null);
                setPossibleMoves([]);
                return;
            }

            // Check if this is a valid move
            const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);

            if (isValidMove) {
                // Make the move
                const newBoard = [...board];
                newBoard[index] = selectedPiece; // Place piece at destination
                newBoard[selectedIndex] = null; // Remove piece from source
                setBoard(newBoard);
                setSelectedSquare(null);
                setPossibleMoves([]);

                // Mock Success Check (if moving Queen to h8)
                if (selectedPiece?.type === 'q' && row === 0 && col === 7) {
                    setMessage('Correct! Checkmate.');
                } else {
                    setMessage('Incorrect move. Try again.');
                    // Reset board after delay (mock)
                    setTimeout(() => {
                        setBoard(puzzleBoard);
                        setMessage(null);
                    }, 1000);
                }

            } else if (piece && piece.color === selectedPiece?.color) {
                // Select a different piece of the same color
                setSelectedSquare({ row, col });
                // Mock possible moves for demo
                setPossibleMoves([
                    { row: 0, col: 7 }, // Winning move for demo
                    { row: row - 1, col: col },
                ]);
            } else {
                // Invalid move, deselect
                setSelectedSquare(null);
                setPossibleMoves([]);
            }
        } else {
            // Select piece
            if (piece && piece.color === 'w') { // Only allow moving white pieces
                setSelectedSquare({ row, col });
                // Mock possible moves for demo
                setPossibleMoves([
                    { row: 0, col: 7 }, // Winning move for demo
                    { row: row - 1, col: col },
                ]);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title={`Puzzle #${id}`}
                onBack={() => router.navigate('/puzzles')}
            />

            <View style={styles.contentContainer}>
                {/* Board Section: Match Header + Board */}
                <View style={styles.boardSection}>
                    {/* Match Header Card */}
                    <View style={styles.matchHeader}>
                        {/* Puzzle Bot (Left) */}
                        <View style={styles.playerSide}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="hardware-chip" size={20} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetails}>
                                <Text style={styles.playerName}>Puzzle Bot</Text>
                                <Text style={styles.playerElo}>1200</Text>
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
                        board={board}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        possibleMoves={possibleMoves}
                        styles={styles}
                    />
                </View>

                {/* Sidebar: Controls & Info */}
                <View style={styles.sidebar}>
                    {/* Feedback Message */}
                    {message && (
                        <View style={{
                            padding: 16,
                            backgroundColor: message.includes('Correct') ? '#D1FAE5' : '#FEE2E2',
                            borderRadius: 16,
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                color: message.includes('Correct') ? '#065F46' : '#991B1B',
                                fontWeight: '600',
                                fontSize: 16
                            }}>
                                {message}
                            </Text>
                        </View>
                    )}

                    {/* Robot Status */}
                    <View style={styles.statusCard}>
                        <Text style={styles.statusText}>Robot Status</Text>
                        <View style={styles.statusIndicator}>
                            <View style={[styles.dot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
                            <Text style={{ color: Colors.light.icon }}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
                        </View>
                    </View>

                    {/* Game Actions */}
                    <View style={styles.actionsCard}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => setIsConnected(!isConnected)}
                        >
                            <Ionicons name={isConnected ? "bluetooth" : "bluetooth-outline"} size={20} color="#FFF" />
                            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                                {isConnected ? 'Disconnect Robot' : 'Connect Robot'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                <Ionicons name="arrow-undo" size={20} color={Colors.light.text} />
                                <Text style={styles.actionButtonText}>Undo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                <Ionicons name="pause" size={20} color={Colors.light.text} />
                                <Text style={styles.actionButtonText}>Pause</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                <Ionicons name="bulb" size={20} color={Colors.light.text} />
                                <Text style={styles.actionButtonText}>Hint</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
