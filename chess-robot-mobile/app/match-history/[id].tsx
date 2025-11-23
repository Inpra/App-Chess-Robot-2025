import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

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
                    <Ionicons name="person" size={20} color="#6B7280" />
                </View>
                <Text style={styles.playerName}>You</Text>
                <Text style={styles.playerElo}>2450</Text>
            </View>
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>1 - 0</Text>
                <Text style={styles.resultText}>Win</Text>
            </View>
            <View style={styles.playerInfo}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="hardware-chip" size={20} color="#6B7280" />
                </View>
                <Text style={styles.playerName}>Robot</Text>
                <Text style={styles.playerElo}>2438</Text>
            </View>
        </View>

        {/* Chess Board */}
        <View style={styles.boardContainer}>
            <View style={styles.boardPlaceholder}>
                <Image
                    source={require('@/assets/images/chessboard.png')}
                    style={{ width: '100%', height: '100%', resizeMode: 'stretch', borderRadius: 8 }}
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
                <Ionicons name="play-skip-back" size={24} color={currentMoveIndex === 0 ? '#D1D5DB' : '#111827'} />
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
                <Ionicons name="play-skip-forward" size={24} color={currentMoveIndex === moves.length ? '#D1D5DB' : '#111827'} />
            </TouchableOpacity>
        </View>

        {/* Move List */}
        <View style={styles.moveListContainer}>
            <Text style={styles.moveListTitle}>Move List</Text>
            <View style={styles.moveGrid}>
                {moves.map((move, index) => (
                    <View key={index} style={[styles.moveItem, index === currentMoveIndex - 1 && styles.activeMove]}>
                        <Text style={[styles.moveItemText, index === currentMoveIndex - 1 && styles.activeMoveText]}>
                            {index % 2 === 0 ? `${index / 2 + 1}.` : ''} {move}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
      padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  matchInfoCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: Colors.light.card,
      padding: 16,
      borderRadius: 16,
      width: '100%',
      marginBottom: 24,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
        android: { elevation: 2 },
    }),
  },
  playerInfo: {
      alignItems: 'center',
      gap: 4,
  },
  avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
  },
  playerName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#111827',
  },
  playerElo: {
      fontSize: 12,
      color: '#6B7280',
  },
  scoreContainer: {
      alignItems: 'center',
  },
  score: {
      fontSize: 24,
      fontWeight: '800',
      color: '#111827',
      marginBottom: 4,
  },
  resultText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#10B981',
  },
  boardContainer: {
    width: width - 40,
    height: width - 40,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  boardPlaceholder: {
      width: '100%',
      height: '100%',
  },
  gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  square: {
      width: '12.5%',
      height: '12.5%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      marginBottom: 32,
      width: '100%',
  },
  controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.light.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.light.border,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 2 },
    }),
  },
  disabledButton: {
      opacity: 0.5,
      backgroundColor: Colors.light.background,
  },
  moveDisplay: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: Colors.light.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.light.border,
      minWidth: 120,
      alignItems: 'center',
  },
  moveText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111827',
  },
  moveListContainer: {
      width: '100%',
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      padding: 16,
  },
  moveListTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 12,
  },
  moveGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  moveItem: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
  },
  activeMove: {
      backgroundColor: '#DBEAFE',
  },
  moveItemText: {
      fontSize: 14,
      color: '#4B5563',
      fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  activeMoveText: {
      color: '#1E40AF',
      fontWeight: '700',
  },
});
