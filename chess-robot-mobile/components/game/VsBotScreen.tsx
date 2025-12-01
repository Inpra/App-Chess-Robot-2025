import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ChessBoard from './ChessBoard';

// Simple initial board state representation
// null = empty, { type: 'p'|'r'|'n'|'b'|'q'|'k', color: 'w'|'b' }
const initialBoard = [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' },
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' },
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' },
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' },
];

export default function VsBotScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { elo } = useLocalSearchParams();
    const [isConnected, setIsConnected] = useState(false);

    // Game State
    const [board, setBoard] = useState(initialBoard);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ row: number, col: number }[]>([]);
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null); // King in check

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
            } else if (piece && piece.color === selectedPiece?.color) {
                // Select a different piece of the same color
                setSelectedSquare({ row, col });
                // Mock possible moves for demo
                setPossibleMoves([
                    { row: row - 1, col: col },
                    { row: row - 2, col: col }
                ]);
            } else {
                // Invalid move, deselect
                setSelectedSquare(null);
                setPossibleMoves([]);
            }
        } else {
            // Select piece
            if (piece) {
                setSelectedSquare({ row, col });
                // Mock possible moves for demo
                setPossibleMoves([
                    { row: row - 1, col: col },
                    { row: row - 2, col: col }
                ]);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader title="Vs Robot Arm" />

            <View style={styles.contentContainer}>
                {/* Board Section: Players + Board */}
                <View style={styles.boardSection}>
                    {/* Match Header Card */}
                    <View style={styles.matchHeader}>
                        {/* You (Left) */}
                        <View style={styles.playerSide}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={20} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetails}>
                                <Text style={styles.playerName}>You</Text>
                                <Text style={styles.playerElo}>1200</Text>
                            </View>
                        </View>

                        {/* Score/Status (Center) */}
                        <View style={styles.scoreContainer}>

                            <View style={styles.timerPill}>
                                <Text style={styles.timerText}>10:00</Text>
                            </View>
                        </View>

                        {/* Robot (Right) */}
                        <View style={styles.playerSideRight}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="hardware-chip" size={16} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetailsRight}>
                                <Text style={styles.playerName}>Robot</Text>
                                <Text style={styles.playerElo}>{elo || '1500'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chess Board Area */}
                    <ChessBoard
                        board={board}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        possibleMoves={possibleMoves}
                        checkSquare={checkSquare}
                        styles={styles}
                    />
                </View>

                {/* Sidebar: Controls & Info */}
                <View style={styles.sidebar}>
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

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FEF2F2' }]}>
                            <Ionicons name="flag" size={20} color="#EF4444" />
                            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Resign Game</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Move History */}
                    <View style={styles.historyContainer}>
                        <Text style={styles.historyTitle}>Move History</Text>
                        <ScrollView style={styles.historyList}>
                            {[1, 2, 3].map((move) => (
                                <View key={move} style={styles.historyItem}>
                                    <Text style={styles.historyMove}>{move}.</Text>
                                    <Text style={styles.historyMove}>e4</Text>
                                    <Text style={styles.historyMove}>e5</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
