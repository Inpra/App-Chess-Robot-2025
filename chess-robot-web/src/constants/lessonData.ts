import bp from '../assets/bp.png';
import br from '../assets/br.png';
import bn from '../assets/bn.png';
import bb from '../assets/bb.png';
import bq from '../assets/bq.png';
import bk from '../assets/bk.png';
import wp from '../assets/wp.png';
import wr from '../assets/wr.png';
import wn from '../assets/wn.png';
import wb from '../assets/wb.png';
import wq from '../assets/wq.png';
import wk from '../assets/wk.png';

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
        b[104] = { type: 'r', color: 'w' }; // a1 - White Rook (Wait, index 104 is out of bounds, should be 56)
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
        // Full starting position for both sides
        // White pieces
        b[56] = { type: 'r', color: 'w' }; // a1
        b[57] = { type: 'n', color: 'w' }; // b1
        b[58] = { type: 'b', color: 'w' }; // c1
        b[59] = { type: 'q', color: 'w' }; // d1
        b[60] = { type: 'k', color: 'w' }; // e1
        b[61] = { type: 'b', color: 'w' }; // f1
        b[62] = { type: 'n', color: 'w' }; // g1
        b[63] = { type: 'r', color: 'w' }; // h1
        // White pawns
        for (let i = 48; i < 56; i++) {
            b[i] = { type: 'p', color: 'w' };
        }
        // Black pieces
        b[0] = { type: 'r', color: 'b' };  // a8
        b[1] = { type: 'n', color: 'b' };  // b8
        b[2] = { type: 'b', color: 'b' };  // c8
        b[3] = { type: 'q', color: 'b' };  // d8
        b[4] = { type: 'k', color: 'b' };  // e8
        b[5] = { type: 'b', color: 'b' };  // f8
        b[6] = { type: 'n', color: 'b' };  // g8
        b[7] = { type: 'r', color: 'b' };  // h8
        // Black pawns
        for (let i = 8; i < 16; i++) {
            b[i] = { type: 'p', color: 'b' };
        }
        return b;
    })(),
    'Piece Development': (() => {
        const b = createEmptyBoard();
        // Full starting position for White
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook
        b[57] = { type: 'n', color: 'w' }; // b1 - White Knight
        b[58] = { type: 'b', color: 'w' }; // c1 - White Bishop
        b[59] = { type: 'q', color: 'w' }; // d1 - White Queen
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[61] = { type: 'b', color: 'w' }; // f1 - White Bishop
        b[62] = { type: 'n', color: 'w' }; // g1 - White Knight
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook
        // White pawns
        for (let i = 48; i < 56; i++) {
            b[i] = { type: 'p', color: 'w' };
        }
        // Black pieces (simplified - just back rank)
        b[0] = { type: 'r', color: 'b' };  // a8
        b[1] = { type: 'n', color: 'b' };  // b8
        b[2] = { type: 'b', color: 'b' };  // c8
        b[3] = { type: 'q', color: 'b' };  // d8
        b[4] = { type: 'k', color: 'b' };  // e8
        b[5] = { type: 'b', color: 'b' };  // f8
        b[6] = { type: 'n', color: 'b' };  // g8
        b[7] = { type: 'r', color: 'b' };  // h8
        // Black pawns
        for (let i = 8; i < 16; i++) {
            b[i] = { type: 'p', color: 'b' };
        }
        return b;
    })(),
    'King Safety': (() => {
        const b = createEmptyBoard();
        // White King in danger in the center
        b[60] = { type: 'k', color: 'w' }; // e1 - White King (in center - dangerous!)
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook (ready to castle)
        b[48] = { type: 'p', color: 'w' }; // a2 - White Pawn
        b[49] = { type: 'p', color: 'w' }; // b2 - White Pawn
        b[50] = { type: 'p', color: 'w' }; // c2 - White Pawn
        b[53] = { type: 'p', color: 'w' }; // f2 - White Pawn
        b[54] = { type: 'p', color: 'w' }; // g2 - White Pawn
        b[55] = { type: 'p', color: 'w' }; // h2 - White Pawn
        // Black pieces threatening the center
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        b[20] = { type: 'q', color: 'b' }; // e6 - Black Queen (threatening e1!)
        b[3] = { type: 'r', color: 'b' };  // d8 - Black Rook (controlling d-file, preventing King from going right)
        return b;
    })(),
    // Basic Endgames lessons
    'King Queen vs King': (() => {
        const b = createEmptyBoard();
        b[6] = { type: 'k', color: 'b' };  // g8 - Black King (starting position)
        b[36] = { type: 'k', color: 'w' }; // e5 - White King (supporting)
        b[27] = { type: 'q', color: 'w' }; // d4 - White Queen (ready to lock)
        return b;
    })(),
    'King Rook vs King': (() => {
        const b = createEmptyBoard();
        b[36] = { type: 'k', color: 'w' }; // e4 - White King (helping)
        b[8] = { type: 'r', color: 'w' };  // a7 - White Rook (cutting off rank 7)
        b[7] = { type: 'k', color: 'b' };  // h8 - Black King (trapped)
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
    'Center Control': 51,
    'Piece Development': 57,
    'King Safety': 60,
    'King Queen vs King': 27,
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
    'Center Control': [], // Handled by lessonComplexMoves
    'Piece Development': [], // Handled by lessonComplexMoves
    'King Safety': [], // Handled by lessonComplexMoves
    'King Queen vs King': [], // Handled by lessonComplexMoves
    'King Rook vs King': [], // Handled by lessonComplexMoves
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
            { id: 21, icon: 'grid', label: 'Center Control', description: 'Control the center! The 4 center squares (d4, d5, e4, e5) are the most important.\n\nWhy? Pieces in the center can attack more squares and control the game.\n\nStrategy: Move your pawns to d4 and e4 early to dominate the center!' },
            { id: 22, icon: 'rocket', label: 'Piece Development', description: 'Develop your pieces in the first 5 moves!\n\n1. e4 - Open lines for Bishop and Queen\n2. Nf3 - Knight controls the center\n3. Bc4 - Bishop attacks weak point f7\n4. Nc3 - Second Knight develops\n5. d3 - Open line for Bishop c1\n\nGoal: Get ALL Knights and Bishops off rank 1 as soon as possible!' },
            { id: 23, icon: 'shield-checkmark', label: 'King Safety', description: 'Protect the King by Castling!\n\nSituation: White King on e1 (center) is threatened by Black Queen on e6. Very dangerous!\n\nSolution: Short Castling (0-0)\n- King e1 → g1 (escape to safe corner)\n- Rook h1 → f1 (protect King)\n\nResult: King is protected by Pawns (f2, g2, h2) and Rook. Safe!' },
            { id: 24, icon: 'checkmark-done-circle', label: 'King Queen vs King', description: '"Kiss of Death" Technique\n\nPosition: Black King g8, White King e5, White Queen d4\n\n1. Qe7 - "Lock the box", force King to rank 8 only\n2. Kh8 - King forced to corner\n3. Kf6 - White King advances to support\n4. Kg8 - King has only 1 move\n5. Qg7# - Final "kiss"! Checkmate!\n\nQueen delivers mate next to enemy King, protected by your King!' },
            { id: 25, icon: 'checkmark-circle', label: 'King Rook vs King', description: 'Checkmate with Rook - "Box" Technique!\n\n1. Rook cuts horizontal rank (rank 7)\n2. White King advances\n3. Rook pushes Black King to rank 8\n4. White King gets closer\n5. Rook delivers checkmate on rank 8!\n\nPrinciple: Rook cuts rank, King supports, push to edge then checkmate!' },
        ]
    },
];

// Helper to get piece image source
export const getPieceImageSource = (type: string, color: string) => {
    const pieceKey = `${color}${type}`;
    const pieceMap: Record<string, string> = {
        'wp': wp, 'wr': wr, 'wn': wn, 'wb': wb, 'wq': wq, 'wk': wk,
        'bp': bp, 'br': br, 'bn': bn, 'bb': bb, 'bq': bq, 'bk': bk,
    };
    return pieceMap[pieceKey];
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
    ],
    'Center Control': [
        { from: 52, to: 44 }, // 1. e2 -> e4 (White pawn advances to center)
        { from: 11, to: 27 }, // 2. d7 -> d5 (Black challenges center!)
        { from: 44, to: 36 }, // 3. e4 -> e5 (White pawn advances)
        { from: 51, to: 43 }, // 4. d2 -> d4 (White controls d4)
        { from: 27, to: 36 }, // 5. d5 -> e4 (Black pawn advances)
        { from: 43, to: 36 }, // 6. d4 x e4 (White captures diagonally - legal!)
    ],
    'Piece Development': [
        { from: 52, to: 44 }, // 1. e2 -> e4 (Open lines for Bishop and Queen)
        { from: 62, to: 45 }, // 2. Ng1 -> f3 (Knight develops, controls center)
        { from: 61, to: 34 }, // 3. Bf1 -> c4 (Bishop develops, attacks f7)
        { from: 57, to: 42 }, // 4. Nb1 -> c3 (Second Knight develops)
        { from: 51, to: 43 }, // 5. d2 -> d3 (Open line for Bishop c1)
        { from: 58, to: 37 }, // 6. Bc1 -> f4 (Second Bishop develops)
    ],
    'King Safety': [
        { from: 60, to: 62 }, // 1. Ke1 -> g1 (King castles to safety)
        { from: 63, to: 61 }, // 2. Rh1 -> f1 (Rook jumps over to protect King)
    ],
    'King Queen vs King': [
        { from: 27, to: 12 }, // 1. Qd4 -> e7 ("Lock the box" - Queen cuts off rank 7)
        { from: 6, to: 7 },   // 2. Kg8 -> h8 (King forced to corner)
        { from: 36, to: 29 }, // 3. Ke5 -> f5 (White King advances 1 square)
        { from: 7, to: 6 },   // 4. Kh8 -> g8 (Only legal move)
        { from: 29, to: 21 }, // 5. Kf5 -> f6 (White King advances 1 more square)
        { from: 6, to: 7 },   // 6. Kg8 -> h8 (King goes back)
        { from: 12, to: 14 }, // 7. Qe7 -> g7# ("Kiss of Death" - Checkmate!)
    ],
    'King Rook vs King': [
        { from: 36, to: 29 }, // 1. Ke4 -> f5 (King advances)
        { from: 7, to: 6 },   // 2. Kh8 -> g8 (King tries to escape)
        { from: 29, to: 22 }, // 3. Kf5 -> g6 (King gets closer)
        { from: 6, to: 7 },   // 4. Kg8 -> h8 (King forced back)
        { from: 8, to: 0 },   // 5. Ra7 -> a8# (Checkmate!)
    ]
};
