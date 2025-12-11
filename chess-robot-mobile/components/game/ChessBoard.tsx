import React from 'react';
import { Image, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface ChessPiece {
    type: string;
    color: string;
}

export interface ChessBoardProps {
    board?: (ChessPiece | null)[];
    fen?: string;
    onSquareClick?: (row: number, col: number) => void;
    selectedSquare?: { row: number; col: number } | null;
    possibleMoves?: { row: number; col: number }[];
    checkSquare?: { row: number; col: number } | null;
    hintSquares?: { from: number; to: number } | null;
    highlightedSquares?: { row: number; col: number; color?: string }[];
    styles: any;
    interactive?: boolean;
    showPossibleMoves?: boolean;
    customSquareStyle?: (row: number, col: number) => ViewStyle | null;
}

export default function ChessBoard({
    board,
    fen,
    onSquareClick,
    selectedSquare = null,
    possibleMoves = [],
    checkSquare = null,
    hintSquares = null,
    highlightedSquares = [],
    styles,
    interactive = true,
    showPossibleMoves = true,
    customSquareStyle,
}: ChessBoardProps) {
    // Helper to parse FEN string
    const getBoardFromFen = (fenStr: string): (ChessPiece | null)[] => {
        const board: (ChessPiece | null)[] = [];
        const [position] = fenStr.split(' ');
        const rows = position.split('/');

        for (const row of rows) {
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (/\d/.test(char)) {
                    const emptyCount = parseInt(char, 10);
                    for (let j = 0; j < emptyCount; j++) {
                        board.push(null);
                    }
                } else {
                    const color = char === char.toUpperCase() ? 'w' : 'b';
                    const type = char.toLowerCase();
                    board.push({ type, color });
                }
            }
        }
        return board;
    };

    const displayBoard = React.useMemo(() => {
        if (board) return board;
        if (fen) return getBoardFromFen(fen);
        return Array(64).fill(null);
    }, [board, fen]);

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

    const isSquareSelected = (row: number, col: number) => {
        return selectedSquare?.row === row && selectedSquare?.col === col;
    };

    const isPossibleMove = (row: number, col: number) => {
        return possibleMoves.some(move => move.row === row && move.col === col);
    };

    const isSquareInCheck = (row: number, col: number) => {
        return checkSquare?.row === row && checkSquare?.col === col;
    };

    const isHintSquare = (row: number, col: number) => {
        if (!hintSquares) return false;
        const index = row * 8 + col;
        return index === hintSquares.from || index === hintSquares.to;
    };

    const getHighlightedSquare = (row: number, col: number) => {
        return highlightedSquares.find(sq => sq.row === row && sq.col === col);
    };

    const handleSquarePress = (row: number, col: number) => {
        if (interactive && onSquareClick) {
            onSquareClick(row, col);
        }
    };

    return (
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
                            const piece = displayBoard[index];
                            const isSelected = isSquareSelected(rowIndex, colIndex);
                            const isPossible = showPossibleMoves && isPossibleMove(rowIndex, colIndex);
                            const isCheck = isSquareInCheck(rowIndex, colIndex);
                            const isHint = isHintSquare(rowIndex, colIndex);
                            const highlighted = getHighlightedSquare(rowIndex, colIndex);
                            const customStyle = customSquareStyle?.(rowIndex, colIndex);

                            const squareStyles = [
                                styles.square,
                                isSelected && styles.selectedSquare,
                                isCheck && styles.checkSquare,
                                isHint && { backgroundColor: 'rgba(255, 255, 0, 0.5)' },
                                highlighted && { backgroundColor: highlighted.color || 'rgba(255, 255, 0, 0.3)' },
                                customStyle,
                            ];

                            return (
                                <TouchableOpacity
                                    key={`${rowIndex}-${colIndex}`}
                                    style={squareStyles}
                                    onPress={() => handleSquarePress(rowIndex, colIndex)}
                                    activeOpacity={interactive ? 0.7 : 1}
                                    disabled={!interactive}
                                >
                                    {/* Possible Move Dot */}
                                    {isPossible && !piece && (
                                        <View style={styles.possibleMoveDot} />
                                    )}

                                    {/* Possible Capture Ring */}
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
    );
}
