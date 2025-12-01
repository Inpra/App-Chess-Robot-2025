import { getTutorialStyles } from '@/styles/tutorial.styles';
import React, { useMemo } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';

interface TutorialBoardProps {
    board: any[];
    validMoves: number[];
}

export function TutorialBoard({ board, validMoves }: TutorialBoardProps) {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getTutorialStyles(dimensions), [dimensions]);

    // Convert validMoves indices to highlighted squares
    const highlightedSquares = validMoves.map(index => ({
        row: Math.floor(index / 8),
        col: index % 8,
        color: 'rgba(100, 200, 100, 0.4)' // Green highlight for valid moves
    }));

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

    return (
        <View style={styles.boardContainer}>
            <View style={styles.boardWrapper}>
                <Image
                    source={require('@/assets/images/chessboard.png')}
                    style={styles.board}
                    resizeMode="stretch"
                />
                <View style={styles.gridOverlay}>
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                        Array.from({ length: 8 }).map((_, colIndex) => {
                            const index = rowIndex * 8 + colIndex;
                            const piece = board[index];
                            const isHighlighted = highlightedSquares.find(
                                sq => sq.row === rowIndex && sq.col === colIndex
                            );

                            return (
                                <View
                                    key={`${rowIndex}-${colIndex}`}
                                    style={[
                                        styles.square,
                                        isHighlighted && { backgroundColor: isHighlighted.color }
                                    ]}
                                >
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
    );
}
