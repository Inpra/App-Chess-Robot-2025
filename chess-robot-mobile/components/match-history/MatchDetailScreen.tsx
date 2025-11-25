import { Colors } from '@/constants/theme';
import { getMatchDetailStyles } from '@/styles/match-detail.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

// Mock Board State (Simplified for demo)
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

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getMatchDetailStyles(dimensions), [dimensions]);

    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [board, setBoard] = useState(initialBoard);

    // Mock Moves (Just text for now, in a real app this would drive the board state)
    const moves = [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7',
        'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7',
        'c4', 'c6', 'cxb5', 'axb5', 'Nc3', 'Bb7', 'Bg5', 'h6', 'Bh4', 'Re8',
    ];

    const handleNextMove = () => {
        if (currentMoveIndex < moves.length) {
            setCurrentMoveIndex(prev => prev + 1);
            // In a real implementation, this would update the board state
        }
    };

    const handlePrevMove = () => {
        if (currentMoveIndex > 0) {
            setCurrentMoveIndex(prev => prev - 1);
            // In a real implementation, this would revert the board state
        }
    };

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

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Match Replay</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Match Info */}
                <View style={styles.matchInfoCard}>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={20} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text style={styles.playerName}>You</Text>
                            <Text style={styles.playerElo}>2450</Text>
                        </View>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.score}>1 - 0</Text>
                        <Text style={styles.resultText}>Win</Text>
                    </View>
                    <View style={styles.playerInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="hardware-chip" size={20} color="#9CA3AF" />
                        </View>
                        <View>
                            <Text style={styles.playerName}>Robot</Text>
                            <Text style={styles.playerElo}>2438</Text>
                        </View>
                    </View>
                </View>

                {/* Two Column Layout: Board + Controls (Left) | Move List (Right) */}
                <View style={styles.mainLayout}>
                    {/* Left Column - Board + Controls */}
                    <View style={styles.leftColumn}>
                        {/* Chess Board */}
                        <View style={styles.boardContainer}>
                            <View style={styles.boardPlaceholder}>
                                <Image
                                    source={require('@/assets/images/chessboard.png')}
                                    style={{ width: '100%', height: '100%', resizeMode: 'stretch', borderRadius: 16 }}
                                />
                                <View style={styles.gridOverlay}>
                                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                                        Array.from({ length: 8 }).map((_, colIndex) => {
                                            const index = rowIndex * 8 + colIndex;
                                            const piece = board[index];
                                            return (
                                                <View key={`${rowIndex}-${colIndex}`} style={styles.square}>
                                                    {piece && (
                                                        <Image
                                                            source={getPieceImageSource(piece.type, piece.color)}
                                                            style={{ width: '85%', height: '85%', resizeMode: 'contain' }}
                                                        />
                                                    )}
                                                </View>
                                            );
                                        })
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Controls */}
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity
                                style={[styles.controlButton, currentMoveIndex === 0 && styles.disabledButton]}
                                onPress={handlePrevMove}
                                disabled={currentMoveIndex === 0}
                            >
                                <Ionicons name="play-skip-back" size={24} color={currentMoveIndex === 0 ? '#D1D5DB' : Colors.light.text} />
                            </TouchableOpacity>

                            <View style={styles.moveDisplay}>
                                <Text style={styles.moveText}>
                                    {currentMoveIndex > 0 ? `${Math.ceil(currentMoveIndex / 2)}. ${moves[currentMoveIndex - 1]}` : 'Start'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.controlButton, currentMoveIndex === moves.length && styles.disabledButton]}
                                onPress={handleNextMove}
                                disabled={currentMoveIndex === moves.length}
                            >
                                <Ionicons name="play-skip-forward" size={24} color={currentMoveIndex === moves.length ? '#D1D5DB' : Colors.light.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Right Column - Move List */}
                    <View style={styles.rightColumn}>
                        <View style={styles.moveListContainer}>
                            <Text style={styles.moveListTitle}>Move List</Text>
                            <ScrollView
                                style={styles.moveListScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.moveGrid}>
                                    {moves.map((move, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.moveItem, index === currentMoveIndex - 1 && styles.activeMove]}
                                            onPress={() => setCurrentMoveIndex(index + 1)}
                                        >
                                            <Text style={[styles.moveItemText, index === currentMoveIndex - 1 && styles.activeMoveText]}>
                                                {index % 2 === 0 ? `${index / 2 + 1}.` : ''} {move}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
