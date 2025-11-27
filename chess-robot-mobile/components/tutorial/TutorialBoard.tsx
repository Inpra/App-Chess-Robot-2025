import { getPieceImageSource } from '@/constants/lessonData';
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
                            const isValidMove = validMoves.includes(index);

                            return (
                                <View key={`${rowIndex}-${colIndex}`} style={styles.square}>
                                    {isValidMove && (
                                        <View style={styles.possibleMoveDot} />
                                    )}

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
