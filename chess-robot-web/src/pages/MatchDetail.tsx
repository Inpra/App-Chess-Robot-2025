import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, User, Cpu, SkipBack, SkipForward } from 'lucide-react';
import '../styles/MatchDetail.css';

// Chess piece images
import chessboard from '../assets/chessboard.png';
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

// Initial board state (8x8 = 64 squares)
const initialBoard = [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' },
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' },
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' },
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' },
];

export default function MatchDetail() {
    // const { id } = useParams(); // Unused for now
    const navigate = useNavigate();
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [board] = useState(initialBoard); // setBoard unused

    // Mock Moves
    const moves = [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7',
        'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7',
        'c4', 'c6', 'cxb5', 'axb5', 'Nc3', 'Bb7', 'Bg5', 'h6', 'Bh4', 'Re8',
    ];

    const handleNextMove = () => {
        if (currentMoveIndex < moves.length) {
            setCurrentMoveIndex(prev => prev + 1);
        }
    };

    const handlePrevMove = () => {
        if (currentMoveIndex > 0) {
            setCurrentMoveIndex(prev => prev - 1);
        }
    };

    const getPieceImage = (type: string, color: string) => {
        const pieceKey = `${color}${type}`;
        const pieceMap: Record<string, string> = {
            'wp': wp, 'wr': wr, 'wn': wn, 'wb': wb, 'wq': wq, 'wk': wk,
            'bp': bp, 'br': br, 'bn': bn, 'bb': bb, 'bq': bq, 'bk': bk,
        };
        return pieceMap[pieceKey];
    };

    return (
        <div className="match-detail-container">
            {/* Header */}
            <div className="match-detail-header">
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="match-detail-title">Match Replay</h2>
                <div style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <Share2 size={24} color="var(--color-text)" />
                </div>
            </div>

            <div className="match-detail-content">
                {/* Match Info */}
                <div className="match-info-card">
                    <div className="player-info">
                        <div className="avatar-container">
                            <User size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div className="player-name">You</div>
                            <div className="player-elo">2450</div>
                        </div>
                    </div>
                    <div className="score-container">
                        <div className="score-text">1 - 0</div>
                        <div className="result-text">Win</div>
                    </div>
                    <div className="player-info">
                        <div className="avatar-container">
                            <Cpu size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div className="player-name">Robot</div>
                            <div className="player-elo">2438</div>
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="main-layout">
                    {/* Left Column - Board */}
                    <div className="left-column">
                        <div className="board-container">
                            <div className="board-placeholder">
                                <img
                                    src={chessboard}
                                    alt="Chessboard"
                                    className="board-image"
                                />
                                <div className="grid-overlay">
                                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                                        Array.from({ length: 8 }).map((_, colIndex) => {
                                            const index = rowIndex * 8 + colIndex;
                                            const piece = board[index];
                                            return (
                                                <div key={`${rowIndex}-${colIndex}`} className="square">
                                                    {piece && (
                                                        <img
                                                            src={getPieceImage(piece.type, piece.color)}
                                                            alt={`${piece.color}${piece.type}`}
                                                            className="piece-image"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Move List */}
                    <div className="right-column">
                        <div className="move-list-container">
                            <h3 className="move-list-title">Move List</h3>
                            <div className="move-list-scroll">
                                <div className="move-grid">
                                    {moves.map((move, index) => (
                                        <div
                                            key={index}
                                            className={`move-item ${index === currentMoveIndex - 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentMoveIndex(index + 1)}
                                        >
                                            <span className="move-item-text">
                                                {index % 2 === 0 ? `${index / 2 + 1}.` : ''} {move}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="controls-container">
                                <button
                                    className="control-button"
                                    onClick={handlePrevMove}
                                    disabled={currentMoveIndex === 0}
                                >
                                    <SkipBack size={24} color={currentMoveIndex === 0 ? '#D1D5DB' : 'var(--color-text)'} />
                                </button>

                                <div className="move-display">
                                    <span className="move-text">
                                        {currentMoveIndex > 0 ? `${Math.ceil(currentMoveIndex / 2)}. ${moves[currentMoveIndex - 1]}` : 'Start'}
                                    </span>
                                </div>

                                <button
                                    className="control-button"
                                    onClick={handleNextMove}
                                    disabled={currentMoveIndex === moves.length}
                                >
                                    <SkipForward size={24} color={currentMoveIndex === moves.length ? '#D1D5DB' : 'var(--color-text)'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
