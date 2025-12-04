import { Chess } from 'chess.js';
import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ChessBoard from '../game/ChessBoard';

import CameraView from '../camera/CameraView';
import { CAMERA_CONFIG } from '@/services/apiConfig';

// Mock Puzzle FEN (Mate in 1)
const PUZZLE_FEN = '7k/7p/8/8/8/8/Q5PP/6K1 w - - 0 1'; // White to move

export default function PuzzleGameScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Game State
    const [game, setGame] = useState(new Chess(PUZZLE_FEN));
    const [fen, setFen] = useState(game.fen());
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ row: number, col: number }[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

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

                    // Check if puzzle solved (Mock logic: if checkmate)
                    if (game.isCheckmate()) {
                        setMessage('Correct! Checkmate.');
                    } else {
                        setMessage('Incorrect move. Try again.');
                        // Reset board after delay
                        setTimeout(() => {
                            game.load(PUZZLE_FEN);
                            setFen(game.fen());
                            setMessage(null);
                        }, 1000);
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
                        fen={fen}
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
                    {/* Robot Camera (Embedded) */}
                    <CameraView
                        mode="embedded"
                        isConnected={isConnected}
                        onExpand={() => setShowCamera(true)}
                        streamUrl={CAMERA_CONFIG.STREAM_URL}
                    />

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
