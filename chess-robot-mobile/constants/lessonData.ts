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
        // Thêm một số quân khác để rõ ràng hơn
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
    'Check': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King
        b[28] = { type: 'r', color: 'b' }; // e5 - Black Rook giving check
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        // Thêm một số quân để có nhiều lựa chọn thoát chiếu
        b[52] = { type: 'p', color: 'w' }; // e2 - Pawn có thể chặn
        return b;
    })(),
    'Checkmate': (() => {
        const b = createEmptyBoard();
        b[7] = { type: 'k', color: 'w' };  // h8 - White King (trapped in corner)
        b[15] = { type: 'r', color: 'b' }; // h7 - Black Rook
        b[6] = { type: 'r', color: 'b' };  // g8 - Black Rook (checkmate)
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        return b;
    })(),
    'Castling': (() => {
        const b = createEmptyBoard();
        b[60] = { type: 'k', color: 'w' }; // e1 - White King (hasn't moved)
        b[63] = { type: 'r', color: 'w' }; // h1 - White Rook (kingside castling)
        b[56] = { type: 'r', color: 'w' }; // a1 - White Rook (queenside castling)
        b[4] = { type: 'k', color: 'b' };  // e8 - Black King
        // Đảm bảo đường đi thông thoáng (không có quân ở f1, g1 cho kingside)
        // và không có quân ở b1, c1, d1 cho queenside
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
    'En Passant': 27,      // d5 - White pawn position
    'Promotion': 8,         // a7 - White pawn ready to promote
    'Check': 60,            // e1 - White King being checked
    'Checkmate': 15,        // h7 - Black Rook giving checkmate
    'Castling': 60,         // e1 - White King before castling
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
    'En Passant': [20], // d6 - En passant capture square (White pawn from d5 captures Black pawn on e5)
    'Promotion': [0], // a8 - Promotion square (White pawn from a7 to a8)
    'Check': [52, 44, 36], // King can move to d1, f1, or Pawn can block at e2-e3-e4
    'Checkmate': [15, 23, 31], // Show Rook moves that maintain checkmate (h7 moves)
    'Castling': [62, 58], // g1 (kingside O-O), c1 (queenside O-O-O) - King's castling destinations
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
        id: 'rules',
        name: 'Luật Chơi & Nước Đi Đặc Biệt',
        description: 'Học luật chơi và các nước đi đặc biệt',
        icon: 'book',
        lessons: [
            { id: 7, icon: 'swap-horizontal', label: 'En Passant' },
            { id: 8, icon: 'arrow-up-circle', label: 'Promotion' },
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

// Lesson Content Structure
export interface LessonContent {
    hook: string;           // Giới thiệu vui vẻ
    demonstration: string;  // Mô tả cách minh họa
    handsOn: string;        // Bài tập thực hành
    twist: string;          // Thử thách phức tạp hơn
    wrapUp: string;         // Tổng kết và khen ngợi
}

// Detailed lesson contents following the lesson flow
export const lessonContents: Record<string, LessonContent> = {
    // Cấp độ 1: Nhập môn (The Foundations)
    'Pawn': {
        hook: "Tốt là lính bộ binh dũng cảm! Chúng tiến lên phía trước và không bao giờ lùi bước!",
        demonstration: "Tốt đi thẳng 1 ô, nhưng ở nước đầu tiên có thể đi 2 ô. Khi ăn quân, Tốt đi chéo 1 ô.",
        handsOn: "Hãy di chuyển Tốt trắng từ e2 lên e4 (đi 2 ô ở nước đầu tiên)!",
        twist: "Bây giờ có một Tốt đen ở d5. Hãy dùng Tốt trắng ở e4 ăn nó bằng cách đi chéo!",
        wrapUp: "Tuyệt vời! Bạn đã hiểu cách Tốt di chuyển. Tốt tuy nhỏ nhưng rất quan trọng!"
    },
    'Rook': {
        hook: "Xe di chuyển như tia laser, thẳng băng cho đến khi gặp chướng ngại vật!",
        demonstration: "Xe có thể đi ngang hoặc dọc không giới hạn số ô, miễn đường đi không bị chặn.",
        handsOn: "Hãy dùng Xe trắng ở a1 ăn Tốt đen ở a7!",
        twist: "Bây giờ có 2 Tốt đen ở a7 và h1. Hãy ăn quân nào không bị bảo vệ!",
        wrapUp: "Xuất sắc! Xe là pháo đài di động, rất mạnh trong trận chiến!"
    },
    'Bishop': {
        hook: "Tượng là kẻ đi chéo bí ẩn, luôn trung thành với màu ô của mình!",
        demonstration: "Tượng chỉ đi chéo và mãi mãi ở trên màu ô ban đầu (trắng hoặc đen).",
        handsOn: "Hãy di chuyển Tượng trắng từ c1 đến h6 bằng đường chéo!",
        twist: "Có 2 Tốt đen ở e3 và g5. Tượng của bạn có thể ăn cả hai không? Hãy thử!",
        wrapUp: "Tuyệt vời! Bạn đã thành thạo nghệ thuật đi chéo!"
    },
    'Knight': {
        hook: "Mã là kỵ sĩ nhảy cóc! Nó nhảy hình chữ 'L' và có thể nhảy qua đầu các quân khác!",
        demonstration: "Mã đi 2 ô theo một hướng, rồi 1 ô vuông góc (hoặc ngược lại), tạo thành hình chữ L.",
        handsOn: "Hãy di chuyển Mã trắng từ g1 đến f3!",
        twist: "Bàn cờ đầy quân, nhưng Mã vẫn nhảy được! Hãy nhảy từ b1 đến c3 qua đầu các Tốt!",
        wrapUp: "Tuyệt đỉnh! Mã là quân cờ khó chịu nhất với khả năng nhảy độc đáo!"
    },
    'Queen': {
        hook: "Hậu là nữ hoàng quyền lực! Cô ấy kết hợp sức mạnh của cả Xe và Tượng!",
        demonstration: "Hậu có thể đi ngang, dọc, và chéo không giới hạn - mạnh nhất trên bàn cờ!",
        handsOn: "Hãy dùng Hậu trắng dọn sạch 3 Tốt đen trên bàn cờ!",
        twist: "Bây giờ có 5 quân đen! Hãy ăn hết trong ít nước đi nhất!",
        wrapUp: "Phi thường! Hậu là vũ khí tối thượng, nhưng hãy cẩn thận bảo vệ cô ấy!"
    },
    'King': {
        hook: "Vua là trái tim của vương quốc! Nếu Vua ngã, trận chiến kết thúc!",
        demonstration: "Vua di chuyển 1 ô theo mọi hướng. Vua phải luôn được bảo vệ!",
        handsOn: "Hãy di chuyển Vua trắng từ e4 đến vị trí an toàn, tránh xa Xe đen!",
        twist: "Vua đang bị chiếu! Hãy di chuyển Vua đến ô an toàn duy nhất!",
        wrapUp: "Tuyệt vời! Bảo vệ Vua là nhiệm vụ quan trọng nhất trong cờ vua!"
    },

    // Cấp độ 2: Luật chơi & Trạng thái
    'Check': {
        hook: "Chiếu! Khi Vua bị tấn công, bạn phải cứu ngài ngay lập tức!",
        demonstration: "Vua đang bị chiếu khi một quân đối phương có thể ăn Vua ở nước đi tiếp theo.",
        handsOn: "Xe đen đang chiếu Vua trắng! Hãy nhận ra và di chuyển Vua thoát chiếu!",
        twist: "Lần này có 3 cách thoát chiếu: Chạy, Chặn, hoặc Ăn. Hãy chọn cách tốt nhất!",
        wrapUp: "Xuất sắc! Bạn đã biết cách nhận ra và thoát khỏi thế chiếu!"
    },
    'Checkmate': {
        hook: "Chiếu hết - Game Over! Khi Vua bị chiếu và không còn đường thoát!",
        demonstration: "Chiếu hết xảy ra khi Vua bị chiếu và không thể chạy, chặn, hay ăn quân tấn công.",
        handsOn: "Hãy thực hiện nước đi cuối cùng để chiếu hết Vua đen!",
        twist: "Tìm cách chiếu hết trong 2 nước đi! Hậu và Xe phối hợp!",
        wrapUp: "Tuyệt đỉnh! Bạn đã thành thạo nghệ thuật chiếu hết!"
    },
    'Castling': {
        hook: "Nhập thành - nước đi phòng thủ tối thượng! Vua trốn vào pháo đài an toàn!",
        demonstration: "Vua di chuyển 2 ô về phía Xe, Xe nhảy qua Vua. Điều kiện: cả hai chưa di chuyển, đường đi thông thoáng.",
        handsOn: "Hãy thực hiện nhập thành gần (về phía h1) với Vua và Xe!",
        twist: "Bây giờ thử nhập thành xa (về phía a1). Cẩn thận kiểm tra điều kiện!",
        wrapUp: "Hoàn hảo! Nhập thành sớm là bí quyết bảo vệ Vua!"
    },
    'Promotion': {
        hook: "Phong cấp Tốt - phần thưởng cho sự kiên trì! Tốt có thể trở thành Hậu!",
        demonstration: "Khi Tốt đến hàng cuối cùng (hàng 8 với trắng, hàng 1 với đen), nó biến thành Hậu, Xe, Tượng, hoặc Mã!",
        handsOn: "Hãy đưa Tốt trắng từ a7 lên a8 và chọn biến thành Hậu!",
        twist: "Lần này hãy chọn biến thành Mã để tạo ra chiếu hết ngay lập tức!",
        wrapUp: "Tuyệt vời! Tốt nhỏ bé có thể trở thành anh hùng!"
    },
    'En Passant': {
        hook: "Bắt Tốt qua đường - luật 'hack não' nhất trong cờ vua!",
        demonstration: "Khi Tốt đối phương đi 2 ô vượt qua Tốt của bạn, bạn có thể bắt nó như thể nó chỉ đi 1 ô!",
        handsOn: "Tốt đen vừa đi từ d7 lên d5. Hãy dùng Tốt trắng ở e5 bắt qua đường!",
        twist: "Cẩn thận! Bạn chỉ có 1 nước để thực hiện en passant, sau đó cơ hội mất!",
        wrapUp: "Phi thường! Bạn đã thành thạo luật khó nhất trong cờ vua!"
    },

    // Cấp độ 3: Chiến thuật Cơ bản
    'Piece Value': {
        hook: "Biết giá trị quân cờ giúp bạn đánh đổi thông minh! Hậu > Xe > Tượng/Mã > Tốt!",
        demonstration: "Hậu = 9 điểm, Xe = 5, Tượng/Mã = 3, Tốt = 1. Đừng đổi Hậu lấy Tốt!",
        handsOn: "Hậu trắng có thể ăn Tốt hoặc Xe đen. Hãy chọn mục tiêu có giá trị cao hơn!",
        twist: "Bây giờ bạn có thể ăn Xe nhưng sẽ bị mất Hậu. Có nên đổi không?",
        wrapUp: "Tuyệt vời! Bạn đã hiểu cách đánh giá và đánh đổi quân cờ!"
    },
    'Fork': {
        hook: "Đòn tấn công đôi - một mũi tên trúng hai đích! Đặc sản của quân Mã!",
        demonstration: "Fork là khi một quân tấn công đồng thời 2 hoặc nhiều quân đối phương.",
        handsOn: "Hãy nhảy Mã trắng vào vị trí tấn công cùng lúc Vua và Hậu đen!",
        twist: "Tìm vị trí Mã có thể fork 3 quân cùng lúc: Vua, Hậu, và Xe!",
        wrapUp: "Xuất sắc! Fork là vũ khí lợi hại để giành lợi thế!"
    },
    'Pin': {
        hook: "Đòn ghim - 'đóng băng' quân đối phương! Họ không dám di chuyển!",
        demonstration: "Pin xảy ra khi một quân không thể di chuyển vì sẽ để lộ quân quan trọng hơn phía sau.",
        handsOn: "Hãy dùng Tượng trắng ghim quân Mã đen vào Vua đen!",
        twist: "Bây giờ hãy ghim Hậu đen vào Vua bằng Xe trắng!",
        wrapUp: "Tuyệt đỉnh! Đòn ghim là kỹ thuật chiến thuật quan trọng!"
    },
    'Skewer': {
        hook: "Đòn xiên - ngược lại với ghim! Tấn công quân giá trị cao, ăn quân phía sau!",
        demonstration: "Skewer buộc quân giá trị cao phải chạy, để lộ quân giá trị thấp hơn phía sau.",
        handsOn: "Hãy dùng Xe trắng tấn công Vua đen, buộc Vua chạy và ăn Hậu phía sau!",
        twist: "Tìm cách xiên Hậu đen để ăn Xe đằng sau!",
        wrapUp: "Hoàn hảo! Skewer là đòn chiến thuật cực kỳ hiệu quả!"
    },
    'Discovered Attack': {
        hook: "Tấn công mở - 'núp lùm'! Di chuyển một quân để mở đường cho quân khác!",
        demonstration: "Khi bạn di chuyển một quân, nó mở đường cho quân đằng sau tấn công.",
        handsOn: "Hãy di chuyển Mã trắng để mở đường cho Tượng tấn công Hậu đen!",
        twist: "Lần này di chuyển Mã VÀ tấn công một quân khác cùng lúc!",
        wrapUp: "Phi thường! Discovered attack là đòn combo cực mạnh!"
    },

    // Cấp độ 4: Nguyên tắc Chiến lược
    'Center Control': {
        hook: "Ai nắm trung tâm, người đó nắm thế trận! 4 ô giữa là chìa khóa chiến thắng!",
        demonstration: "Kiểm soát e4, d4, e5, d5 giúp quân cờ di chuyển linh hoạt hơn.",
        handsOn: "Hãy đưa Tốt trắng vào ô e4 để kiểm soát trung tâm!",
        twist: "Đối thủ cũng muốn trung tâm! Hãy tranh giành và bảo vệ ô d4!",
        wrapUp: "Tuyệt vời! Kiểm soát trung tâm là nền tảng chiến lược!"
    },
    'Piece Development': {
        hook: "Đừng để Mã và Tượng 'ngủ' ở nhà! Phát triển quân nhanh chóng!",
        demonstration: "Đưa Mã và Tượng ra các vị trí tốt trong những nước đầu tiên.",
        handsOn: "Hãy đưa cả 2 Mã và 2 Tượng ra khỏi hàng xuất phát trong 6 nước!",
        twist: "Phát triển quân VÀ kiểm soát trung tâm cùng lúc!",
        wrapUp: "Xuất sắc! Phát triển nhanh là chìa khóa thắng lợi!"
    },
    'King Safety': {
        hook: "An toàn Vua là trên hết! Nhập thành sớm để bảo vệ ngài!",
        demonstration: "Vua ở giữa bàn cờ rất nguy hiểm. Nhập thành để đưa Vua vào góc an toàn.",
        handsOn: "Hãy nhập thành trong 3 nước đầu tiên!",
        twist: "So sánh: Vua ở giữa bị tấn công vs Vua đã nhập thành an toàn!",
        wrapUp: "Hoàn hảo! Vua an toàn = chiến thắng đảm bảo!"
    },

    // Cấp độ 5: Kết thúc cơ bản
    'King Queen vs King': {
        hook: "Kỹ thuật 'Nụ hôn thần chết'! Hậu và Vua phối hợp để chiếu hết!",
        demonstration: "Dùng Hậu cắt không gian, Vua hỗ trợ, dồn Vua đối phương vào góc.",
        handsOn: "Hãy phối hợp Vua và Hậu trắng để dồn Vua đen vào góc h8!",
        twist: "Cẩn thận! Đừng để Vua đen bị stalemate (hòa)!",
        wrapUp: "Tuyệt đỉnh! Bạn đã thành thạo kỹ thuật chiếu hết cơ bản nhất!"
    },
    'King Rook vs King': {
        hook: "Kỹ thuật 'Thu hẹp cái hộp'! Xe cắt từng hàng, Vua hỗ trợ!",
        demonstration: "Dùng Xe cắt các hàng ngang/dọc, thu hẹp không gian của Vua đối phương.",
        handsOn: "Hãy dùng Xe trắng cắt từng hàng ngang, đẩy Vua đen lên hàng 8!",
        twist: "Bây giờ Vua trắng phải tiến lên hỗ trợ để chiếu hết!",
        wrapUp: "Hoàn hảo! Bạn đã thành thạo kỹ thuật chiếu hết bằng Xe!"
    },

    // Các lesson khác (giữ nguyên hoặc thêm sau)
    'Stalemate': {
        hook: "Stalemate - hòa cờ! Khi Vua không bị chiếu nhưng không có nước đi hợp lệ!",
        demonstration: "Nếu đến lượt bạn nhưng mọi nước đi đều khiến Vua bị chiếu, đó là stalemate.",
        handsOn: "Nhận ra tình huống stalemate trên bàn cờ!",
        twist: "Tránh stalemate khi bạn đang thắng thế!",
        wrapUp: "Tuyệt vời! Bạn đã hiểu luật stalemate!"
    },
    'Insufficient Material': {
        hook: "Không đủ quân để chiếu hết - trận đấu hòa!",
        demonstration: "Chỉ còn 2 Vua, hoặc Vua + Tượng/Mã không thể chiếu hết.",
        handsOn: "Nhận ra các tình huống không đủ quân!",
        twist: "Vua + Tượng có thể chiếu hết không?",
        wrapUp: "Xuất sắc! Bạn đã hiểu luật hòa cờ!"
    },
    'Threefold Repetition': {
        hook: "Lặp lại 3 lần - hòa cờ! Cùng một thế cờ xuất hiện 3 lần!",
        demonstration: "Nếu cùng một vị trí lặp lại 3 lần, có thể yêu cầu hòa.",
        handsOn: "Tạo ra tình huống lặp lại bằng cách di chuyển Mã qua lại!",
        twist: "Sử dụng luật này để thoát khỏi thế thua!",
        wrapUp: "Tuyệt vời! Bạn đã biết cách dùng luật lặp lại!"
    },
};
