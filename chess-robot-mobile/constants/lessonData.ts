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
        b[28] = { type: 'p', color: 'b' }; // e5 - Black pawn (just moved 2 squares from e7)
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        return b;
    })(),
    'Promotion': (() => {
        const b = createEmptyBoard();
        b[8] = { type: 'p', color: 'w' };  // a7 - White pawn ready to promote
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        return b;
    })(),
    'Checkmate': (() => {
        const b = createEmptyBoard();
        b[7] = { type: 'k', color: 'w' };  // h8 - White King (trapped)
        b[9] = { type: 'r', color: 'b' };  // b7 - Black Rook (cutting off rank 7)
        b[56] = { type: 'r', color: 'b' }; // a1 - Black Rook (ready to deliver mate at a8)
        return b;
    })(),
    'Short Castling': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        return b;
    })(),
    'Long Castling': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        return b;
    })(),
    'Insufficient Material': (() => {
        const b = createEmptyBoard();
        b[20] = { type: 'k', color: 'b' }; // e6 - Black King
        b[36] = { type: 'k', color: 'w' }; // e4 - White King
        return b;
    })(),
    'Threefold Repetition': (() => {
        const b = createEmptyBoard();
        b[63] = { type: 'k', color: 'w' }; // h1 - White King
        b[53] = { type: 'q', color: 'b' }; // f2 - Black Queen
        b[6] = { type: 'k', color: 'b' };  // g8 - Black King
        return b;
    })(),
    // Basic Tactics lessons
    'Fork': (() => {
        const b = createEmptyBoard();
        b[27] = { type: 'n', color: 'w' }; // d5 - White Knight
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        b[0] = { type: 'r', color: 'b' };  // a8 - Black Rook
        return b;
    })(),
    'Pin': (() => {
        const b = createEmptyBoard();
        b[3] = { type: 'q', color: 'b' };  // d8 - Black Queen
        b[17] = { type: 'b', color: 'b' }; // b6 - Black Bishop (pinned)
        b[24] = { type: 'b', color: 'w' }; // a5 - White Bishop (pinning)
        return b;
    })(),
    'Skewer': (() => {
        const b = createEmptyBoard();
        b[28] = { type: 'k', color: 'b' }; // e5 - Black King
        b[4] = { type: 'q', color: 'b' };  // e8 - Black Queen
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook
        return b;
    })(),
    'Discovered Attack': (() => {
        const b = createEmptyBoard();
        b[4] = { type: 'k', color: 'b' }; // e8 - Black King
        b[32] = { type: 'q', color: 'b' }; // a4 - Black Queen
        b[60] = { type: 'r', color: 'w' }; // e1 - White Rook
        b[36] = { type: 'b', color: 'w' }; // e4 - White Bishop
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
    'Checkmate': 56,
    'Short Castling': 60,
    'Long Castling': 60,
    'Insufficient Material': 36, // e4 - White King
    'Threefold Repetition': 63,
    'Fork': 27, // d5 - White Knight
    'Pin': 24,
    'Skewer': 56,
    'Discovered Attack': 36,
    'Center Control': 52,
    'Piece Development': 57,
    'King Safety': 60,
    'King Queen vs King': 52,
    'King Rook vs King': 56,
};

// Hardcoded valid moves (indices) for the tutorial demonstration
export const lessonValidMoves: Record<string, number[]> = {
    'Pawn': [44, 36],
    'Queen': [59, 58, 57, 56, 61, 62, 63, 52, 44, 36, 28, 20, 12, 4, 53, 46, 39, 51, 42, 33, 24],
    'Rook': [48, 40, 32, 24, 16, 8, 0, 57, 58, 59, 60, 61, 62, 63],
    'Bishop': [49, 40, 51, 44, 37, 30, 23],
    'Knight': [45, 47, 52],
    'King': [27, 28, 29, 35, 37, 43, 44, 45],
    'En Passant': [20],
    'Promotion': [0],
    'Checkmate': [0],
    'Short Castling': [62],
    'Long Castling': [58],
    'Insufficient Material': [], // Handled by lessonComplexMoves
    'Threefold Repetition': [], // Handled by lessonComplexMoves
    'Fork': [], // Handled by lessonComplexMoves
    'Pin': [], // Handled by lessonComplexMoves
    'Skewer': [], // Handled by lessonComplexMoves
    'Discovered Attack': [], // Handled by lessonComplexMoves
    'Center Control': [44, 36, 27, 28],
    'Piece Development': [42, 45, 47, 40],
    'King Safety': [62, 61],
    'King Queen vs King': [15, 23, 31, 39, 47, 55, 63],
    'King Rook vs King': [0, 8, 16, 24, 32, 40, 48],
};

// Lesson packages
export const lessonPackages = [
    {
        id: 'basic',
        name: 'The Basics',
        description: 'Learn how the pieces move',
        icon: 'school',
        lessons: [
            { id: 1, icon: 'paw', label: 'Pawn', description: 'Pawns move forward 1 square (or 2 on the first move) but capture diagonally. Reach the end to promote!' },
            { id: 2, icon: 'flash', label: 'Queen', description: 'The Queen is the most powerful piece! She can move any number of squares in any direction.' },
            { id: 3, icon: 'shield', label: 'Rook', description: 'Rooks move in straight lines (horizontal or vertical). They are powerful when working together.' },
            { id: 4, icon: 'ribbon', label: 'Bishop', description: 'Bishops move diagonally and always stay on their starting color (light or dark squares).' },
            { id: 5, icon: 'star', label: 'Knight', description: 'Knights move in an "L" shape (2 squares one way, 1 square the other). They can jump over other pieces!' },
            { id: 6, icon: 'trophy', label: 'King', description: 'The King is the most important piece! He moves 1 square in any direction. Protect him at all costs!' },
        ]
    },
    {
        id: 'rules',
        name: 'Rules & Special Moves',
        description: 'Learn special moves and game states',
        icon: 'book',
        lessons: [
            { id: 7, icon: 'swap-horizontal', label: 'En Passant', description: 'A special pawn capture: If an enemy pawn moves 2 squares past your pawn, you can capture it as if it moved 1.' },
            { id: 8, icon: 'arrow-up-circle', label: 'Promotion', description: 'When a Pawn reaches the other side of the board, it transforms into a Queen, Rook, Bishop, or Knight.' },
            { id: 9, icon: 'close-circle', label: 'Checkmate', description: 'Checkmate! The King is in check and has no escape. The game is over, and you win!' },
            { id: 10, icon: 'git-merge', label: 'Short Castling', description: 'Kingside Castling (0-0): Move the King 2 squares towards the Rook, and the Rook jumps over the King.' },
            { id: 11, icon: 'git-network', label: 'Long Castling', description: 'Queenside Castling (0-0-0): Move the King 2 squares towards the distant Rook, and the Rook jumps over.' },
            { id: 12, icon: 'remove-circle', label: 'Insufficient Material', description: 'Draw: King vs King. Neither side has enough pieces to force a checkmate. It is impossible to win, so the game is a draw.' },
            { id: 13, icon: 'repeat', label: 'Threefold Repetition', description: 'Draw: If the exact same board position occurs 3 times, the game is declared a draw.' },
        ]
    },
    {
        id: 'tactics',
        name: 'Basic Tactics',
        description: 'Tricks to gain an advantage',
        icon: 'bulb',
        lessons: [
            { id: 17, icon: 'git-network', label: 'Fork', description: 'Fork: A Knight jumps to attack both the King and Rook simultaneously. The King must move, losing the Rook!' },
            { id: 18, icon: 'pin', label: 'Pin', description: 'A pinned piece can move, but the cost is high.\n\nScenario: Black Queen (d8) and Black Bishop (b6) are on the a5-d8 diagonal. White Bishop (a5) is pinning the Black Bishop.\n\nResult: If the Black Bishop moves, the White Bishop will capture the Black Queen. This is a Relative Pin.' },
            { id: 19, icon: 'arrow-redo', label: 'Skewer', description: 'Dream scenario: force the King to run to capture the Queen.\n\nWhite Rook checks the Black King. The King is forced to move, exposing the Black Queen behind it. White Rook captures the Queen!' },
            { id: 20, icon: 'eye', label: 'Discovered Attack', description: 'Discovered Check to win the Queen (Classic Scenario)\n\nScenario: Black King (e8), Black Queen (a4). White Rook (e1) is blocked by White Bishop (e4).\n\nAction: White Bishop moves to c6, attacking the Black Queen and opening the line for the Rook to check the King.\n\nResult: Black King must run, White Bishop captures the Black Queen!' },
        ]
    },
    {
        id: 'strategy',
        name: 'Strategy & Endgames',
        description: 'Strategic concepts and endgame techniques',
        icon: 'compass',
        lessons: [
            { id: 21, icon: 'grid', label: 'Center Control', description: 'Control the center (e4, d4, e5, d5). Owning the center gives your pieces more mobility.' },
            { id: 22, icon: 'rocket', label: 'Piece Development', description: 'Develop your pieces! Get your Knights and Bishops out early to control the board.' },
            { id: 23, icon: 'shield-checkmark', label: 'King Safety', description: 'Protect the King! Castle early to get your King out of the dangerous center files.' },
            { id: 24, icon: 'checkmark-done-circle', label: 'King Queen vs King', description: 'Checkmate with Queen: Use the Queen to cut off the enemy King, then bring your King to help finish.' },
            { id: 25, icon: 'checkmark-circle', label: 'King Rook vs King', description: 'Checkmate with Rook: Use the "Box" technique to push the enemy King to the edge of the board.' },
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

// Complex moves for lessons that require multiple pieces moving
export const lessonComplexMoves: Record<string, { from: number; to: number }[]> = {
    'Threefold Repetition': [
        { from: 53, to: 61 }, // 1. Qf1+ (Black Queen f2 -> f1)
        { from: 63, to: 55 }, // 1. Kh2 (White King h1 -> h2)
        { from: 61, to: 53 }, // 2. Qf2+ (Black Queen f1 -> f2)
        { from: 55, to: 63 }, // 2. Kh1 (White King h2 -> h1)
        { from: 53, to: 61 }, // 3. Qf1+ (Black Queen f2 -> f1)
        { from: 63, to: 55 }, // 3. Kh2 (White King h1 -> h2)
        { from: 61, to: 53 }, // 4. Qf2+ (Black Queen f1 -> f2)
        { from: 55, to: 63 }, // 4. Kh1 (White King h2 -> h1)
        { from: 53, to: 61 }, // 5. Qf1+ (Black Queen f2 -> f1)
        { from: 63, to: 55 }, // 5. Kh2 (White King h1 -> h2)
    ],
    'Insufficient Material': [
        { from: 36, to: 37 }, // 1. Ke4 -> f4
        { from: 20, to: 21 }, // 1. Ke6 -> f6
        { from: 37, to: 38 }, // 2. Kf4 -> g4
        { from: 21, to: 22 }, // 2. Kf6 -> g6
        { from: 38, to: 29 }, // 3. Kg4 -> f5
        { from: 22, to: 13 }, // 3. Kg6 -> f7
    ],
    'Fork': [
        { from: 27, to: 10 }, // 1. Nd5 -> c7 (Knight forks King e8 and Rook a8)
        { from: 4, to: 5 },   // 2. Ke8 -> f8 (King escapes check)
        { from: 10, to: 0 },  // 3. Nc7 -> a8 (Knight captures Rook)
    ],
    'Pin': [
        { from: 17, to: 26 }, // 1. Bb6 -> c5 (Black Bishop moves, exposing Queen)
        { from: 24, to: 3 },  // 2. Ba5 -> d8 (White Bishop captures Queen)
    ],
    'Skewer': [
        { from: 56, to: 60 }, // 1. Ra1 -> e1 (Check!)
        { from: 28, to: 29 }, // 2. Ke5 -> f5 (King escapes)
        { from: 60, to: 4 },  // 3. Re1 -> e8 (Rook captures Queen)
    ],
    'Discovered Attack': [
        { from: 36, to: 18 }, // 1. Be4 -> c6 (Bishop moves, Discovered Check on e8, attacks Queen a4)
        { from: 4, to: 5 },   // 2. Ke8 -> f8 (King escapes)
        { from: 18, to: 32 }, // 3. Bc6 -> a4 (Bishop captures Queen)
    ]
};
