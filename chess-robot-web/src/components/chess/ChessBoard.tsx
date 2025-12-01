import { getPieceImageSource } from '../../constants/lessonData';
import chessboardImg from '../../assets/chessboard.png';
import './ChessBoard.css';

// Chess piece type
export interface ChessPiece {
    type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
    color: 'w' | 'b';
}

// Board state type (64 squares)
export type BoardState = (ChessPiece | null)[];

// Initial FEN string (standard starting position)
export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

// Parse FEN string to board state array
export const fenToBoard = (fen: string): BoardState => {
    const board: BoardState = new Array(64).fill(null);
    const rows = fen.split('/');
    
    let index = 0;
    for (const row of rows) {
        for (const char of row) {
            if (/\d/.test(char)) {
                // Number = empty squares
                index += parseInt(char, 10);
            } else {
                // Letter = piece
                const color: 'w' | 'b' = char === char.toUpperCase() ? 'w' : 'b';
                const type = char.toLowerCase() as ChessPiece['type'];
                board[index] = { type, color };
                index++;
            }
        }
    }
    
    return board;
};

// Convert board state array to FEN string
export const boardToFen = (board: BoardState): string => {
    let fen = '';
    
    for (let row = 0; row < 8; row++) {
        let emptyCount = 0;
        
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const piece = board[index];
            
            if (piece === null) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                const pieceChar = piece.color === 'w' 
                    ? piece.type.toUpperCase() 
                    : piece.type.toLowerCase();
                fen += pieceChar;
            }
        }
        
        if (emptyCount > 0) {
            fen += emptyCount;
        }
        
        if (row < 7) {
            fen += '/';
        }
    }
    
    return fen;
};

// Legacy support: create initial board from FEN
export const initialBoard: BoardState = fenToBoard(INITIAL_FEN);

export interface ChessBoardProps {
    /** FEN string representing board position (preferred) */
    fen?: string;
    /** Current board state - deprecated, use fen instead */
    board?: BoardState;
    /** Currently selected square (row, col) */
    selectedSquare?: { row: number; col: number } | null;
    /** Array of valid move indices (0-63) */
    validMoves?: number[];
    /** Last move highlight (from, to indices) */
    lastMove?: { from: number; to: number } | null;
    /** Whether the board is interactive (clickable) */
    interactive?: boolean;
    /** Callback when a square is clicked */
    onSquareClick?: (row: number, col: number, index: number) => void;
    /** Board size class: 'small' | 'medium' | 'large' | 'full' */
    size?: 'small' | 'medium' | 'large' | 'full';
    /** Whether to flip the board (view from black's perspective) */
    flipped?: boolean;
    /** Custom class name for styling */
    className?: string;
}

export const ChessBoard = ({
    fen,
    board: boardProp,
    selectedSquare = null,
    validMoves = [],
    lastMove = null,
    interactive = true,
    onSquareClick,
    size = 'full',
    flipped = false,
    className = ''
}: ChessBoardProps) => {

    // Use FEN if provided, otherwise fall back to board prop
    const board = fen ? fenToBoard(fen) : (boardProp || initialBoard);

    const handleSquareClick = (row: number, col: number) => {
        if (!interactive || !onSquareClick) return;
        
        // If flipped, adjust row and col
        const actualRow = flipped ? 7 - row : row;
        const actualCol = flipped ? 7 - col : col;
        const index = actualRow * 8 + actualCol;
        
        onSquareClick(actualRow, actualCol, index);
    };

    const getSquareClasses = (_index: number, isSelected: boolean, isValidMove: boolean, isLastMoveFrom: boolean, isLastMoveTo: boolean) => {
        const classes = ['chess-square'];
        
        if (isSelected) classes.push('selected');
        if (isValidMove) classes.push('valid-move');
        if (isLastMoveFrom) classes.push('last-move-from');
        if (isLastMoveTo) classes.push('last-move-to');
        if (interactive) classes.push('interactive');
        
        return classes.join(' ');
    };

    const renderBoard = () => {
        const rows = [];
        
        for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
            for (let colIndex = 0; colIndex < 8; colIndex++) {
                // If flipped, reverse the display order
                const displayRow = flipped ? 7 - rowIndex : rowIndex;
                const displayCol = flipped ? 7 - colIndex : colIndex;
                const index = displayRow * 8 + displayCol;
                
                const piece = board[index];
                const isSelected = selectedSquare?.row === displayRow && selectedSquare?.col === displayCol;
                const isValidMove = validMoves.includes(index);
                const isLastMoveFrom = lastMove?.from === index;
                const isLastMoveTo = lastMove?.to === index;

                rows.push(
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getSquareClasses(index, isSelected, isValidMove, isLastMoveFrom, isLastMoveTo)}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                    >
                        {/* Valid move indicator */}
                        {isValidMove && !piece && (
                            <div className="valid-move-dot" />
                        )}
                        
                        {/* Valid capture indicator */}
                        {isValidMove && piece && (
                            <div className="valid-capture-ring" />
                        )}

                        {/* Chess piece */}
                        {piece && (
                            <img
                                src={getPieceImageSource(piece.type, piece.color)}
                                alt={`${piece.color}${piece.type}`}
                                className="chess-piece"
                                draggable={false}
                            />
                        )}
                    </div>
                );
            }
        }
        
        return rows;
    };

    return (
        <div className={`chess-board-wrapper chess-board-${size} ${className}`}>
            <div className="chess-board-container">
                {/* Chessboard background */}
                <img
                    src={chessboardImg}
                    alt="Chessboard"
                    className="chess-board-background"
                    draggable={false}
                />

                {/* Grid overlay with pieces */}
                <div className="chess-board-grid">
                    {renderBoard()}
                </div>
            </div>
        </div>
    );
};

export default ChessBoard;
