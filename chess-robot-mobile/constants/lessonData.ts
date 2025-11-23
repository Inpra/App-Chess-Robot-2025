// Helper to create an empty board
export const createEmptyBoard = () => Array(64).fill(null);

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
