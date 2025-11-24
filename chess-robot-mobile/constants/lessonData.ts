// Helper to create an empty board
export const createEmptyBoard = () => Array(64).fill(null);

// Helper to create a standard chess starting position
export const createStandardBoard = () => {
    const board = createEmptyBoard();

    // Black pieces (top of board, ranks 8 and 7)
    board[0] = { type: 'r', color: 'b' };  // a8
    board[1] = { type: 'n', color: 'b' };  // b8
    board[2] = { type: 'b', color: 'b' };  // c8
    board[3] = { type: 'q', color: 'b' };  // d8
    board[4] = { type: 'k', color: 'b' };  // e8
    board[5] = { type: 'b', color: 'b' };  // f8
    board[6] = { type: 'n', color: 'b' };  // g8
    board[7] = { type: 'r', color: 'b' };  // h8

    // Black pawns (rank 7)
    for (let i = 8; i < 16; i++) {
        board[i] = { type: 'p', color: 'b' };
    }

    // White pawns (rank 2)
    for (let i = 48; i < 56; i++) {
        board[i] = { type: 'p', color: 'w' };
    }

    // White pieces (bottom of board, rank 1)
    board[56] = { type: 'r', color: 'w' };  // a1
    board[57] = { type: 'n', color: 'w' };  // b1
    board[58] = { type: 'b', color: 'w' };  // c1
    board[59] = { type: 'q', color: 'w' };  // d1
    board[60] = { type: 'k', color: 'w' };  // e1
    board[61] = { type: 'b', color: 'w' };  // f1
    board[62] = { type: 'n', color: 'w' };  // g1
    board[63] = { type: 'r', color: 'w' };  // h1

    return board;
};

// Hardcoded board setups for each lesson
export const lessonBoards: Record<string, any[]> = {
    'Pawn': (() => {
        const b = createEmptyBoard();
        b[52] = { type: 'p', color: 'w' }; // e2
        return b;
    })(),
    'Queen': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'q', color: 'w' }; // e1
        return b;
    })(),
    'Rook': (() => {
        const b = createEmptyBoard();
        b[56] = { type: 'r', color: 'w' }; // a1
        return b;
    })(),
    'Bishop': (() => {
        const b = createEmptyBoard();
        b[58] = { type: 'b', color: 'w' }; // c1
        return b;
    })(),
    'Knight': (() => {
        const b = createEmptyBoard();
        b[62] = { type: 'n', color: 'w' }; // g1
        return b;
    })(),
    'King': (() => {
        const b = createEmptyBoard();
        b[36] = { type: 'k', color: 'w' }; // e4 (Center to show all moves)
        return b;
    })(),
    'En Passant': (() => {
        const b = createEmptyBoard();
        b[27] = { type: 'p', color: 'w' }; // d5 - White pawn
        b[28] = { type: 'p', color: 'b' }; // e5 - Black pawn (just moved 2 squares)
        return b;
    })(),
    'Promotion': (() => {
        const b = createEmptyBoard();
        b[8] = { type: 'p', color: 'w' }; // a7 - White pawn ready to promote
        return b;
    })(),
    'Check': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[28] = { type: 'r', color: 'b' }; // e5 - Black Rook giving check
        return b;
    })(),
    'Checkmate': (() => {
        const b = createEmptyBoard();
        b[7] = { type: 'k', color: 'w' }; // h1 - White King
        b[15] = { type: 'r', color: 'b' }; // h2 - Black Rook
        b[6] = { type: 'r', color: 'b' }; // g1 - Black Rook (checkmate)
        return b;
    })(),
    'Castling': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook (kingside castling)
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook (queenside castling)
        return b;
    })(),
    'Stalemate': (() => {
        const b = createEmptyBoard();
        b[0] = { type: 'k', color: 'w' }; // a1 - White King (trapped)
        b[9] = { type: 'q', color: 'b' }; // b2 - Black Queen (stalemate position)
        b[16] = { type: 'k', color: 'b' }; // a3 - Black King
        return b;
    })(),
    'Insufficient Material': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King (only kings left)
        return b;
    })(),
    'Threefold Repetition': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[62] = { type: 'n', color: 'w' }; // g1 - White Knight
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King
        b[6] = { type: 'n', color: 'b' }; // g8 - Black Knight
        return b;
    })(),
    // Basic Tactics lessons
    'Piece Value': (() => {
        const b = createEmptyBoard();
        b[28] = { type: 'q', color: 'w' }; // e5 - White Queen
        b[36] = { type: 'p', color: 'b' }; // e4 - Black Pawn
        b[20] = { type: 'r', color: 'b' }; // e6 - Black Rook
        return b;
    })(),
    'Fork': (() => {
        const b = createEmptyBoard();
        b[36] = { type: 'n', color: 'w' }; // e4 - White Knight
        b[18] = { type: 'r', color: 'b' }; // c6 - Black Rook
        b[22] = { type: 'q', color: 'b' }; // g6 - Black Queen
        return b;
    })(),
    'Pin': (() => {
        const b = createEmptyBoard();
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King
        b[12] = { type: 'q', color: 'b' }; // e7 - Black Queen
        b[60] = { type: 'r', color: 'w' }; // e1 - White Rook (pinning Queen to King)
        return b;
    })(),
    'Skewer': (() => {
        const b = createEmptyBoard();
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King
        b[20] = { type: 'r', color: 'b' }; // e6 - Black Rook
        b[60] = { type: 'r', color: 'w' }; // e1 - White Rook (skewering King)
        return b;
    })(),
    'Discovered Attack': (() => {
        const b = createEmptyBoard();
        b[28] = { type: 'b', color: 'w' }; // e5 - White Bishop
        b[36] = { type: 'n', color: 'w' }; // e4 - White Knight (blocking Bishop)
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King
        b[20] = { type: 'r', color: 'b' }; // e6 - Black Rook
        return b;
    })(),
    // Strategy Principles lessons
    'Center Control': (() => {
        const b = createEmptyBoard();
        b[52] = { type: 'p', color: 'w' }; // e2 - White Pawn
        b[51] = { type: 'p', color: 'w' }; // d2 - White Pawn
        b[27] = { type: 'p', color: 'w' }; // d5 - Target center
        b[28] = { type: 'p', color: 'w' }; // e5 - Target center
        return b;
    })(),
    'Piece Development': (() => {
        const b = createEmptyBoard();
        b[57] = { type: 'n', color: 'w' }; // b1 - White Knight
        b[58] = { type: 'b', color: 'w' }; // c1 - White Bishop
        b[45] = { type: 'n', color: 'w' }; // f3 - Developed Knight
        b[42] = { type: 'b', color: 'w' }; // c4 - Developed Bishop
        return b;
    })(),
    'King Safety': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook
        b[62] = { type: 'k', color: 'w' }; // g1 - King after castling
        b[61] = { type: 'r', color: 'w' }; // f1 - Rook after castling
        return b;
    })(),
    // Basic Endgames lessons
    'King Queen vs King': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[52] = { type: 'q', color: 'w' }; // e2 - White Queen
        b[7] = { type: 'k', color: 'b' }; // h8 - Black King (trapped)
        return b;
    })(),
    'King Rook vs King': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook
        b[7] = { type: 'k', color: 'b' }; // h8 - Black King (trapped)
        return b;
    })(),
};

// Start positions for resetting the animation
export const lessonStartPositions: Record<string, number> = {
    'Pawn': 52,
    'Queen': 60,
    'Rook': 56,
    'Bishop': 58,
    'Knight': 62,
    'King': 36,
    'En Passant': 27,
    'Promotion': 8,
    'Check': 28,
    'Checkmate': 6,
    'Castling': 60,
    'Stalemate': 9,
    'Insufficient Material': 60,
    'Threefold Repetition': 62,
    // Basic Tactics
    'Piece Value': 28,
    'Fork': 36,
    'Pin': 60,
    'Skewer': 60,
    'Discovered Attack': 36,
    // Strategy Principles
    'Center Control': 52,
    'Piece Development': 57,
    'King Safety': 60,
    // Basic Endgames
    'King Queen vs King': 52,
    'King Rook vs King': 56,
};

// Hardcoded valid moves (indices) for the tutorial demonstration
export const lessonValidMoves: Record<string, number[]> = {
    'Pawn': [44, 36], // e3, e4 (from e2)
    'Queen': [59, 58, 57, 56, 61, 62, 63, 52, 44, 36, 28, 20, 12, 4, 53, 46, 39, 51, 42, 33, 24], // Various moves from e1
    'Rook': [48, 40, 32, 24, 16, 8, 0, 57, 58, 59, 60, 61, 62, 63], // File a and Rank 1 from a1
    'Bishop': [49, 40, 51, 44, 37, 30, 23], // Diagonals from c1
    'Knight': [45, 47, 52], // f3, h3, e2 from g1
    'King': [27, 28, 29, 35, 37, 43, 44, 45], // Surrounding e4
    'En Passant': [20], // e6 - En passant capture square
    'Promotion': [0, 1, 2, 3, 4, 5, 6, 7], // All squares on rank 8 (promotion options)
    'Check': [60, 52, 44, 36, 20, 12, 4], // Rook attacking King on e-file
    'Checkmate': [14, 22, 30, 38, 46, 54, 62], // Rook moves showing checkmate pattern
    'Castling': [62, 58], // g1 (kingside), c1 (queenside) - King's castling destinations
    'Stalemate': [1, 2, 10, 18], // Queen moves maintaining stalemate
    'Insufficient Material': [52, 44, 36, 28], // King moves (no checkmate possible)
    'Threefold Repetition': [45, 52], // Knight moves (f3, e2) showing repetition pattern
    // Basic Tactics
    'Piece Value': [36, 20], // Queen can take Pawn or Rook
    'Fork': [18, 22], // Knight forks Rook and Queen
    'Pin': [12, 20, 28, 36], // Rook moves along e-file showing pin
    'Skewer': [12, 20, 28], // Rook attacking King, forcing it to move
    'Discovered Attack': [45, 52, 44], // Knight moves revealing Bishop attack
    // Strategy Principles
    'Center Control': [44, 36, 27, 28], // Pawns controlling center squares
    'Piece Development': [42, 45, 47, 40], // Developed piece positions
    'King Safety': [62, 61], // King and Rook after castling
    // Basic Endgames
    'King Queen vs King': [15, 23, 31, 39, 47, 55, 63], // Queen cutting off King
    'King Rook vs King': [0, 8, 16, 24, 32, 40, 48], // Rook cutting off King on a-file
};

// Lesson packages
export const lessonPackages = [
    {
        id: 'basic',
        name: 'Cơ Bản',
        description: 'Học các quân cờ cơ bản',
        icon: 'school',
        lessons: [
            { id: 1, icon: 'paw', label: 'Pawn' },
            { id: 2, icon: 'flash', label: 'Queen' },
            { id: 3, icon: 'shield', label: 'Rook' },
            { id: 4, icon: 'ribbon', label: 'Bishop' },
            { id: 5, icon: 'star', label: 'Knight' },
            { id: 6, icon: 'trophy', label: 'King' },
        ]
    },
    {
        id: 'intermediate',
        name: 'Trung Bình',
        description: 'Học nước đi đặc biệt',
        icon: 'fitness',
        lessons: [
            { id: 7, icon: 'swap-horizontal', label: 'En Passant' },
            { id: 8, icon: 'arrow-up-circle', label: 'Promotion' },
        ]
    },
    {
        id: 'advanced',
        name: 'Luật Chơi & Trạng Thái',
        description: 'Luật chơi và trạng thái đặc biệt',
        icon: 'book',
        lessons: [
            { id: 9, icon: 'alert-circle', label: 'Check' },
            { id: 10, icon: 'close-circle', label: 'Checkmate' },
            { id: 11, icon: 'git-merge', label: 'Castling' },
            { id: 12, icon: 'hand-left', label: 'Stalemate' },
            { id: 13, icon: 'remove-circle', label: 'Insufficient Material' },
            { id: 14, icon: 'repeat', label: 'Threefold Repetition' },
        ]
    },
    {
        id: 'tactics',
        name: 'Chiến Thuật Cơ Bản',
        description: 'Học các mánh khóe để giành lợi thế',
        icon: 'bulb',
        lessons: [
            { id: 15, icon: 'stats-chart', label: 'Piece Value' },
            { id: 16, icon: 'git-network', label: 'Fork' },
            { id: 17, icon: 'pin', label: 'Pin' },
            { id: 18, icon: 'arrow-redo', label: 'Skewer' },
            { id: 19, icon: 'eye', label: 'Discovered Attack' },
        ]
    },
    {
        id: 'strategy',
        name: 'Nguyên Tắc Chiến Lược',
        description: 'Học các nguyên tắc chiến lược cơ bản',
        icon: 'compass',
        lessons: [
            { id: 20, icon: 'grid', label: 'Center Control' },
            { id: 21, icon: 'rocket', label: 'Piece Development' },
            { id: 22, icon: 'shield-checkmark', label: 'King Safety' },
        ]
    },
    {
        id: 'endgame',
        name: 'Kết Thúc Cơ Bản',
        description: 'Học cách chiếu hết trong tàn cuộc',
        icon: 'flag',
        lessons: [
            { id: 23, icon: 'checkmark-done-circle', label: 'King Queen vs King' },
            { id: 24, icon: 'checkmark-circle', label: 'King Rook vs King' },
        ]
    },
];

// Helper to get piece image source
export const getPieceImageSource = (type: string, color: string) => {
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
