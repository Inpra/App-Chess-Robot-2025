import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export interface Move {
    moveNumber: number;
    white?: string;
    black?: string;
}

export interface MoveHistoryProps {
    moves: Move[];
    currentMoveIndex?: number;
    onMoveClick?: (index: number) => void;
}

export const MoveHistory = ({ moves, currentMoveIndex = -1, onMoveClick }: MoveHistoryProps) => {
    const scrollRef = useRef<ScrollView>(null);

    // Auto-scroll to active move
    useEffect(() => {
        if (currentMoveIndex > 0 && scrollRef.current) {
            // Scroll to bottom to show latest move
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [currentMoveIndex, moves.length]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Move History</Text>
            <ScrollView
                ref={scrollRef}
                style={styles.list}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
            >
                {moves.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No moves yet</Text>
                    </View>
                ) : (
                    moves.map((move) => {
                        const whiteIndex = (move.moveNumber - 1) * 2 + 1;
                        const blackIndex = (move.moveNumber - 1) * 2 + 2;

                        return (
                            <View key={move.moveNumber} style={styles.moveItem}>
                                <Text style={styles.moveNumber}>{move.moveNumber}.</Text>
                                
                                <TouchableOpacity
                                    style={[
                                        styles.moveButton,
                                        currentMoveIndex === whiteIndex && styles.activeMove
                                    ]}
                                    onPress={() => onMoveClick && move.white && onMoveClick(whiteIndex)}
                                    disabled={!onMoveClick || !move.white}
                                >
                                    <Text style={[
                                        styles.moveText,
                                        currentMoveIndex === whiteIndex && styles.activeMoveText
                                    ]}>
                                        {move.white || '...'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.moveButton,
                                        currentMoveIndex === blackIndex && styles.activeMove
                                    ]}
                                    onPress={() => onMoveClick && move.black && onMoveClick(blackIndex)}
                                    disabled={!onMoveClick || !move.black}
                                >
                                    <Text style={[
                                        styles.moveText,
                                        currentMoveIndex === blackIndex && styles.activeMoveText
                                    ]}>
                                        {move.black || '...'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        height: 300,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    list: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    moveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 8,
    },
    moveNumber: {
        width: 30,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    moveButton: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    activeMove: {
        backgroundColor: Colors.light.primary,
    },
    moveText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
        textAlign: 'center',
    },
    activeMoveText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default MoveHistory;
