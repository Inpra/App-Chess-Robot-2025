import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

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

    // Helper to get piece image source
    const getPieceImageSource = (type: string, color: string) => {
        const pieceKey = `${color}${type}`;
        switch (pieceKey) {
            case 'wp': return require('@/assets/images/wp.png');
            case 'wr': return require('@/assets/images/wr.png');
            case 'wn': return require('@/assets/images/wn.png');
            case 'wb': return require('@/assets/images/wb.png');
            case 'wq': return require('@/assets/images/wq.png');
            case 'wk': return require('@/assets/images/wk.png');
            case 'bp': return require('@/assets/images/bp.png');
            case 'br': return require('@/assets/images/br.png');
            case 'bn': return require('@/assets/images/bn.png');
            case 'bb': return require('@/assets/images/bb.png');
            case 'bq': return require('@/assets/images/bq.png');
            case 'bk': return require('@/assets/images/bk.png');
            default: return null;
        }
    };

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

    const isSquareSelected = (row: number, col: number) => {
        return selectedSquare?.row === row && selectedSquare?.col === col;
    };

    const isPossibleMove = (row: number, col: number) => {
        return possibleMoves.some(move => move.row === row && move.col === col);
    };

    const isSquareInCheck = (row: number, col: number) => {
        return checkSquare?.row === row && checkSquare?.col === col;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vs Robot Arm</Text>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.contentContainer}>
                {/* Player Info (Top - Opponent) */}
                <View style={styles.playerInfoContainer}>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="hardware-chip" size={20} color="#6B7280" />
                        </View>
                        <Text style={styles.playerName}>Robot Arm</Text>
                        <Text style={styles.playerElo}>{elo || '1500'}</Text>
                    </View>
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>10:00</Text>
                    </View>
                </View>

                {/* Chess Board Area */}
                <View style={styles.boardContainer}>
                    <View style={styles.boardPlaceholder}>
                        <Image
                            source={require('@/assets/images/chessboard.png')}
                            style={{ width: '100%', height: '100%', resizeMode: 'stretch', borderRadius: 16 }}
                        />
                        {/* Chess Pieces Overlay */}
                        <View style={styles.gridOverlay}>
                            {Array.from({ length: 8 }).map((_, rowIndex) => (
                                Array.from({ length: 8 }).map((_, colIndex) => {
                                    const index = rowIndex * 8 + colIndex;
                                    const piece = board[index];
                                    const isSelected = isSquareSelected(rowIndex, colIndex);
                                    const isPossible = isPossibleMove(rowIndex, colIndex);
                                    const isCheck = isSquareInCheck(rowIndex, colIndex);

                                    return (
                                        <TouchableOpacity
                                            key={`${rowIndex}-${colIndex}`}
                                            style={[
                                                styles.square,
                                                isSelected && styles.selectedSquare,
                                                isCheck && styles.checkSquare
                                            ]}
                                            onPress={() => handleSquareClick(rowIndex, colIndex)}
                                            activeOpacity={0.7}
                                        >
                                            {/* Possible Move Dot */}
                                            {isPossible && !piece && (
                                                <View style={styles.possibleMoveDot} />
                                            )}

                                            {/* Possible Capture Ring (optional, reusing dot for now or custom style) */}
                                            {isPossible && piece && (
                                                <View style={[styles.possibleMoveDot, { backgroundColor: 'rgba(255, 0, 0, 0.4)', width: '100%', height: '100%', borderRadius: 0 }]} />
                                            )}

                                            {piece && (
                                                <Image
                                                    source={getPieceImageSource(piece.type, piece.color)}
                                                    style={{ width: '85%', height: '85%', resizeMode: 'contain' }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            ))}
                        </View>
                    </View>
                </View>

                {/* Player Info (Bottom - User) */}
                <View style={styles.playerInfoContainer}>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={20} color="#6B7280" />
                        </View>
                        <Text style={styles.playerName}>You</Text>
                        <Text style={styles.playerElo}>1200</Text>
                    </View>
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>10:00</Text>
                    </View>
                </View>

                {/* Controls & Info */}
                <View style={styles.controlsContainer}>
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
